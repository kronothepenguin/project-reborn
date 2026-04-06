// fuse_client/45_Multiuser Manager Class.ls → multiuser-manager-class.js
// Multiuser manager - minimal, delegates to manager template

import { symbol } from '../core/lingo-runtime.js'
import { ManagerTemplateClass } from './manager-template-class.js'

export class MultiuserManagerClass extends ManagerTemplateClass {
  constructor() {
    super()
    this.pClassString = 'multiuser.instance.class'
  }

  construct() {
    this.pClassString = 'multiuser.instance.class'
    return true
  }
}
