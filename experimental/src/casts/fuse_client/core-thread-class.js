/**
 * Core Thread Class
 * Translated from: 74_Core Thread Class.ls
 * Main application thread that orchestrates the entire startup sequence.
 */
import { VOID, voidp } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { ObjectManager } from './object-manager-class.js';
import { createObject, removeObject, createTimeout, removeTimeout } from './object-api.js';
import { createBroker, registerMessage, unregisterMessage, executeMessage } from './broker-api.js';
import { getVariable, variableExists, getIntVariable } from './variable-api.js';
import { receiveUpdate, removeUpdate } from './object-api.js';

export class CoreThread extends ObjectBase {
  constructor() {
    super();
    this.state = '';
    this.logoSpr = null;
    this.fadingLogo = 0;
    this.logoStartTime = 0;
    this.crapFixing = 0;
    this.crapFixSpr = null;
    this.crapFixRegionInvalidated = 0;
    this.fullScreenRefreshSpr = null;
  }

  construct() {
    // Create session object
    createObject('session', 'Variable Container Class');
    const session = getObject('session');
    if (session) {
      session.set('client_startdate', new Date().toLocaleDateString());
      session.set('client_starttime', new Date().toLocaleTimeString());
      session.set('client_version', getVariable('system.version'));
      session.set('client_lastclick', '');
    }

    createObject('headers', 'Variable Container Class');
    createObject('classes', 'Variable Container Class');
    createObject('cache', 'Variable Container Class');

    createBroker('Initialize');
    registerMessage('requestHotelView', this.id, 'initTransferToHotelView');
    registerMessage('invalidateCrapFixRegion', this.id, 'invalidateCrapFixer');

    this.fadingLogo = 0;
    this.logoStartTime = 0;
    this.crapFixing = 0;
    this.crapFixRegionInvalidated = 1;

    return this.updateState('load_variables');
  }

  deconstruct() {
    if (timeoutExists('client.refresh.timeout')) {
      removeTimeout('client.refresh.timeout');
    }
    unregisterMessage('invalidateCrapFixRegion', this.id);
    return this.hideLogo();
  }

  showLogo() {
    // Show logo sprite
    this.logoStartTime = Date.now();
    return 1;
  }

  hideLogo() {
    this.logoSpr = VOID;
    return 1;
  }

  initTransferToHotelView() {
    const tShowLogoForMs = 1000;
    const tLogoNowShownMs = Date.now() - this.logoStartTime;
    if (tLogoNowShownMs >= tShowLogoForMs) {
      createTimeout('logo_timeout', 2000, 'initUpdate', this.id, VOID, 1);
    } else {
      createTimeout('init_timeout', tShowLogoForMs - tLogoNowShownMs + 1, 'initTransferToHotelView', this.id, VOID, 1);
    }
  }

  initUpdate() {
    this.fadingLogo = 1;
    receiveUpdate(this.id);
  }

  invalidateCrapFixer() {
    this.crapFixRegionInvalidated = 1;
  }

  update() {
    if (this.fadingLogo) {
      if (this.logoSpr) {
        this.logoSpr.blend -= 10;
        if (this.logoSpr.blend <= 0) {
          if (!this.crapFixing) {
            removeUpdate(this.id);
          }
          this.fadingLogo = 0;
          this.hideLogo();
          executeMessage('showHotelView');
        }
      }
    }
  }

  assetDownloadCallbacks(tAssetId, tSuccess) {
    if (!tSuccess) {
      if (['load_variables', 'load_texts', 'load_casts'].includes(tAssetId)) {
        // fatalError
        return 0;
      }
      return 0;
    }

    switch (tAssetId) {
      case 'load_variables': this.updateState('load_params'); break;
      case 'load_texts': this.updateState('load_casts'); break;
      case 'load_casts': this.updateState('validate_resources'); break;
      case 'validate_resources': this.updateState('validate_resources'); break;
    }
  }

  updateState(tstate) {
    switch (tstate) {
      case 'load_variables':
        this.state = tstate;
        this.showLogo();
        // Load variables from external file
        this.updateState('load_params');
        break;

      case 'load_params':
        this.state = tstate;
        // Dump variable field
        if (variableExists('client.full.refresh.period')) {
          createTimeout('client.refresh.timeout', getIntVariable('client.full.refresh.period'), 'fullScreenRefresh', this.id, VOID, 0);
        }
        return this.updateState('load_texts');

      case 'load_texts':
        this.state = tstate;
        // Load texts
        return this.updateState('load_casts');

      case 'load_casts':
        this.state = tstate;
        // Start cast loading
        return this.updateState('init_threads');

      case 'validate_resources':
        this.state = tstate;
        return this.updateState('init_threads');

      case 'init_threads':
        this.state = tstate;
        this.hideLogo();
        // Initialize all threads
        executeMessage('Initialize', 'initialize');
        break;

      default:
        return 0;
    }
    return 1;
  }

  fullScreenRefresh() {
    if (this.fullScreenRefreshSpr) {
      this.fullScreenRefreshSpr.visible = true;
    }
  }
}

ObjectManager.registerClass('Core Thread Class', CoreThread);
