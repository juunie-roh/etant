import { SymbexError, SymbexErrorCode } from "@/common/error";

type QueryErrorCode = Extract<SymbexErrorCode, `QUERY_${string}`>;

class QueryError extends SymbexError {
  constructor(code: QueryErrorCode, message: string, options?: ErrorOptions) {
    super(code, message, options);
  }
}

export default QueryError;
