import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  { name: "openbrand-mcp", version: "0.1.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "extract_brand_assets",
      description:
        "Extract brand assets (logos, colors, backdrop images, brand name) from a website URL. Returns structured data with logo URLs, hex colors with usage hints, backdrop/OG images, and the detected brand name.",
      inputSchema: {
        type: "object" as const,
        properties: {
          url: {
            type: "string",
            description: "The website URL to extract brand assets from (e.g. https://stripe.com)",
          },
        },
        required: ["url"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name !== "extract_brand_assets") {
    return {
      content: [{ type: "text" as const, text: `Unknown tool: ${name}` }],
      isError: true,
    };
  }

  const apiKey = process.env.OPENBRAND_API_KEY;
  if (!apiKey) {
    return {
      content: [{
        type: "text" as const,
        text: "OPENBRAND_API_KEY is not set. Get your free API key at https://openbrand.sh/dashboard, then update your MCP config:\n\n"
          + '  claude mcp add --transport stdio --env OPENBRAND_API_KEY=your_key openbrand -- npx -y openbrand-mcp',
      }],
      isError: true,
    };
  }

  const url = args?.url as string;
  if (!url) {
    return {
      content: [{ type: "text" as const, text: "Missing required parameter: url" }],
      isError: true,
    };
  }

  try {
    const apiUrl = `https://openbrand.sh/api/extract?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const result = await response.json();

    if (!result.success) {
      return {
        content: [
          { type: "text" as const, text: result.error || "Failed to extract brand assets" },
        ],
        isError: true,
      };
    }

    return {
      content: [
        { type: "text" as const, text: JSON.stringify(result.data, null, 2) },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
