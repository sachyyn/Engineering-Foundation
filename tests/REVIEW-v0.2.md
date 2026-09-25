# Independent review of the 0.2 correction

A separate Claude Code session received read-only access to SKILL.md, references, and the structural validator. It was instructed not to inspect the failed repository, trial artifacts, or prior evidence. Its review identified the following issues; findings were checked against the source before changes.

| Finding | Resolution |
| --- | --- |
| Structural validation cannot determine whether a self-reported substantive review is genuine. | Confirmed limitation, not something a file checker can solve. Kept the explicit separation between structural and substantive acceptance; added required `mode: self/independent` disclosure. Real output is also reviewed outside the setup agent during the behavioral trial. No automated quality-certification claim. |
| Deferred core decisions could coexist with a ready claim. | Fixed. Ready now rejects deferred responsibilities, structure, language conventions, API contracts, persistence, security, verification strategy, or agent guidance. Other justified deferrals still need substantive review. |
| Git ignore checks could silently be unavailable in a directory without a usable Git worktree. | Fixed. The CLI now explicitly reports that gap; a regression test covers it. It does not claim that files have been committed or hosted. |
| Generated-directory exclusions covered too few ecosystems. | Expanded the backstop for common Rust, .NET, mobile, and build/cache paths. These are known exclusions, not a complete substitute for Git inclusion and clean-copy review. |
| Illustrative snippets could be confused with product scaffolding. | Clarified the boundary: application examples stay in fenced documentation/SKILL blocks; standalone application source needs separate approval. |
| Markdown link checking supports inline links only. | Disclosed and required inline links for machine-checked routes. Other link formats need explicit review; a general Markdown parser was not added. |
| Low-risk research shortcut could be applied too broadly. | Clarified that it applies to formatting/naming, not auth, tenancy, contracts, validation, integrity, or failure handling. |
| Trial evidence was not bound to a source snapshot. | Recorded SHA-256 hashes of the exact skill/reference/script package used in the fresh-agent implementation trial. No release automation was introduced. |

The reviewer did not execute the validator. Executable evidence comes from the package's regression suite and subsequent target checks. A separate review of the generated foundation is needed; this source review does not certify its future outputs.
