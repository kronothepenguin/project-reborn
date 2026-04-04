/**
 * DropDown Class
 * Translated from: 25_DropDown Class.ls
 * Dropdown/select UI element.
 */
import { VOID, voidp } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { ObjectManager } from './object-manager-class.js';

export class DropDown extends ObjectBase {
  constructor() {
    super();
    this.state = 'close';
    this.textKeys = [];
    this.textList = [];
    this.showOrder = [];
    this.selectedItemNum = 1;
    this.rollOverItem = 0;
    this.alignment = 'left';
    this.openDir = 'down';
    this.maxWidth = 300;
    this.lineHeight = 16;
    this.fixedSize = 0;
    this.origWidth = 0;
    this.dropDownType = 'default';
    this.ordering = 1;
    this.palette = null;
    this.image = null;
    this.buffer = null;
    this.sprite = null;
  }

  define(tProps) {
    this.id = tProps.id;
    this.buffer = tProps.buffer;
    this.sprite = tProps.sprite;
    this.palette = tProps.palette;
    this.alignment = tProps.alignment || 'left';
    this.textKeys = tProps.keylist || [];
    this.origWidth = tProps.width || 0;
    this.lineHeight = tProps.fixedLineSpace || 16;
    this.openDir = tProps.direction || 'down';
    this.maxWidth = tProps.maxwidth || this.origWidth;
    this.fixedSize = tProps.fixedsize || 0;
    this.dropDownType = tProps.dropDownType || 'default';

    if (this.textKeys.length === 0) this.textKeys = [];
    this.textList = [...this.textKeys];
    if (this.textList.length === 0) this.textList = ['...'];

    this.showOrder = this.textList.map((_, i) => i);
    this.selectedItemNum = 1;
    this.state = 'close';

    return 1;
  }

  getSelection(tReturnType) {
    const idx = this.showOrder[this.selectedItemNum - 1] || 0;
    if (tReturnType === 'text') return this.textList[idx];
    return this.textKeys[idx];
  }

  setSelection(tSelNumOrStr) {
    let selNum;
    if (typeof tSelNumOrStr === 'string') {
      selNum = this.textList.indexOf(tSelNumOrStr);
      if (selNum < 0) selNum = this.textKeys.indexOf(tSelNumOrStr);
    } else {
      selNum = tSelNumOrStr;
    }
    if (selNum <= 0) return 0;
    this.selectedItemNum = this.showOrder.indexOf(selNum) + 1;
    if (this.selectedItemNum <= 0) this.selectedItemNum = 1;
    return 1;
  }

  setShowOrder(tStyle, tFirstNum, tDeleteOne) {
    if (!this.ordering) return 1;
    const choice = this.showOrder[this.selectedItemNum - 1];

    if (tStyle === 'normal') {
      this.showOrder = this.textList.map((_, i) => i);
    }

    if (tFirstNum > 0) {
      const pos = this.showOrder.indexOf(tFirstNum);
      if (pos >= 0) {
        this.showOrder.splice(pos, 1);
        if (this.openDir === 'down') {
          this.showOrder.unshift(tFirstNum);
        } else {
          this.showOrder.push(tFirstNum);
        }
      }
    }

    if (tDeleteOne > 0) {
      const idx = this.showOrder.indexOf(tDeleteOne);
      if (idx >= 0) this.showOrder.splice(idx, 1);
    }

    this.selectedItemNum = this.showOrder.indexOf(choice) + 1;
    return 0;
  }

  mouseDown() {
    if (this.state !== 'open') {
      this.state = 'open';
      return 1;
    }
  }

  mouseUp() {
    if (this.state === 'open') {
      this.state = 'close';
      if (this.rollOverItem > 0 && this.rollOverItem <= this.showOrder.length) {
        this.selectedItemNum = this.rollOverItem;
      }
      const idx = this.showOrder[this.selectedItemNum - 1] || 0;
      return this.textKeys[idx];
    }
  }

  getProperty(tProp) {
    switch (tProp) {
      case 'selection': return this.getSelection('key');
      case 'width': return this.sprite?.width || this.origWidth;
      case 'height': return this.sprite?.height || 0;
      case 'locX': return this.sprite?.locX || 0;
      case 'locY': return this.sprite?.locY || 0;
      case 'sprite': return this.sprite;
      default: return 0;
    }
  }
}

ObjectManager.registerClass('DropDown Class', DropDown);
