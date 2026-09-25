# Defaults and decision coverage

## Defaults to disclose and confirm

These are proposal defaults, not mandatory company policy. The first decision round opens with a Defaults table recommending apply, change, or don't use for each, with a reason. They are proposals for the lead, not settled facts. Existing sound conventions and explicit project choices take priority. Record changes once, with consequences where material.

| Topic | Candidate default | Adapt or omit when |
| --- | --- | --- |
| Version control | Git | The project has a different imposed system. Do not initialize or rewrite history without agreement. |
| Hosting and CI | GitHub and GitHub Actions | The existing/client platform differs. A host choice does not authorize remote setup. |
| Local services | Docker for reproducible services and suitable build/runtime environments | No services need it, native development is simpler, or licensing, hardware, OS, signing, or deployment constraints conflict. Do not require Docker merely to run a formatter. |
| Structure | The framework's conventional structure, adjusted for real responsibilities | Existing structure works, or independent components need actual package boundaries. |
| Dependencies | Existing tools, native capabilities, maintained stable releases | An agreed requirement needs a different option. Verify runtime support and license. |
| Reproducibility | Explicit supported runtime/tool versions and the ecosystem's standard lock/reproducibility mechanism | Library publishing or ecosystem conventions require another mechanism. Document deliberate ranges. |
| Checks | One discoverable local quality command, composed of established tools | Multiple independently built units need a small command map. CI still exercises every relevant unit. |
| Formatting and analysis | Ecosystem formatter plus meaningful compiler, type, and lint checks | The language or existing project has an appropriate alternative. Avoid arbitrary thresholds and duplicate tools. |
| Tests | Focused behavior, boundary, and failure-path tests | Select the level required by risk. No universal coverage percentage or test per function. |
| Architecture | Explicit ownership and dependency boundaries; simple deployment topology | Real requirements justify distribution, queues, plugins, or more layers. |
| Skills | Official vendor skills first, then well-maintained community skills, then project-authored skills for the project's own decisions; all copied into the repository | Reuse adequate local skills. Omitting this deliverable requires explicit scope reduction and a partial result. |
| Delivery | Quality gates before packaging/release; explicit production authorization | Distribution targets change the pipeline. Configuration is not deployment. |
| Security | Least privilege, no committed secrets, validation at trust boundaries | Adapt mechanisms, not factual security claims. Explain accepted risk and external obligations. |
| Updates | Explicit reassessment of the foundation | Dependency-check schedules are separate tooling and require agreement; no automatic policy rewriting. |

Do not inherit the authoring agent's personal stack, provider, style, or UI preferences as company defaults.

## Coverage ledger

Evaluate every row below. In the resulting project record, give each area a disposition: approved, proposed, blocked, deferred, or not applicable. Group related details under the area; avoid a separate document for every checkbox.

For approved consequential choices, capture: choice, reason, affected paths, evidence, check/review method, and revisit condition. For blocked or deferred areas, name the missing fact or trigger and the consequence for compliant development. For not-applicable areas, give a project-specific reason. Record all areas in the required artifact index using the IDs defined in the output contract.

Core architecture, skill installation, implementation rules, and representative patterns are due during foundation setup. Missing product code is not a reason to defer those decisions. Recommend an answer and obtain grouped agreement; defer only a genuinely dependent or intentionally excluded item. An area marked approved must contain more than a framework name or a future intention.

| Area | Questions to resolve when applicable |
| --- | --- |
| Product and risk | What ships, to whom, with which critical workflows? Data sensitivity, accessibility, availability, offline use, scale, retention, budget, contractual requirements? Avoid inventing numeric targets. |
| Runtime and deployment model | Web, desktop, mobile, embedded, CLI, service, library, data job? OS/CPU targets, runtime versions, hosting limits, network boundaries, installation/update model? |
| Responsibilities and boundaries | Where are business logic, authorization, persistence, UI, and integrations owned? Allowed dependency direction? Public versus internal modules? Sync versus async work? |
| Repository structure | Existing conventions? Single repository or multiple? Module/package boundaries, naming, entry points, generated sources, migrations, tests, ownership? Avoid empty speculative layers. |
| Language and coding conventions | Formatter, compiler/type strictness, lint rules, public APIs, error/result patterns, resource ownership, async/concurrency rules, precision and time handling, visibility, documentation expectations? |
| API and integration contracts | Schema authority, generation ownership, runtime validation, compatibility, pagination, error envelopes, idempotency, timeouts, retryability, cancellation, rate limits? |
| Data and persistence | Storage choice, schema boundaries, integrity constraints, query ownership, transactions, migrations, backward compatibility, backup/restoration, sensitive-data lifecycle? Product schemas remain separate work. |
| Identity and security | Session/token strategy, authorization boundary, tenancy isolation, secret contracts, input/output handling, abuse controls, threat-specific checks, dependency/license risk? |
| Frontend and interaction | Rendering model, state ownership, cache/data-fetching responsibilities, routing, forms, accessibility, design authority, errors/loading, localization, browser/device support, performance budgets? |
| Background work and concurrency | Task ownership, delivery semantics, deduplication, ordering, retries, dead-letter handling, limits, shutdown/cancellation, synchronization? Only where jobs/concurrency exist. |
| Local development | Clean setup, versions, package manager, lockfiles, safe environment examples, services, Docker suitability, test data, OS differences, repeatable commands? |
| Verification strategy | Unit/integration/contract/end-to-end checks selected by risk? Real dependencies versus proxies, fixtures, determinism, timing, data isolation, coverage scope, zero-test behavior? |
| Performance and reliability | User-visible budget, measurement method, load assumptions, failure modes, resource ceilings, timeout/retry policy, graceful degradation? No speculative benchmarks. |
| CI and change review | Triggers, changed-file selection, supported versions, read-only checks, security of untrusted PRs, required check names, policy changes, missing test handling, review responsibility? |
| Build and supply chain | Reproducible artifacts, dependency resolution, vulnerability/license checks, action pins, image provenance, generated-file freshness, artifact identity, attestations/SBOM when required? |
| Release and distribution | Versioning, compatibility promises, changelog, signing, registries/stores, release authorization, artifact retention, rollback or forward-fix constraints? |
| CD and infrastructure | Environment differences, promotion of tested artifacts, identities/secrets, ordering, migration safety, verification, rollback, deployment concurrency, activation safeguards? Write definitions only. |
| Operations and recovery | Logging/redaction, health checks, metrics, alert criteria, owners/runbooks, backup and restore checks, disaster recovery, incident evidence? Configure repo artifacts without contacting live systems. |
| Agent and contributor guidance | Entry documents, task-to-skill routing, authoritative rules, exceptions, evidence requirements, policy-change review, tool discovery limits? |
| Maintenance and handoff | Setup ownership, foundation source version, dependency update expectations, supported lifetimes, manual re-invocation triggers, deprecation process? No ongoing caretaker. |

## Decision precision

Replace slogans with observable contracts. Examples:

- Instead of "clean architecture," name the modules allowed to import each other and select an ecosystem-supported boundary check if available.
- Instead of "robust errors," define the public error schema, where translation happens, what logs contain, and which failures can be retried.
- Instead of "good testing," name the critical behaviors, the command, required environment, and what a passing result proves.
- Instead of "secure CI," state token permissions, fork behavior, action source/pins, secret exposure limits, and which settings are external prerequisites.

For Rust, investigate ownership/error conventions, feature flags, target-specific build/test behavior, formatting, linting, unsafe boundaries, and dependency policy as applicable. For Go, investigate module structure, context cancellation, error propagation, formatting, vet/static analysis, and race checks where relevant. For Python, investigate environments, dependency locks, imports, typing, async boundaries, linting, and test discovery. These are research prompts, not preset stack profiles.
