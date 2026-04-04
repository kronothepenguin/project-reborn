/**
 * Download Manager Class
 * 
 * Translated from: casts/fuse_client/31_Download Manager Class.ls
 * 
 * Manages a queue of file downloads with progress tracking and callbacks.
 * In JS, downloads use fetch() instead of Director's netLingo.
 */

import { VOID, voidp, stringp, integerp } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { error } from './error-api.js';
import { memberExists, getmemnum, createMember, getMember } from './resource-api.js';
import { getObject, objectExists, getUniqueID, createObject, removeObject } from './object-api.js';
import { getVariable, variableExists, getIntVariable } from './variable-api.js';

export class DownloadManager extends ObjectBase {
  constructor() {
    super();
    this.taskQueue = new Map();
    this.activeTasks = new Map();
    this.receivedTasks = [];
    this.completeTasks = [];
    this.typeDefList = new Map();
    this.ownDomain = '';
    this.lastError = 0;
  }

  construct() {
    this.taskQueue = new Map();
    this.activeTasks = new Map();
    this.receivedTasks = [];
    this.completeTasks = [];
    this.typeDefList = new Map();
    this.ownDomain = '';
    this.lastError = 0;
    this.fillTypeDefinitions();
    return 1;
  }

  deconstruct() {
    this.taskQueue.clear();
    this.activeTasks.clear();
    this.receivedTasks = [];
    this.completeTasks = [];
    return 1;
  }

  // ── Queue ──────────────────────────────────────────────────────────

  queue(tURL, tMemName, ttype, tForceFlag) {
    if (!stringp(tURL)) {
      error(this, `Missing or invalid URL: ${tURL}`, 'queue', 'major');
      return 0;
    }
    if (!stringp(tMemName)) {
      tMemName = tURL;
    }

    // Detect member type from URL extension
    if (ttype === undefined || ttype === null) {
      ttype = this.recognizeMemberType(tURL);
    }

    // Check if already downloading
    if (this.taskQueue.has(tMemName) || this.activeTasks.has(tMemName)) {
      error(this, `File already downloading: ${tMemName}`, 'queue', 'minor');
      return this.getmemnum(tMemName);
    }

    // Create member if needed
    let tMemNum;
    if (memberExists(tMemName)) {
      if (tForceFlag) {
        tMemNum = getmemnum(tMemName);
      } else {
        return getmemnum(tMemName);
      }
    } else {
      tMemNum = createMember(tMemName, ttype);
    }

    if (tMemNum < 1) {
      error(this, 'Failed to create member!', 'queue', 'major');
      return 0;
    }

    // Queue the download
    const taskData = {
      name: tMemName,
      url: tURL,
      memNum: tMemNum,
      type: ttype,
      status: 'queue',
      percent: 0,
      callback: null,
    };

    this.receivedTasks.push(tMemName);
    this.taskQueue.set(tMemName, taskData);
    this.updateQueue();

    return tMemNum;
  }

  /**
   * Process queue - start next download if slots available
   */
  updateQueue() {
    const maxTasks = getIntVariable('net.operation.count', 2);

    while (this.activeTasks.size < maxTasks && this.taskQueue.size > 0) {
      // Get first task from queue
      const [taskName, taskData] = this.taskQueue.entries().next().value;
      this.taskQueue.delete(taskName);

      // Start download
      this.startDownload(taskName, taskData);
    }

    return 1;
  }

  /**
   * Start a single download using fetch()
   */
  async startDownload(taskName, taskData) {
    taskData.status = 'active';
    this.activeTasks.set(taskName, taskData);

    try {
      const response = await fetch(taskData.url);
      if (!response.ok) {
        this.lastError = response.status;
        this.removeActiveTask(taskName, taskData.callback, false);
        return;
      }

      const data = await response.arrayBuffer();
      taskData.percent = 100;
      taskData.data = data;

      // Store based on type
      if (taskData.type === 'bitmap' || taskData.type === 'image') {
        // Create Image from data
        const blob = new Blob([data]);
        const img = new Image();
        img.src = URL.createObjectURL(blob);
        taskData.image = img;
      } else if (taskData.type === 'field' || taskData.type === 'text') {
        taskData.text = new TextDecoder().decode(data);
      }

      this.completeTasks.push(taskName);
      this.removeActiveTask(taskName, taskData.callback, true);
      this.updateQueue();

    } catch (err) {
      this.lastError = 1;
      this.removeActiveTask(taskName, taskData.callback, false);
    }
  }

  /**
   * Remove active task and fire callback
   */
  removeActiveTask(taskName, callback, success) {
    const task = this.activeTasks.get(taskName);
    if (task) {
      task.status = success ? 'complete' : 'error';
      this.activeTasks.delete(taskName);
    }

    // Fire callback
    if (callback && callback.client && objectExists(callback.client)) {
      const client = getObject(callback.client);
      if (client && typeof client[callback.method] === 'function') {
        try {
          client[callback.method](callback.argument, success);
        } catch (e) {
          console.error('[DownloadManager] Callback error:', e);
        }
      }
    }
  }

  // ── Callback ───────────────────────────────────────────────────────

  registerCallback(tMemNameOrNum, tMethod, tClientID, tArgument) {
    // Find task
    let taskData = null;

    if (stringp(tMemNameOrNum)) {
      taskData = this.taskQueue.get(tMemNameOrNum) || this.activeTasks.get(tMemNameOrNum);
      if (!taskData) {
        if (memberExists(tMemNameOrNum)) {
          taskData = { status: 'complete' };
        } else {
          error(this, `Task doesn't exist: ${tMemNameOrNum}`, 'registerCallback', 'major');
          return 0;
        }
      }
    }

    if (taskData) {
      if (taskData.status === 'complete') {
        // Fire immediately
        const client = getObject(tClientID);
        if (client && typeof client[tMethod] === 'function') {
          client[tMethod](tArgument);
        }
      } else {
        taskData.callback = { method: tMethod, client: tClientID, argument: tArgument };
      }
    }

    return 1;
  }

  // ── Status ─────────────────────────────────────────────────────────

  getLoadPercent(tMemNameOrNum) {
    if (integerp(tMemNameOrNum)) {
      const member = getMember(tMemNameOrNum);
      if (!voidp(member) && member.name) {
        tMemNameOrNum = member.name;
      }
    }

    if (this.completeTasks.includes(tMemNameOrNum)) return 100;

    const task = this.activeTasks.get(tMemNameOrNum);
    if (task) return task.percent || 0;

    if (this.taskQueue.has(tMemNameOrNum)) return 0;

    return 100; // Already done
  }

  exists(tMemName) {
    return this.taskQueue.has(tMemName) || this.activeTasks.has(tMemName);
  }

  abort(tMemNameOrNum) {
    const task = this.activeTasks.get(tMemNameOrNum);
    if (task) {
      this.removeActiveTask(tMemNameOrNum, task.callback, false);
      return 1;
    }
    return 0;
  }

  // ── Helpers ────────────────────────────────────────────────────────

  recognizeMemberType(tURL) {
    if (this.typeDefList.size === 0) {
      this.fillTypeDefinitions();
    }

    const dotIdx = tURL.lastIndexOf('.');
    if (dotIdx < 0) return 'field';

    const ext = tURL.substring(dotIdx + 1).toLowerCase();
    return this.typeDefList.get(ext) || 'field';
  }

  fillTypeDefinitions() {
    this.typeDefList.set('gif', 'bitmap');
    this.typeDefList.set('jpg', 'bitmap');
    this.typeDefList.set('jpeg', 'bitmap');
    this.typeDefList.set('bmp', 'bitmap');
    this.typeDefList.set('png', 'bitmap');
    this.typeDefList.set('txt', 'field');
    this.typeDefList.set('html', 'field');
    this.typeDefList.set('htm', 'field');
    this.typeDefList.set('xml', 'field');
    this.typeDefList.set('js', 'field');
    this.typeDefList.set('css', 'field');
    this.typeDefList.set('mp3', 'sound');
    this.typeDefList.set('wav', 'sound');
    this.typeDefList.set('swf', 'flash');
  }

  solveNetErrorMsg(tErrorCode) {
    const msgs = {
      20: 'Internal error',
      404: 'Requested object could not be found',
      4146: 'Connection could not be established with the remote host',
      4150: 'Unexpected early closing of connection',
      4154: 'Operation could not be completed due to timeout',
      4167: 'Transfer was intentionally interrupted',
    };
    return msgs[tErrorCode] || `Unknown error: ${tErrorCode}`;
  }

  print() {
    console.log('--- Downloads ---');
    console.log(`  Queue: ${this.taskQueue.size}`);
    console.log(`  Active: ${this.activeTasks.size}`);
    console.log(`  Complete: ${this.completeTasks.length}`);
    return 1;
  }
}

// Register
import { ObjectManager } from './object-manager-class.js';
ObjectManager.registerClass('Download Manager Class', DownloadManager);
