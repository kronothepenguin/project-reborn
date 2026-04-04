/**
 * Field Wrapper Class
 * Translated from: 61_Field Wrapper Class.ls
 * Editable text field element.
 */
import { VOID, voidp, stringp } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { ObjectManager } from './object-manager-class.js';
import { error, getResourceManager } from './object-api.js';

export class FieldWrapper extends ObjectBase {
  constructor() {
    super();
    this.member = null;
    this.editable = true;
    this.focused = false;
  }

  deconstruct() {
    if (this.member?.name) {
      // Remove member from resource manager
    }
    return 1;
  }

  prepare() {
    const resMgr = getResourceManager();
    const memName = this.props.member + Date.now() + String.fromCharCode(Math.floor(Math.random() * 99));
    const memNum = resMgr.createMember(memName, 'field');
    this.member = { name: memName, number: memNum };

    this.member.wordWrap = this.props.wordWrap;
    this.member.autoTab = this.props.autoTab;
    this.member.alignment = this.props.alignment;
    this.member.font = this.props.font;
    this.member.fontSize = this.props.fontSize;
    this.member.fontStyle = this.props.fontStyle;
    this.member.editable = 1;
    this.member.color = this.props.txtColor;
    this.member.bgColor = this.props.txtBgColor;
    this.member.border = this.props.border || 0;

    if (this.props.key === '') {
      this.member.text = '';
    } else {
      this.member.text = this.props.key;
    }

    if (this.sprite) {
      this.sprite.member = this.member;
      this.sprite.editable = true;
    }

    return 1;
  }

  getText() {
    return this.member?.text || '';
  }

  setText(tText) {
    if (!stringp(tText)) tText = String(tText);
    if (this.member) this.member.text = tText;
    return 1;
  }

  setEdit(tBool) {
    if (tBool !== 0 && tBool !== 1) return 0;
    this.editable = !!tBool;
    if (this.sprite) this.sprite.editable = tBool;
    return 1;
  }

  setFocus(tBool) {
    this.focused = !!tBool;
    // In production: set keyboard focus sprite
    return 1;
  }

  render() {
    this.width = this.sprite?.width || 0;
    this.height = this.sprite?.height || 0;
  }

  draw(tRGB) {
    // Draw colored rect to stage
  }
}

ObjectManager.registerClass('Field Wrapper Class', FieldWrapper);
