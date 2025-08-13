#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { GetToolsTool } from "./tools/get-tools";
import { ToolCallTool } from "./tools/tool-call";
import { GetFlowTool } from "./tools/get-flow";

const server = new McpServer({
  name: "veyrax-mcp",
  version: "0.0.1",
});

new GetToolsTool().register(server);
new ToolCallTool().register(server);
new GetFlowTool().register(server);

const transport = new StdioServerTransport();

server.connect(transport);
