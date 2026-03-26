import { EtantError, EtantErrorCode } from "@/common/error";

type GraphErrorCode = Extract<EtantErrorCode, `GRAPH_${string}`>;

class GraphError extends EtantError {
  constructor(code: GraphErrorCode, message: string, options?: ErrorOptions) {
    super(code, message, options);
  }
}

export default GraphError;
