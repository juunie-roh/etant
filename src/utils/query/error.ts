import { EtantError, EtantErrorCode } from "@/common/error";

type QueryErrorCode = Extract<EtantErrorCode, `QUERY_${string}`>;

class QueryError extends EtantError {
  constructor(code: QueryErrorCode, message: string, options?: ErrorOptions) {
    super(code, message, options);
  }
}

export default QueryError;
