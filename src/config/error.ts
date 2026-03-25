import { SymbexError, SymbexErrorCode } from "@/common/error";

type ConfigErrorCode = Extract<SymbexErrorCode, `CONFIG_${string}`>;

class ConfigError extends SymbexError {
  constructor(code: ConfigErrorCode, message: string, options?: ErrorOptions) {
    super(code, message, options);
  }
}

export default ConfigError;
