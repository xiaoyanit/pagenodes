/**
 * Tool Out Node - Runtime implementation
 *
 * Returns the result of a custom tool execution back to the AI agent.
 */
export const toolOutRuntime = {
  type: 'tool-out',

  onInit() {
    this.status({ text: 'Ready', fill: 'green' });
  },

  onInput(msg) {
    const toolRequest = msg._toolRequest;

    if (!toolRequest || !toolRequest.requestId) {
      this.status({ text: 'No request', fill: 'yellow' });
      this.warn('No _toolRequest context found. Wire this node to a tool-in node.');
      return;
    }

    const { requestId } = toolRequest;
    const pending = globalThis._customToolRequests?.get(requestId);

    if (!pending) {
      this.status({ text: 'Expired', fill: 'yellow' });
      this.warn(`Request ${requestId} not found or already completed (may have timed out)`);
      return;
    }

    // Clear timeout and resolve the promise
    clearTimeout(pending.timeout);
    globalThis._customToolRequests.delete(requestId);

    // Return the result
    pending.resolve(msg.payload);

    this.status({ text: 'Sent', fill: 'green' });

    // Reset status after a moment
    setTimeout(() => {
      this.status({ text: 'Ready', fill: 'green' });
    }, 1000);
  }
};
