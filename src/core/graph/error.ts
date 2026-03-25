import { SymbexError, SymbexErrorCode } from "@/common/error";

type GraphErrorCode = Extract<SymbexErrorCode, `GRAPH_${string}`>;

class GraphError extends SymbexError {
  constructor(code: GraphErrorCode, message: string, options?: ErrorOptions) {
    super(code, message, options);
  }
}

export default GraphError;
