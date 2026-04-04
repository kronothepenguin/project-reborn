/**
 * HttpCookie Instance Class
 * Translated from: 81_HttpCookie Instance Class.ls
 * HTTP cookie-aware download using fetch() API.
 * Replaces Director's multiuser xtra HTTP with native fetch.
 */
import { VOID, voidp } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { ObjectManager } from './object-manager-class.js';
import { error, getDownloadManager } from './object-api.js';
import { getVariable } from './variable-api.js';

export class HttpCookieInstance extends ObjectBase {
  constructor() {
    super();
    this.server = '';
    this.port = 80;
    this.destination = '/';
    this.data = null;
    this.maxBytes = 16 * 1024;
    this.netDone = false;
    this.netError = 0;
    this.userAgent = 'HTTP-CLASS/0.1';
    this.httpVersion = '1.1';
    this.cookies = {};
    this.type = '';
    this.status = 'initializing';
    this.memName = '';
    this.memNum = 0;
    this.callback = null;
    this.redirectNetID = null;
    this.redirectUrl = '';
    this.redirectType = 'follow';
    this.target = null;
  }

  define(tMemName, tdata) {
    this.status = 'initializing';
    this.memName = tMemName;
    this.memNum = tdata.memNum;
    this.type = tdata.type;
    this.callback = tdata.callback;
    this.target = tdata.target;
    this.redirectType = tdata.redirectType || 'follow';

    const separatedURL = this.separateURL(tdata.url);
    this.server = separatedURL.server;
    this.destination = separatedURL.destination;
    this.port = separatedURL.port || 80;

    if (!this.destination) this.destination = '/';
    if (!this.destination.startsWith('/')) this.destination = '/' + this.destination;

    this.data = {};
    this.netDone = false;
    if (!this.cookies) this.cookies = {};

    return this.sendRequest();
  }

  separateURL(tURL) {
    let url = tURL.replace('http://', '');
    const destOffset = url.indexOf('/');
    const serverURL = url.substring(0, destOffset);
    const destination = url.substring(destOffset);

    let port = 80;
    let server = serverURL;
    const portOffset = serverURL.indexOf(':');
    if (portOffset >= 0) {
      server = serverURL.substring(0, portOffset);
      port = parseInt(serverURL.substring(portOffset + 1), 10);
    }

    return { server, destination, port };
  }

  addCallBack(tMemName, tCallback) {
    if (tMemName === this.memName) {
      this.callback = tCallback;
      return 1;
    }
    return 0;
  }

  getProperty(tProp) {
    switch (tProp) {
      case 'status': return this.status;
      case 'url': return this.server + this.destination;
      case 'type': return this.type;
      case 'Percent': return this.netDone ? 100 : 0;
      default: return 0;
    }
  }

  async sendRequest() {
    this.status = 'LOADING';

    try {
      const url = `http://${this.server}:${this.port}${this.destination}`;

      const headers = {
        'Host': `${this.server}:${this.port === 80 ? '' : this.port}`,
        'User-Agent': this.userAgent,
        'Accept': 'text/*',
        'Accept-Charset': 'ISO-8859-1',
      };

      // Add cookies
      const cookieStr = this.getCookieString();
      if (cookieStr) headers['Cookie'] = cookieStr;

      const response = await fetch(url, { headers });

      if (!response.ok) {
        this.status = 'error';
        this.netDone = true;
        return 0;
      }

      // Parse Set-Cookie headers
      const setCookie = response.headers.get('set-cookie');
      if (setCookie) {
        this.parseAndStoreCookies(setCookie);
      }

      // Handle redirect
      const location = response.headers.get('location');
      if (location) {
        return this.handleRedirect(location);
      }

      // Get body
      if (this.type === 'bitmap' || this.type === 'image') {
        const blob = await response.blob();
        // Store as member
      } else {
        const text = await response.text();
        // Store as text member
      }

      this.status = 'complete';
      this.netDone = true;

      const manager = getDownloadManager();
      if (manager?.removeActiveTask) {
        manager.removeActiveTask(this.memName, this.callback, true);
      }

    } catch (err) {
      this.status = 'error';
      this.netDone = true;
      const manager = getDownloadManager();
      if (manager?.removeActiveTask) {
        manager.removeActiveTask(this.memName, this.callback, false);
      }
    }
  }

  getCookieString() {
    // Build cookie header from stored cookies
    const parts = [];
    for (const [name, value] of Object.entries(this.cookies)) {
      if (this.destination.startsWith(value.path || '/')) {
        parts.push(`${name}=${value.value}`);
      }
    }
    return parts.join('; ');
  }

  parseAndStoreCookies(setCookie) {
    // Parse Set-Cookie header value
    const parts = setCookie.split(';').map(s => s.trim());
    const [nameValue] = parts;
    const [name, value] = nameValue.split('=');

    const cookie = { name, value, path: '/' };
    for (const part of parts.slice(1)) {
      if (part.toLowerCase().startsWith('path=')) {
        cookie.path = part.substring(5);
      }
    }

    this.cookies[name] = cookie;
  }

  handleRedirect(redirectUrl) {
    let completeUrl = redirectUrl;
    if (!redirectUrl.includes('http://')) {
      if (!redirectUrl.startsWith('/')) completeUrl = '/' + redirectUrl;
      completeUrl = `http://${this.server}${completeUrl}`;
    }

    if (this.redirectType === 'follow') {
      if (this.type === 'bitmap') {
        this.redirectUrl = completeUrl;
        // Preload the redirect URL
      } else if (this.type === 'text') {
        this.define(this.memName, {
          url: completeUrl,
          memNum: this.memNum,
          type: this.type,
          callback: this.callback,
        });
      }
    } else {
      if (!this.target) {
        window.open(completeUrl, '_new');
      } else {
        window.open(completeUrl, this.target);
      }
      this.netDone = true;
    }
  }

  update() {
    if (this.netDone && (this.status === 'error' || this.status === 'LOADING')) {
      this.status = 'complete';
      const manager = getDownloadManager();
      if (manager?.removeActiveTask) {
        manager.removeActiveTask(this.memName, this.callback);
      }
      return 1;
    }
    return 0;
  }
}

ObjectManager.registerClass('HttpCookie Instance Class', HttpCookieInstance);
