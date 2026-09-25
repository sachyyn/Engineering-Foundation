import { readFileSync, readdirSync, existsSync, lstatSync } from "node:fs";
import { resolve, relative, dirname, extname } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseDocument } from "yaml";
export function assert(ok, message) {
  if (!ok) throw new Error(message);
}
const excluded = new Set([
  ".git",
  "node_modules",
  "vendor",
  ".tools",
  ".tooling-output",
  "dist",
  "coverage",
  "var",
  "test-results",
  "playwright-report",
]);
export function files(root, dir = root) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (excluded.has(e.name) || /^\.env(?:$|\.(?!example$))/.test(e.name))
      return [];
    const p = resolve(dir, e.name);
    assert(
      !lstatSync(p).isSymbolicLink(),
      `Path hygiene: symlink ${relative(root, p)}`,
    );
    return e.isDirectory() ? files(root, p) : [p];
  });
}
export function productState(root) {
  // Source directories also activate checks; deleting a manifest cannot disable a product.
  return Object.fromEntries(
    ["backend", "frontend"].map((name) => [
      name,
      existsSync(
        resolve(
          root,
          name === "backend"
            ? "backend/composer.json"
            : "frontend/package.json",
        ),
      ) ||
        existsSync(resolve(root, name, "src")) ||
        existsSync(resolve(root, name, "tests")),
    ]),
  );
}
export function workflowSafety(doc, path) {
  assert(
    doc.permissions &&
      Object.keys(doc.permissions).length === 1 &&
      doc.permissions.contents === "read",
    `${path}: readonly contents permission required`,
  );
  assert(
    doc.on && !("pull_request_target" in doc.on) && !("workflow_run" in doc.on),
    `${path}: privileged triggers prohibited`,
  );
  for (const event of [
    "pull_request",
    "push",
    "workflow_dispatch",
    "merge_group",
  ])
    assert(event in doc.on, `${path}: missing ${event} trigger`);
  assert(
    !JSON.stringify(doc.on).includes("paths"),
    `${path}: required checks must not be path-filtered`,
  );
  assert(
    doc.jobs?.quality?.name === "Takewise / quality",
    `${path}: required job name changed`,
  );
  assert(
    !("if" in doc.jobs.quality) && !("needs" in doc.jobs.quality),
    `${path}: quality must run unconditionally`,
  );
  for (const [name, job] of Object.entries(doc.jobs)) {
    assert(
      job["runs-on"] === "ubuntu-24.04",
      `${path}: use reviewed hosted runner`,
    );
    assert(
      Number.isInteger(job["timeout-minutes"]) && job["timeout-minutes"] <= 30,
      `${path}: bounded job timeout required`,
    );
    assert(
      !job.permissions && !job["continue-on-error"],
      `${path}: job privilege/error bypass`,
    );
    for (const step of job.steps ?? []) {
      assert(!step["continue-on-error"], `${path}: step error bypass`);
      if (step.uses)
        assert(
          /^[\w./-]+@[a-f0-9]{40}$/.test(step.uses),
          `${path}: action must use immutable SHA: ${step.uses}`,
        );
      if (step.run)
        assert(
          !/\|\|\s*true|secrets\.|github\.event\./.test(step.run),
          `${path}: unsafe shell or event interpolation`,
        );
    }
  }
}
export function check(root) {
  const load = (p) => readFileSync(resolve(root, p), "utf8");
  const tracked = spawnSync("git", ["ls-files", "-z"], {
    cwd: root,
    encoding: "utf8",
  });
  assert(tracked.status === 0, "Run checks in an initialized Git repository");
  for (const path of tracked.stdout.split("\0"))
    assert(
      !/(^|\/)\.env($|\.(?!example$))/.test(path),
      `Tracked secret environment file: ${path}`,
    );
  const index = JSON.parse(load("docs/engineering/foundation.json"));
  const roles = [
    "entry",
    "research",
    "skill_evaluation",
    "rules",
    "patterns",
    "enforcement",
    "verification",
  ];
  const local = (p) => {
    const full = resolve(root, p);
    assert(
      !relative(root, full).startsWith("..") && existsSync(full),
      `Missing or external route: ${p}`,
    );
    return full;
  };
  for (const role of roles) {
    assert(index.artifacts[role], `Missing artifact role: ${role}`);
    local(index.artifacts[role]);
  }
  const entry = load(index.artifacts.entry);
  for (const role of ["rules", "patterns", "skill_evaluation"])
    assert(
      entry.includes(`](${index.artifacts[role]})`),
      `Entry must route to ${role}`,
    );
  assert(
    load("CLAUDE.md").trim() === "@AGENTS.md",
    "CLAUDE.md must import the single entry",
  );
  assert(index.skills.length > 0, "No local skills");
  for (const skill of index.skills) {
    const body = readFileSync(local(skill.path), "utf8");
    assert(body.startsWith("---\n"), `${skill.path}: missing frontmatter`);
    const front = parseDocument(body.split("---")[1]);
    assert(
      !front.errors.length &&
        front.toJS().name === skill.name &&
        front.toJS().description,
      `${skill.path}: invalid metadata`,
    );
    assert(
      load(index.artifacts.skill_evaluation).includes(`](../../${skill.path})`),
      `Missing skill route: ${skill.name}`,
    );
    if (skill.license === "MIT") local(`${dirname(skill.path)}/LICENSE`);
  }
  for (const path of files(root)) {
    const rel = relative(root, path);
    assert(
      !/(^|\/)\.env($|\.(?!example$))/.test(rel),
      `Secret path must be ignored/excluded: ${rel}`,
    );
    if (
      ![".md", ".json", ".yaml", ".yml", ".mjs", ".ts", ".php"].includes(
        extname(path),
      )
    )
      continue;
    const text = readFileSync(path, "utf8");
    // Match actual machine paths; regex source itself contains no personal path.
    assert(
      !/(?:\/home\/[^/\s]+\/|\/Users\/[^/\s]+\/)/.test(text),
      `Machine path in ${rel}`,
    );
    if (extname(path) === ".json") JSON.parse(text);
    if ([".yaml", ".yml"].includes(extname(path))) {
      const doc = parseDocument(text);
      assert(!doc.errors.length, `Invalid YAML: ${rel}`);
      if (rel.startsWith(".github/workflows/")) workflowSafety(doc.toJS(), rel);
    }
    if (extname(path) === ".md") {
      for (const match of text
        .replace(/```[\s\S]*?```/g, "")
        .matchAll(/\[[^\]]*\]\(([^\s)]+)\)/g)) {
        const url = match[1].split("#")[0];
        if (!url || /^[a-z]+:/i.test(url)) continue;
        local(relative(root, resolve(dirname(path), decodeURIComponent(url))));
      }
    }
  }
  const compose = parseDocument(load("compose.yaml")).toJS();
  assert(
    compose.services.postgres && compose.services.mailpit,
    "Required local services missing",
  );
  for (const service of Object.values(compose.services)) {
    assert(
      service.image && !service.image.endsWith(":latest"),
      "Service image needs a version",
    );
    assert(
      service.ports.every((port) => port.startsWith("127.0.0.1:")),
      "Local services must bind loopback",
    );
  }
  console.log(
    `Foundation checks passed. Product activation: ${JSON.stringify(productState(root))}`,
  );
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  check(process.cwd());
