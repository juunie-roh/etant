import { EtantError, EtantErrorCode } from "@/common/error";

type CoreErrorCode = Extract<EtantErrorCode, `CORE_${string}`>;

class CoreError extends EtantError {
  constructor(code: CoreErrorCode, message: string, options?: ErrorOptions) {
    super(code, message, options);
  }
}

export default CoreError;
