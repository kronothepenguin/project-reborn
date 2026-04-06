// fuse_client/70_Thread Instance Class.ls → thread-instance-class.js
// Thread instance - container for interface, component, and handler references

export class ThreadInstanceClass {
  constructor() {
    this.interface = null
    this.component = null
    this.handler = null
  }

  construct() {
    this.interface = null
    this.component = null
    this.handler = null
    return true
  }

  deconstruct() {
    this.interface = null
    this.component = null
    this.handler = null
    return true
  }

  getInterface() {
    return this.interface
  }

  getComponent() {
    return this.component
  }

  getHandler() {
    return this.handler
  }
}
