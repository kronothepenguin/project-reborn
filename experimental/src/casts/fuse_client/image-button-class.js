/**
 * Image Button Class
 * Translated from: 64_Image Button Class.ls
 * Button with up/down state images.
 */
import { VOID, voidp } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { ObjectManager } from './object-manager-class.js';
import { getmemnum } from './resource-api.js';

export class ImageButton extends ObjectBase {
  constructor() {
    super();
    this.buttonImg = {};
    this.clickPass = 0;
    this.blend = 100;
    this.fixedSize = 0;
  }

  prepare() {
    this.blend = this.props?.blend || 100;
    this.buttonImg = {};
    this.fixedSize = this.props?.fixedsize || 0;

    // Parse member name to get base name
    const memName = this.props?.member || '';
    const baseName = memName.replace(/\.\w+$/, '');

    this.updateImageObjects(null, 'up', baseName);
    this.updateImageObjects(null, 'down', baseName);

    this.image = this.createButtonImg('up');
    this.width = this.image?.width || 0;
    this.height = this.image?.height || 0;

    if (this.sprite) {
      this.sprite.width = this.width;
      this.sprite.height = this.height;
    }

    return 1;
  }

  changeState(tstate) {
    this.image = this.createButtonImg(tstate);
    this.render();
  }

  UpdateImageObjects(tPalette, tstate, tMemName) {
    const suffix = tstate === 'up' ? '.active' : '.pressed';
    const fullName = tMemName + suffix;
    const memNum = getmemnum(fullName);
    if (memNum === 0) {
      return 0;
    }
    // Load and store image
    this.buttonImg[tstate] = null; // placeholder
    return 1;
  }

  createButtonImg(tstate) {
    return this.buttonImg[tstate] || null;
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
}

ObjectManager.registerClass('Image Button Class', ImageButton);
