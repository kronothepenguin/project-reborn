/**
 * Text Manager Class
 * Translated from: 36_Text Manager Class.ls
 * Extends Variable Container for text resources.
 */
import { VOID, voidp } from '../../core/lingo-runtime.js';
import { VariableContainer } from './variable-container-class.js';
import { ObjectManager } from './object-manager-class.js';

export class TextManager extends VariableContainer {
  constructor() {
    super();
  }
}

ObjectManager.registerClass('Text Manager Class', TextManager);
