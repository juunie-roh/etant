import { EtantError, EtantErrorCode } from "@/common/error";

type BinaryErrorCode = Extract<EtantErrorCode, `BIN_${string}`>;

class BinaryError extends EtantError {
  constructor(code: BinaryErrorCode, message: string, options?: ErrorOptions) {
    super(code, message, options);
  }
}

export default BinaryError;
