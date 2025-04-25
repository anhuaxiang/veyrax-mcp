import { z } from "zod";
import { BaseTool } from "../lib/base-tool";
import { veyraxClient } from "../lib/client";

const toolName = "get_tools";
const toolDescription = `
"Use this tool to retrieve a list of available tools from the Veyrax API.
This will return dynamic tools that user has access to.
You can use this tool to get the list of tools, method names and parameters, and then use tool_call tool to call the tool with the provided parameters.
This method also returns all flows with name and id that user has access to (if any).
"
`;

export class GetToolsTool extends BaseTool {
  name = toolName;
  description = toolDescription;

  schema = z.object({
    question: z.string()
      .describe("Query question that you want find answer for. Try to ALWAYS provide this field based on conversation with user. Could be your reasoning for calling tool."),
    tool: z.string()
      .describe("Guess the tool name. Use explicit information based on the user's request or make an educated guess. It will be used for vector search for identifying the most relevant tools.")
  });

  async execute({ question, tool }: z.infer<typeof this.schema>) {
    try {
      let url = '/get-tools';
      const params = new URLSearchParams();
      
      if (question) params.append('question', question);
      if (tool) params.append('tool', tool);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const { data } = await veyraxClient.get(url);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      throw error;
    }
  }
}