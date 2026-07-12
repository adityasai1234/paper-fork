import type { AuditContext } from "../../../convex/lib/fork_rules";
import {
  FIXTURE_CTX,
  FIXTURE_LIT,
  FIXTURE_METHODS,
  FIXTURE_REPO,
  FIXTURE_WEB,
} from "../rubric";

export {
  FIXTURE_CTX,
  FIXTURE_CTX_WITH_METHODS,
  FIXTURE_LIT,
  FIXTURE_METHODS,
  FIXTURE_REPO,
  FIXTURE_WEB,
} from "../rubric";

export function fixtureCtx(overrides: Partial<AuditContext> = {}): AuditContext {
  return {
    literature: overrides.literature ?? { ...FIXTURE_LIT },
    repo: overrides.repo ?? { ...FIXTURE_REPO, files: [...FIXTURE_REPO.files], metrics_found: [...FIXTURE_REPO.metrics_found] },
    web: overrides.web ?? { ...FIXTURE_WEB, external_metrics: [...FIXTURE_WEB.external_metrics] },
    methods: overrides.methods,
  };
}
