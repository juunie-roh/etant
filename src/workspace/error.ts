import { EtantError, EtantErrorCode } from "@/common/error";

type WorkspaceErrorCode = Extract<EtantErrorCode, `WORKSPACE_${string}`>;

class WorkspaceError extends EtantError {
  constructor(
    code: WorkspaceErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(code, message, options);
  }
}

export default WorkspaceError;
