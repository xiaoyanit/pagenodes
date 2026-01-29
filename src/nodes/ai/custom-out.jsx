/**
 * Tool Out Node - Returns result from a custom tool flow
 */
export const toolOutNode = {
  type: 'tool-out',
  category: 'ai',
  description: 'Returns the result of a custom tool to the AI',
  paletteLabel: 'tool out',
  label: (node) => node.name || 'tool out',
  color: '#a66bbf',  // Purple for AI nodes
  fontColor: '#fff',
  icon: true,
  faChar: '\uf0ad',  // wrench
  faColor: 'rgba(255,255,255,0.9)',

  inputs: 1,
  outputs: 0,

  defaults: {},

  messageInterface: {
    reads: {
      payload: {
        type: 'any',
        description: 'Result to return to the AI'
      },
      _toolRequest: {
        type: 'object',
        description: 'Internal: request context from tool-in node'
      }
    }
  },

  renderHelp() {
    return (
      <>
        <p>Returns the result of a custom tool execution back to the AI agent. Must receive a message from a <strong>tool-in</strong> node (which provides the internal request context).</p>

        <h5>Input</h5>
        <ul>
          <li><code>msg.payload</code> - The result to return to the AI (any type)</li>
          <li><code>msg._toolRequest</code> - Internal context from tool-in node (passed through automatically)</li>
        </ul>

        <h5>Usage</h5>
        <p>Wire this node at the end of your custom tool flow. The <code>msg.payload</code> will be returned as the tool's result.</p>

        <h5>Example Flow</h5>
        <pre>{`[tool-in: get_weather]
    -> [http request: weather API]
    -> [function: format result]
    -> [tool-out]`}</pre>
      </>
    );
  }
};
