# Creating Custom Nodes for PageNodes

This guide explains how to create custom nodes for PageNodes or port existing Node-RED nodes.

## Node Structure

Each PageNodes node consists of two files:

1. **`nodename.js`** - Runtime logic (executes when the node receives a message)
2. **`nodename.jsx`** - UI definition (how the node appears in the editor)

Both files are placed in `src/nodes/{category}/`.

## Basic Example: Creating a "Double" Node

This node doubles any numeric payload it receives.

### Runtime (`src/nodes/logic/double.js`)

```javascript
export const doubleRuntime = {
  type: 'double',

  onInput(msg) {
    // Process the incoming message
    const value = Number(msg.payload);
    
    if (isNaN(value)) {
      this.error('Payload is not a number', msg);
      return;
    }
    
    // Modify the payload
    msg.payload = value * 2;
    
    // Send to the next node
    this.send(msg);
  }
};
```

### UI Definition (`src/nodes/logic/double.jsx`)

```jsx
export const doubleNode = {
  type: 'double',                          // Must match runtime type
  category: 'function',                    // Category in the palette
  description: 'Doubles a numeric value',  // Tooltip description
  label: (node) => node.name || 'double',  // Display name
  color: '#E2D96E',                        // Node color (hex)
  icon: true,                              // Use FontAwesome icon
  faChar: '\uf0d0',                        // FontAwesome character code
  inputs: 1,                               // Number of inputs (0 or 1)
  outputs: 1,                              // Number of outputs (0+)

  defaults: {
    // Configurable properties shown in the edit dialog
    name: { type: 'string', default: '' }
  },

  messageInterface: {
    reads: {
      payload: {
        type: 'number',
        description: 'The number to double'
      }
    },
    writes: {
      payload: {
        type: 'number',
        description: 'The doubled value'
      }
    }
  },

  renderHelp() {
    return (
      <>
        <p>Doubles any numeric value passed to it.</p>
        <h5>Input</h5>
        <p><code>msg.payload</code> - A number to double</p>
        <h5>Output</h5>
        <p><code>msg.payload</code> - The input multiplied by 2</p>
      </>
    );
  }
};
```

### Register the Node (`src/nodes/logic/index.js`)

Add exports to the category's index file:

```javascript
export { doubleNode } from './double.jsx';
export { doubleRuntime } from './double.js';
```

## Node Definition Properties

### Required Properties

| Property | Description |
|----------|-------------|
| `type` | Unique identifier (lowercase, no spaces) |
| `category` | Palette category: `input`, `output`, `function`, `logic`, `storage`, `network`, `parsers` |
| `inputs` | Number of input ports (0 or 1) |
| `outputs` | Number of output ports |

### Optional Properties

| Property | Description |
|----------|-------------|
| `color` | Hex color code for the node |
| `icon` | `true` to use FontAwesome icon |
| `faChar` | FontAwesome character code (e.g., `'\uf015'` for home) |
| `label` | Function returning display name |
| `description` | Tooltip text |
| `defaults` | Configuration fields (see below) |
| `messageInterface` | Documents msg properties read/written |
| `renderHelp()` | JSX function returning help content |

## Configuration Defaults

Define editable properties in `defaults`:

```javascript
defaults: {
  // Text input
  name: { type: 'string', default: '' },
  
  // Number input
  timeout: { type: 'number', default: 5000 },
  
  // Boolean toggle
  enabled: { type: 'boolean', default: true },
  
  // Dropdown select
  output: {
    type: 'select',
    default: 'payload',
    options: [
      { value: 'payload', label: 'msg.payload' },
      { value: 'full', label: 'Complete msg' }
    ]
  },
  
  // TypedInput (flexible type)
  value: {
    type: 'typed',
    default: { type: 'str', value: '' },
    types: ['str', 'num', 'bool', 'json', 'msg', 'flow', 'global']
  }
}
```

## Runtime API

Inside runtime methods, you have access to:

### Methods

| Method | Description |
|--------|-------------|
| `this.send(msg)` | Send message to next node |
| `this.send([msg1, msg2])` | Send to multiple outputs |
| `this.error(text, msg)` | Report an error |
| `this.warn(text)` | Log a warning |
| `this.log(text)` | Log info message |
| `this.debug(data)` | Send to debug panel |
| `this.status({text, fill})` | Set node status indicator |

### Properties

| Property | Description |
|----------|-------------|
| `this.config` | Node configuration from `defaults` |
| `this.id` | Unique node ID |
| `this.name` | Node name (from config) |
| `this.context` | Node context storage |
| `this.flow` | Flow-level context |
| `this.global` | Global context |

## Lifecycle Hooks

```javascript
export const myRuntime = {
  type: 'mynode',
  
  // Called once when node is deployed
  onSetup() {
    this.log('Node initialized');
  },
  
  // Called when a message arrives
  onInput(msg) {
    this.send(msg);
  },
  
  // Called when node is removed/redeployed
  onClose() {
    // Cleanup resources
  }
};
```

## Porting from Node-RED

PageNodes is inspired by Node-RED but has some differences:

### Key Differences

1. **JSX instead of HTML** - UI uses React/JSX, not HTML templates
2. **ES Modules** - Use `export` instead of `module.exports`
3. **No RED object** - Use `this.context`, `this.flow`, `this.global` instead
4. **Browser-first** - Nodes run in the browser, not Node.js

### Migration Checklist

1. Convert HTML template to JSX in `renderHelp()`
2. Move `RED.nodes.registerType()` config to node definition object
3. Replace `RED.util.*` with standard JS methods
4. Replace `node.on('input', ...)` with `onInput(msg)`
5. Replace `node.on('close', ...)` with `onClose()`
6. Test in browser environment (no `fs`, `child_process`, etc.)

### Example: Porting a Simple Node

**Node-RED version:**
```javascript
module.exports = function(RED) {
  function LowerCaseNode(config) {
    RED.nodes.createNode(this, config);
    this.on('input', function(msg) {
      msg.payload = msg.payload.toLowerCase();
      this.send(msg);
    });
  }
  RED.nodes.registerType('lower-case', LowerCaseNode);
}
```

**PageNodes version:**
```javascript
// lowercase.js
export const lowercaseRuntime = {
  type: 'lowercase',
  onInput(msg) {
    msg.payload = String(msg.payload).toLowerCase();
    this.send(msg);
  }
};

// lowercase.jsx
export const lowercaseNode = {
  type: 'lowercase',
  category: 'function',
  description: 'Converts payload to lowercase',
  label: (node) => node.name || 'lowercase',
  color: '#E6E0F8',
  inputs: 1,
  outputs: 1,
  defaults: { name: { type: 'string', default: '' } },
  renderHelp() {
    return <p>Converts <code>msg.payload</code> to lowercase.</p>;
  }
};
```

## Categories

Standard categories and their colors:

| Category | Purpose | Typical Color |
|----------|---------|---------------|
| `input` | Data sources (inject, MQTT in) | `#a6bbcf` |
| `output` | Data sinks (debug, MQTT out) | `#87a980` |
| `function` | Data transformation | `#E2D96E` |
| `logic` | Flow control (switch, delay) | `#E2D96E` |
| `storage` | Data persistence | `#7FC7FF` |
| `network` | HTTP, WebSocket, etc. | `#87a980` |
| `parsers` | JSON, CSV, XML parsing | `#E6E0F8` |

## Testing Your Node

1. Add your files to `src/nodes/{category}/`
2. Export from the category's `index.js`
3. Run `npm run dev` to start the development server
4. Your node should appear in the palette

## Resources

- [PageNodes Repository](https://github.com/monteslu/pagenodes)
- [FontAwesome Icons](https://fontawesome.com/v5/search?m=free) (use v5 free icons)
- [Node-RED Node Guide](https://nodered.org/docs/creating-nodes/) (reference for concepts)
