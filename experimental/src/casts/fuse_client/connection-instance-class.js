/**
 * Connection Instance Class
 * 
 * Translated from: casts/fuse_client/51_Connection Instance Class.ls
 * 
 * Individual connection instance with RC4 encoding/decoding.
 * Uses WebSocket for server communication.
 * 
 * In the original Lingo, this used Director's netLingo with custom RC4 encoding.
 * In JS, we use WebSocket with the RC4Extended cipher for compatibility.
 */

import { VOID, voidp } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { RC4Extended } from '../../system/encryption.js';
import { getObject } from './object-api.js';
import { error } from './error-api.js';

export class ConnectionInstance extends ObjectBase {
  constructor() {
    super();

    /** @type {string|null} Connection ID */
    this.connectionID = null;

    /** @type {string} Server host */
    this.host = '';

    /** @type {number} Server port */
    this.port = 0;

    /** @type {WebSocket|null} WebSocket connection */
    this.socket = null;

    /** @type {string} Connection state: 'disconnected', 'connecting', 'connected', 'error' */
    this.state = 'disconnected';

    /** @type {RC4Extended|null} RC4 encoder */
    this.encoder = null;

    /** @type {RC4Extended|null} RC4 decoder */
    this.decoder = null;

    /** @type {Map<string, Function>} Message listeners: command → handler */
    this.listeners = new Map();

    /** @type {Map<string, {objID: string, cmds: string[]}>} Listener registry */
    this.listenerRegistry = new Map();
  }

  construct() {
    return 1;
  }

  deconstruct() {
    this.disconnect();
    this.listeners.clear();
    this.listenerRegistry.clear();
    return 1;
  }

  // ── Connection Lifecycle ───────────────────────────────────────────

  /**
   * Connect to server
   */
  connect(host, port) {
    this.host = host;
    this.port = port;
    this.state = 'connecting';

    const url = `ws://${host}:${port}`;
    this.socket = new WebSocket(url);
    this.socket.binaryType = 'arraybuffer';

    this.socket.onopen = () => {
      this.state = 'connected';
      this._dispatchMessage('CONN_ESTABLISHED', '');
    };

    this.socket.onclose = (event) => {
      this.state = 'disconnected';
      this._dispatchMessage('CONN_CLOSED', `${event.code} ${event.reason}`);
    };

    this.socket.onerror = (err) => {
      this.state = 'error';
      this._dispatchMessage('CONN_ERROR', String(err));
    };

    this.socket.onmessage = (event) => {
      this._handleMessage(event);
    };

    return 1;
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.state = 'disconnected';
    return 1;
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.state === 'connected';
  }

  // ── RC4 Encoding ───────────────────────────────────────────────────

  /**
   * Initialize RC4 encoder with key
   */
  initEncoder(key, mode, otherKey) {
    this.encoder = new RC4Extended();
    this.encoder.setKey(key, mode, otherKey);
    return 1;
  }

  /**
   * Initialize RC4 decoder with key
   */
  initDecoder(key, mode, otherKey) {
    this.decoder = new RC4Extended();
    this.decoder.setKey(key, mode, otherKey);
    return 1;
  }

  // ── Sending ────────────────────────────────────────────────────────

  /**
   * Send a message to the server
   * 
   * Original Lingo: connection.send("COMMAND", "arg1", "arg2", ...)
   * Format: "COMMAND arg1 arg2\n" (RC4 encoded)
   */
  send(...args) {
    if (!this.isConnected()) {
      error(this, 'Not connected', 'send', 'major');
      return 0;
    }

    if (!this.encoder) {
      error(this, 'Encoder not initialized', 'send', 'major');
      return 0;
    }

    // Build message
    const message = args.join(' ') + '\n';

    // RC4 encode
    const encoded = this.encoder.encipher(message);

    // Send
    this.socket.send(encoded);
    return 1;
  }

  // ── Receiving ──────────────────────────────────────────────────────

  /**
   * Handle incoming message
   */
  _handleMessage(event) {
    if (!this.decoder) {
      console.error('[ConnectionInstance] Decoder not initialized');
      return;
    }

    try {
      // Decode
      const data = event.data;
      let text;

      if (typeof data === 'string') {
        text = this.decoder.decipher(data);
      } else if (data instanceof ArrayBuffer) {
        const bytes = new Uint8Array(data);
        let hexStr = '';
        for (let i = 0; i < bytes.length; i++) {
          hexStr += bytes[i].toString(16).padStart(2, '0');
        }
        text = this.decoder.decipher(hexStr);
      } else {
        return;
      }

      // Parse: "COMMAND arg1 arg2\n"
      const lines = text.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.length === 0) continue;

        const spaceIdx = trimmed.indexOf(' ');
        const command = spaceIdx >= 0 ? trimmed.substring(0, spaceIdx) : trimmed;
        const args = spaceIdx >= 0 ? trimmed.substring(spaceIdx + 1).trim() : '';

        this._dispatchMessage(command, args);
      }
    } catch (err) {
      console.error('[ConnectionInstance] Message decode error:', err);
    }
  }

  /**
   * Dispatch message to registered listeners
   */
  _dispatchMessage(command, args) {
    // Check registered listeners
    for (const [key, { objID, cmds }] of this.listenerRegistry) {
      if (cmds.includes(command)) {
        const obj = getObject(objID);
        if (obj) {
          // Try handler methods: onCommandName, handleCommand, or command name
          const handlerName = 'on' + command;
          if (typeof obj[handlerName] === 'function') {
            try {
              obj[handlerName](args, this.connectionID);
            } catch (e) {
              console.error(`[ConnectionInstance] Listener error (${handlerName}):`, e);
            }
          }
        }
      }
    }

    // Check direct command handlers
    const handler = this.listeners.get(command);
    if (handler && typeof handler === 'function') {
      try {
        handler(args, this.connectionID);
      } catch (e) {
        console.error(`[ConnectionInstance] Command handler error (${command}):`, e);
      }
    }
  }

  // ── Listener Registration ──────────────────────────────────────────

  /**
   * Register a listener object for specific messages
   */
  registerListener(objID, msgList) {
    const key = `${objID}`;
    this.listenerRegistry.set(key, { objID, cmds: Array.isArray(msgList) ? msgList : [msgList] });
    return 1;
  }

  /**
   * Unregister a listener
   */
  unregisterListener(objID, msgList) {
    const key = `${objID}`;
    this.listenerRegistry.delete(key);
    return 1;
  }

  /**
   * Register command handlers
   */
  registerCommands(objID, cmdList) {
    return this.registerListener(objID, cmdList);
  }

  /**
   * Unregister command handlers
   */
  unregisterCommands(objID, cmdList) {
    return this.unregisterListener(objID, cmdList);
  }

  /**
   * Register a direct command handler function
   */
  on(command, handler) {
    this.listeners.set(command, handler);
    return 1;
  }

  /**
   * Remove a command handler
   */
  off(command) {
    this.listeners.delete(command);
    return 1;
  }
}
