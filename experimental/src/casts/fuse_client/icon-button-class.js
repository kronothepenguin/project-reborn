/**
 * Icon Button Class
 * Translated from: 65_Icon Button Class.ls
 * Button with icon image + text.
 */
import { VOID, voidp } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { ObjectManager } from './object-manager-class.js';

export class IconButton extends ObjectBase {
  constructor() {
    super();
    this.iconImg = null;
    this.buttonImg = {};
    this.cachedImgs = {};
    this.clickPass = 0;
    this.blend = 100;
    this.buttonText = '';
  }

  prepare() {
    this.origWidth = this.props?.width || 0;
    this.maxWidth = this.props?.maxwidth || 300;
    this.fixedSize = this.props?.fixedsize || 0;
    this.alignment = this.props?.alignment || 'left';
    this.buttonText = this.props?.key || '';
    this.blend = this.props?.blend || 100;
    this.cachedImgs = {};

    if (this.props?.icon) {
      // Load icon image
      this.iconImg = null; // placeholder
    }

    this.UpdateImageObjects(null, 'up');
    this.image = this.createButtonImg(this.buttonText, 'up');
    this.width = this.image?.width || 0;
    this.height = this.image?.height || 0;

    return 1;
  }

  setText(tText) {
    this.buttonText = tText;
    this.cachedImgs = {};
    this.image = this.createButtonImg(tText, 'up');
    this.render();
  }

  createButtonImg(tText, tstate) {
    // Create button image with icon + text
    // Cache for performance
    const cacheKey = tstate + (tText || '');
    if (this.cachedImgs[cacheKey]) return this.cachedImgs[cacheKey];

    const newImg = null; // placeholder
    this.cachedImgs[cacheKey] = newImg;
    return newImg;
  }

  UpdateImageObjects(tPalette, tstate) {
    // Load button state images (left, middle, right)
    this.buttonImg.left = null;
    this.buttonImg.middle = null;
    this.buttonImg.right = null;
  }

  mouseDown() {
    if (this.blend < 100) return 0;
    this.clickPass = 1;
    this.changeState('down');
    return 1;
  }

  mouseUp() {
    if (this.blend < 100) return 0;
    this.changeState('up');
    if (this.clickPass) {
      this.clickPass = 0;
      return 1;
    }
  }

  changeState(tstate) {
    this.image = this.createButtonImg(this.buttonText, tstate);
    this.render();
  }

  Activate() {
    this.blend = 100;
  }

  deactivate() {
    this.changeState('up');
    this.blend = 50;
  }
}

ObjectManager.registerClass('Icon Button Class', IconButton);
