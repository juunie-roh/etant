import { SymbexError, SymbexErrorCode } from "@/common/error";

type WorkspaceErrorCode = Extract<SymbexErrorCode, `WORKSPACE_${string}`>;

class WorkspaceError extends SymbexError {
  constructor(
    code: WorkspaceErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(code, message, options);
  }
}

export default WorkspaceError;
