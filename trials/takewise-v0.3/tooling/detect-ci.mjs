import { appendFileSync } from "node:fs";
import { productState } from "./foundation.mjs";
if (!process.env.GITHUB_OUTPUT) throw new Error("GITHUB_OUTPUT required");
for (const [name, active] of Object.entries(productState(process.cwd())))
  appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${active}\n`);
