import { readFileSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse } from 'yaml';
import { files, localFile } from './lib.mjs';

const roles = [
  'entry',
  'research',
  'skill_evaluation',
  'rules',
  'patterns',
  'enforcement',
  'verification',
];
export const areas = [
  'product-risk',
  'runtime-deployment',
  'responsibilities',
  'repository-structure',
  'language-conventions',
  'api-contracts',
  'data-persistence',
  'identity-security',
  'frontend-interaction',
  'background-concurrency',
  'local-development',
  'verification-strategy',
  'performance-reliability',
  'ci-review',
  'build-supply-chain',
  'release-distribution',
  'cd-infrastructure',
  'operations-recovery',
  'agent-guidance',
  'maintenance-handoff',
];
const core = [
  'responsibilities',
  'repository-structure',
  'language-conventions',
  'api-contracts',
  'data-persistence',
  'identity-security',
  'verification-strategy',
  'agent-guidance',
];
const requireRule = (condition, message) => {
  if (!condition) throw new Error(message);
};

function links(root, file) {
  const source = readFileSync(file, 'utf8').replace(/```[\s\S]*?```/g, '');
  return [...source.matchAll(/\[[^\]]*\]\(([^\s)]+)\)/g)].flatMap((match) => {
    const link = match[1];
    if (/^[a-z]+:/i.test(link) || link.startsWith('#')) return [];
    const path = decodeURIComponent(link.split('#')[0]);
    const target = relative(root, resolve(dirname(file), path));
    return [localFile(root, target)];
  });
}

export function validateWorkflow(path) {
  const workflow = parse(readFileSync(path, 'utf8'));
  requireRule(
    workflow && workflow.on && workflow.jobs,
    `CI-01: malformed workflow ${path}`,
  );
  requireRule(
    !Object.hasOwn(workflow.on, 'pull_request_target'),
    'CI-01: pull_request_target is forbidden',
  );
  requireRule(
    workflow.permissions?.contents === 'read' &&
      Object.keys(workflow.permissions).length === 1,
    'CI-01: workflow must use only contents:read',
  );
  requireRule(
    Object.hasOwn(workflow.on, 'pull_request') &&
      Object.hasOwn(workflow.on, 'push'),
    'CI-01: missing PR/push trigger',
  );
  for (const trigger of Object.values(workflow.on)) {
    requireRule(
      !trigger?.paths && !trigger?.['paths-ignore'],
      'CI-01: required workflow cannot use path filters',
    );
  }
  const gate = workflow.jobs.quality;
  requireRule(
    gate && !Object.hasOwn(gate, 'if') && !gate['continue-on-error'],
    'CI-01: quality gate must run and propagate failure',
  );
  requireRule(
    gate.steps?.some((step) => step.run === 'npm run check'),
    'CI-01: quality gate must call npm run check',
  );
  for (const job of Object.values(workflow.jobs)) {
    requireRule(
      job['runs-on'] === 'ubuntu-24.04',
      'CI-01: use the approved ephemeral runner',
    );
    requireRule(
      Number.isInteger(job['timeout-minutes']) && job['timeout-minutes'] <= 30,
      'CI-01: bounded job timeout required',
    );
    requireRule(
      !job.permissions && !job['continue-on-error'],
      'CI-01: job cannot override privileges/failure policy',
    );
    for (const step of job.steps ?? []) {
      requireRule(
        !Object.hasOwn(step, 'if') && !step['continue-on-error'],
        'CI-01: required steps cannot silently skip/fail',
      );
      if (step.uses)
        requireRule(
          /^[\w.-]+\/[\w./-]+@[a-f0-9]{40}$/.test(step.uses),
          'CI-01: action must be pinned to a full commit',
        );
      if (step.run)
        requireRule(
          !/\|\|\s*true|\$\{\{\s*github\.event/.test(step.run),
          'CI-01: hidden failure/untrusted shell interpolation',
        );
    }
  }
}

export function validate(root) {
  root = resolve(root);
  const index = JSON.parse(
    readFileSync(localFile(root, 'docs/engineering/foundation.json'), 'utf8'),
  );
  requireRule(index.schema_version === 1, 'AGENT-01: invalid manifest schema');
  requireRule(
    ['ready', 'partial', 'blocked'].includes(index.status),
    'AGENT-01: invalid outcome',
  );
  const artifacts = Object.fromEntries(
    roles.map((role) => [role, localFile(root, index.artifacts?.[role])]),
  );
  const entryLinks = links(root, artifacts.entry);
  for (const role of ['rules', 'patterns', 'skill_evaluation'])
    requireRule(
      entryLinks.includes(artifacts[role]),
      `AGENT-01: entry must route ${role}`,
    );
  const skillLinks = links(root, artifacts.skill_evaluation);
  requireRule(
    Array.isArray(index.skills) && index.skills.length > 0,
    'AGENT-01: no persistent skills',
  );
  const names = new Set();
  for (const skill of index.skills) {
    const path = localFile(root, skill.path);
    requireRule(
      skillLinks.includes(path),
      `AGENT-01: unrouted skill ${skill.name}`,
    );
    requireRule(
      !names.has(skill.name) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(skill.name),
      'AGENT-01: invalid/duplicate skill',
    );
    names.add(skill.name);
    const text = readFileSync(path, 'utf8');
    const parts = text.split('---');
    const metadata = parse(parts[1] ?? '');
    requireRule(
      text.startsWith('---\n') &&
        metadata?.name === skill.name &&
        metadata.description &&
        parts.slice(2).join('---').trim(),
      `AGENT-01: invalid skill content ${skill.name}`,
    );
    for (const key of ['source', 'revision', 'license'])
      requireRule(
        typeof skill[key] === 'string' && skill[key].trim(),
        `AGENT-01: missing skill ${key}`,
      );
    requireRule(
      Array.isArray(skill.tasks) && skill.tasks.length > 0,
      'AGENT-01: missing skill tasks',
    );
  }
  for (const area of areas) {
    const item = index.areas?.[area];
    requireRule(
      item &&
        ['resolved', 'deferred', 'blocked', 'not-applicable'].includes(
          item.status,
        ) &&
        item.detail?.trim(),
      `AGENT-01: missing coverage ${area}`,
    );
  }
  requireRule(
    Array.isArray(index.blockers) && Array.isArray(index.exceptions),
    'AGENT-01: missing blockers/exceptions',
  );
  const review = index.substantive_review;
  requireRule(
    review &&
      ['pending', 'pass', 'fail'].includes(review.status) &&
      ['self', 'independent'].includes(review.mode) &&
      review.reviewer,
    'AGENT-01: invalid substantive review',
  );
  localFile(root, review.evidence);
  if (index.status === 'ready') {
    requireRule(
      review.status === 'pass' &&
        !index.blockers.length &&
        !index.exceptions.length,
      'AGENT-01: unsupported ready claim',
    );
    requireRule(
      !areas.some((area) => index.areas[area].status === 'blocked') &&
        !core.some((area) => index.areas[area].status === 'deferred'),
      'AGENT-01: unresolved core decisions',
    );
  }
  for (const file of files(root)) {
    if (file.endsWith('.md')) links(root, file);
    if (/\.github\/workflows\/.*\.ya?ml$/.test(file)) validateWorkflow(file);
    if (file.endsWith('.yaml') || file.endsWith('.yml'))
      parse(readFileSync(file, 'utf8'));
  }
  return index.status;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  try {
    const status = validate(process.cwd());
    console.log(
      `Foundation structure/configuration PASS; recorded outcome: ${status}. No product or substantive-review certification.`,
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
