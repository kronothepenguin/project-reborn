/**
 * Text Wrapper Class
 * Translated from: 60_Text Wrapper Class.ls
 * Renders text with font properties, word wrap, and scrolling.
 */
import { VOID, voidp, symbolp } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { ObjectManager } from './object-manager-class.js';
import { error, getVariable, variableExists } from './object-api.js';

export class TextWrapper extends ObjectBase {
  constructor() {
    super();
    this.fontData = {};
    this.textMem = null;
    this.needFill = 0;
    this.textRenderMode = 1;
    this.underliningDisabled = 0;
    this.offX = 0;
    this.offY = 0;
    this.ownW = 0;
    this.ownH = 0;
    this.scrolls = [];
  }

  prepare() {
    this.offX = 0;
    this.offY = 0;
    this.ownW = this.props?.width || 0;
    this.ownH = this.props?.height || 0;
    this.scrolls = [];

    if (this.props?.style === 'unique') {
      this.ownX = 0;
      this.ownY = 0;
    } else {
      this.ownX = this.props?.locH || 0;
      this.ownY = this.props?.locV || 0;
    }

    this.fontData = {
      color: this.props?.txtColor,
      bgColor: this.props?.txtBgColor,
      key: this.props?.key,
      wordWrap: this.props?.wordWrap,
      alignment: symbolp(this.props?.alignment) ? this.props.alignment : this.props.alignment,
      font: this.props?.font || 'Courier',
      fontSize: this.props?.fontSize || 12,
      fontStyle: this.props?.fontStyle,
    };

    if (typeof this.props?.fixedLineSpace === 'number') {
      this.fontData.fixedLineSpace = this.props.fixedLineSpace;
    } else {
      this.fontData.fixedLineSpace = (this.props?.fontSize || 12) + 1;
    }

    if (voidp(this.fontData.key)) this.fontData.key = '';

    this.needFill = this.fontData.bgColor && this.fontData.bgColor !== '#ffffff' ? 1 : 0;

    if (variableExists('text.render.compatibility.mode')) {
      this.textRenderMode = getVariable('text.render.compatibility.mode');
    } else {
      this.textRenderMode = 1;
    }

    if (variableExists('text.underlining.disabled')) {
      this.underliningDisabled = getVariable('text.underlining.disabled');
    } else {
      this.underliningDisabled = 0;
    }

    return this.createImgFromTxt();
  }

  setText(tText) {
    tText = String(tText);
    this.fontData.text = tText;
    this.createImgFromTxt();
    this.render();
    this.registerScroll();
    return 1;
  }

  getText() {
    return this.fontData.text;
  }

  setFont(tStruct) {
    this.fontData.font = tStruct.font;
    this.fontData.fontStyle = tStruct.fontStyle;
    this.fontData.fontSize = tStruct.fontSize;
    this.fontData.color = tStruct.color;
    this.fontData.fixedLineSpace = tStruct.lineHeight;
    this.createImgFromTxt();
    this.render();
    this.registerScroll();
    return 1;
  }

  getFont() {
    return {
      font: this.fontData.font,
      fontStyle: this.fontData.fontStyle,
      fontSize: this.fontData.fontSize,
      color: this.fontData.color,
      lineHeight: this.fontData.fixedLineSpace,
    };
  }

  registerScroll(tID) {
    if (voidp(this.scrolls)) this.prepare();
    if (!voidp(tID) && !this.scrolls.includes(tID)) {
      this.scrolls.push(tID);
    } else if (this.scrolls.length === 0) {
      return 0;
    }
    this.createImgFromTxt();
  }

  createImgFromTxt() {
    // Render text to image using canvas
    if (!this.buffer?.image) return 0;
    // In production, would use Canvas 2D to render text
    return 1;
  }
}

ObjectManager.registerClass('Text Wrapper Class', TextWrapper);
