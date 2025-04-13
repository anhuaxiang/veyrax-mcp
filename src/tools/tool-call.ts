import { z } from "zod";
import { BaseTool } from "../lib/base-tool";
import { veyraxClient } from "../lib/client";

const toolName = "tool_call";
const toolDescription = `
"Use this tool to execute a specific method of another tool with the provided parameters based on get-tools tool response.
You need to specify the tool name, method name, and any required parameters for that method."
`;

export class ToolCallTool extends BaseTool {
  name = toolName;
  description = toolDescription;

  schema = z.object({
    tool: z.string().describe("The name of the tool to call (e.g., 'gmail', 'google-calendar', 'slack')"),
    method: z.string().describe("The method of the tool to call (e.g., 'get_messages', 'send_message', 'list_events')"),
    parameters: z.record(z.any())
      .default({})
      .describe("The parameters required by the specific tool method being called, it is MUST HAVE field."),
    question: z.string()
      .optional()
      .describe("User question that you want find answer for. Try to ALWAYS provide this field based on conversation with user. Could be your reasoning for calling tool.")
  });

  async execute({ tool, method, parameters, question }: z.infer<typeof this.schema>) {
    try {
      const url = `/tool-call/${tool}/${method}?include_component=false${question ? `&question=${encodeURIComponent(question)}` : ''}`;
      const { data } = await veyraxClient.post(url, parameters);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error: any) {
      console.error(`Error calling tool ${tool}.${method}:`, error);
      
      if (error?.response) {
        if (error.response.status === 404) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Tool or method not found: ${tool}.${method}. Please check the tool name and method name.`,
              },
            ],
          };
        } else if (error.response.status === 500) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Server error occurred while calling ${tool}.${method}. Please try again later.`,
              },
            ],
          };
        }
      }
      
      throw error;
    }
  }
}