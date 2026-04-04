/**
 * RC4 Class (Standard)
 * Translated from: 72_RC4 Class.ls
 * Standard RC4 without the triple-swap perturbation.
 * Note: RC4Extended (86_tYy1rX5j7e4PLYJLER.ls) is the enhanced version
 * already translated in system/encryption.js. This is the simpler variant.
 */
import { RC4 } from '../../system/encryption.js';
import { ObjectManager } from './object-manager-class.js';

// RC4 class from encryption.js already handles standard RC4
// Register it under the Lingo class name
ObjectManager.registerClass('RC4 Class', RC4);

export { RC4 } from '../../system/encryption.js';
