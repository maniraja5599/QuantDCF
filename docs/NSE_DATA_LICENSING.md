# NSE MCP Integration & Data Licensing Compliance

## 1. Official NSE MCP Endpoints

The National Stock Exchange of India (NSE) provides Model Context Protocol (MCP) endpoints for algorithmic and agentic access to market and historical data:

| Service | MCP Endpoint | Description |
|---|---|---|
| **Capital Market Live Quotes** | `https://mcp.nseindia.in/cmmkt/mcp` | Real-time and snapshot quote tools |
| **Historical Bhavcopy** | `https://mcp.nseindia.in/bhavcopy/cm/mcp` | Official daily price volume history |
| **Official Documentation** | `https://www.nseindia.com/nse-mcp` | Architecture and protocol guide |
| **NSE Data Policy** | `https://www.nseindia.com/static/market-data/nse-data-policy` | Legal distribution regulations |

---

## 2. MCP Protocol Implementation

The backend integrates via the `NSEMCPClient` (`services/api/app/providers/nse_mcp.py`), which uses the JSON-RPC 2.0 protocol over HTTP:

1. **Tool Discovery (`tools/list`)**: Probes the endpoint dynamically to discover registered tools (`get_quote`, `search_symbol`, etc.) rather than assuming arbitrary hardcoded schemas.
2. **Tool Invocation (`tools/call`)**: Executes validated tool calls with explicit parameter schemas and request timeouts.

---

## 3. Mandatory Licensing Gate

In accordance with Section 2 of the project specification and the official **NSE Data Policy**:

> [!WARNING]
> Access to live NSE MCP data for commercial SaaS or redistribution requires an active commercial licensing contract executed with NSE Data & Analytics Limited. Redistribution without approval violates exchange terms.

### The Compliance Gate Implementation

- Controlled by the environment variable:
  ```env
  NSE_DATA_LICENSE_APPROVED=false
  ```
- **When `false` (default)**:
  - The NSE provider adapter is locked in `RESTRICTED` mode.
  - Queries return an informative licensing notice explaining compliance requirements.
  - **Zero Fabrication Guarantee**: The application **never** falls back to random numbers or fabricated demo prices. Unverified symbols show a clean "Manual Entry / Statement Upload Required" state.
- **When `true`**:
  - Requires signed verification with NSE. The MCP client issues live requests to `https://mcp.nseindia.in/cmmkt/mcp`.
