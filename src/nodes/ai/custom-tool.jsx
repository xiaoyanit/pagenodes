/**
 * Tool In Node - Defines an AI-callable tool backed by a flow
 */
export const toolInNode = {
  type: 'tool-in',
  category: 'ai',
  description: 'Defines a custom tool and receives calls to it from an AI agent',
  paletteLabel: 'tool in',
  label: (node) => node.name || node.toolName || 'tool in',
  color: '#a66bbf',  // Purple for AI nodes
  fontColor: '#fff',
  icon: true,
  faChar: '\uf0ad',  // wrench
  faColor: 'rgba(255,255,255,0.9)',

  inputs: 0,
  outputs: 1,

  defaults: {
    toolName: {
      type: 'string',
      default: '',
      label: 'Tool Name',
      placeholder: 'get_weather',
      required: true,
      description: 'Name for the tool (no spaces, like a function name)'
    },
    description: {
      type: 'string',
      default: '',
      label: 'Description',
      placeholder: 'Gets the current weather for a location',
      description: 'Description of what this tool does (helps AI know when to use it)'
    }
  },

  messageInterface: {
    writes: {
      payload: {
        type: 'any',
        description: 'Payload from the message passed by the AI'
      },
      topic: {
        type: 'string',
        description: 'Topic from the message (if provided)'
      },
      _toolRequest: {
        type: 'object',
        description: 'Internal: request context for tool-out node'
      }
    }
  },

  renderHelp() {
    return (
      <>
        <p>Defines a custom tool that AI agents can call via MCP. When an AI calls this tool, the flow is triggered with the provided arguments in <code>msg.payload</code>.</p>

        <h5>Configuration</h5>
        <ul>
          <li><strong>Tool Name</strong> - Unique name for the tool (no spaces). This is how the AI will call it.</li>
          <li><strong>Description</strong> - Explains what the tool does. Good descriptions help the AI know when to use it.</li>
        </ul>

        <h5>Output</h5>
        <ul>
          <li><code>msg.payload</code> - The payload from the message passed by the AI</li>
          <li><code>msg.topic</code> - Optional topic from the message</li>
          <li><code>msg._toolRequest</code> - Internal context (pass through to tool-out)</li>
        </ul>

        <h5>Usage</h5>
        <p>Wire this node through your flow logic, then end with a <strong>tool-out</strong> node to return the result to the AI.</p>
      </>
    );
  }
};
