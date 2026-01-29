/**
 * Tool In Node - Runtime implementation
 *
 * Registers a custom tool that AI agents can call via MCP.
 * When called, triggers the flow with the provided arguments.
 */

// Global registry of custom tools (toolName -> node instance)
// This is populated by onInit and cleared by onClose
if (!globalThis._customTools) {
  globalThis._customTools = new Map();
}

// Pending tool requests waiting for responses (requestId -> { resolve, reject, timeout })
if (!globalThis._customToolRequests) {
  globalThis._customToolRequests = new Map();
}

export const toolInRuntime = {
  type: 'tool-in',

  onInit() {
    const toolName = this.config.toolName;

    if (!toolName) {
      this.status({ text: 'No name', fill: 'red' });
      this.error('Tool name is required');
      return;
    }

    // Validate tool name (no spaces, alphanumeric + underscore)
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(toolName)) {
      this.status({ text: 'Invalid name', fill: 'red' });
      this.error('Tool name must start with a letter or underscore and contain only letters, numbers, and underscores');
      return;
    }

    // Check for duplicate tool names
    if (globalThis._customTools.has(toolName)) {
      this.status({ text: 'Duplicate', fill: 'yellow' });
      this.warn(`Tool "${toolName}" is already defined by another node`);
    }

    // Register this tool
    globalThis._customTools.set(toolName, {
      nodeId: this.id,
      toolName,
      description: this.config.description || '',
      node: this
    });

    this.status({ text: toolName, fill: 'green' });
  },

  // Called by MCP handler when AI invokes this tool
  invoke(message, requestId) {
    // Merge incoming message with _toolRequest context
    const msg = {
      ...(message || {}),
      _toolRequest: {
        requestId,
        toolName: this.config.toolName,
        nodeId: this.id
      }
    };
    this.send(msg);
  },

  onClose() {
    const toolName = this.config.toolName;
    if (toolName && globalThis._customTools.get(toolName)?.nodeId === this.id) {
      globalThis._customTools.delete(toolName);
    }
  }
};
