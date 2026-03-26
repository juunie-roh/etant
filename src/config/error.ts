import { EtantError, EtantErrorCode } from "@/common/error";

type ConfigErrorCode = Extract<EtantErrorCode, `CONFIG_${string}`>;

class ConfigError extends EtantError {
  constructor(code: ConfigErrorCode, message: string, options?: ErrorOptions) {
    super(code, message, options);
  }
}

export default ConfigError;
