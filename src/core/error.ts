import { SymbexError, SymbexErrorCode } from "@/common/error";

type CoreErrorCode = Extract<SymbexErrorCode, `CORE_${string}`>;

class CoreError extends SymbexError {
  constructor(code: CoreErrorCode, message: string, options?: ErrorOptions) {
    super(code, message, options);
  }
}

export default CoreError;
