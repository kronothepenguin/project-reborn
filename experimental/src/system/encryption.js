/**
 * RC4 Encryption Classes
 * 
 * Translated from:
 * - casts/fuse_client/72_RC4 Class.ls
 * - casts/fuse_client/86_tYy1rX5j7e4PLYJLER.ls (RC4 Extended / Obfuscated)
 * 
 * Two variants:
 * 1. RC4 (standard) — used for basic encryption
 * 2. RC4Extended (triple-swap perturbation) — used for server connections
 * 
 * Both output hex strings, not binary.
 */

// ── String Services helpers (inline to avoid circular deps) ────────────

/**
 * Convert integer to 2-digit hex string (like convertIntToHex)
 */
function intToHex(n) {
  const h = (n & 0xFF).toString(16);
  return h.length === 1 ? '0' + h : h;
}

/**
 * Convert 2-char hex string to integer (like convertHexToInt)
 */
function hexToInt(s) {
  return parseInt(s, 16) & 0xFF;
}

// ── Standard RC4 Class ─────────────────────────────────────────────────

/**
 * Standard RC4 implementation.
 * 
 * Original Lingo: 72_RC4 Class.ls
 * Key modes: #old, #artificialKey, #new, #initPremix
 */
export class RC4 {
  constructor() {
    /** @type {Uint8Array} S-box */
    this.sbox = new Uint8Array(256);
    /** @type {number[]} Key array */
    this.key = [];
    /** @type {number} i index */
    this.i = 0;
    /** @type {number} j index */
    this.j = 0;

    // Hardcoded artificial key (512 bytes)
    this._artificialKey = new Uint8Array([
      204, 53, 74, 109, 63, 4, 163, 182, 210, 186, 19, 162, 160, 115, 139, 83,
      235, 177, 14, 15, 11, 127, 4, 210, 222, 138, 10, 138, 151, 236, 158, 186,
      67, 1, 168, 69, 139, 214, 243, 32, 157, 161, 211, 155, 20, 192, 214, 155,
      12, 153, 192, 112, 98, 146, 33, 30, 22, 131, 81, 161, 105, 142, 103, 204,
      112, 9, 167, 185, 176, 51, 27, 166, 249, 228, 24, 165, 197, 25, 166, 216,
      74, 14, 104, 15, 77, 49, 6, 50, 65, 126, 10, 187, 15, 17, 189, 155, 246,
      221, 92, 104, 79, 87, 186, 88, 80, 50, 223, 126, 148, 217, 81, 223, 91,
      70, 165, 237, 150, 95, 195, 205, 199, 176, 156, 122, 187, 232, 252, 230,
      169, 94, 157, 194, 44, 164, 208, 22, 141, 139, 167, 236, 201, 42, 130,
      14, 44, 57, 253, 224, 130, 118, 242, 226, 146, 202, 154, 40, 201, 171,
      160, 91, 143, 144, 150, 197, 169, 204, 121, 131, 139, 112, 214, 196, 74,
      123, 159, 220, 77, 176, 151, 73, 125, 135, 166, 26, 176, 31, 255, 234,
      91, 30, 218, 41, 121, 17, 45, 3, 234, 35, 185, 52, 112, 108, 65, 72,
      184, 93, 225, 113, 62, 0, 110, 38, 43, 15, 44, 114, 162, 167, 69, 40,
      103, 144, 114, 215, 228, 47, 112, 235, 179, 211, 116, 237, 70, 167, 36,
      224, 183, 11, 0, 74, 145, 241, 153, 40, 151, 211, 231, 199, 235, 176,
      109, 95, 160, 141, 137, 236, 39, 17, 246, 97, 120, 227, 12, 1, 195,
      239, 150, 169, 85, 226, 23, 58, 145, 157, 37, 218, 132, 168, 94, 15,
      240, 24, 152, 230, 249, 80, 145, 208, 209, 144, 154, 228, 197, 40, 6,
      248, 90, 15, 1, 82, 145, 77, 220, 27, 167, 0, 149, 0, 103, 53, 226,
      242, 175, 9, 177, 130, 65, 216, 107, 4, 194, 71, 135, 231, 151, 178,
      188, 220, 33, 152, 120, 165, 73, 124, 32, 215, 127, 130, 29, 40, 20, 3,
      212, 254, 106, 42, 98, 7, 8, 129, 195, 30, 74, 118, 169, 81, 88, 235,
      149, 232, 181, 182, 206, 82, 163, 26, 116, 37, 41, 50, 63, 185, 165, 2,
      81, 10, 149, 103, 211, 168, 34, 55, 32, 233, 16, 238, 219, 235, 170,
      255, 244, 12, 89, 211, 88, 33, 24, 38, 190, 75, 70, 86, 89, 2, 189,
      134, 207, 65, 6, 148, 124, 22, 57, 21, 118, 227, 173, 21, 236, 236,
      139, 189, 230, 153, 153, 182, 230, 216, 26, 0, 9, 50, 32, 189, 97, 3,
      208, 201, 103, 163, 96, 0, 42, 11, 173, 98, 102, 76, 31, 243, 59, 71,
      223, 252, 186, 157, 231, 90, 212, 83, 10, 69, 69, 165, 209, 112, 157,
      237, 24, 90, 4, 44, 247, 32, 159, 126, 171, 99, 216, 196, 228, 217,
      157, 143, 32, 16, 111, 67, 106, 231, 10, 167, 13, 240, 182, 105, 52,
      12, 84, 91, 243, 205, 180, 180, 35, 58, 238, 240, 0, 209, 48, 249,
      243, 209, 93, 10, 22, 183, 5, 177, 110, 16, 188, 201, 240, 194, 11,
      76, 219, 67, 254, 176, 139, 66, 81, 138, 109, 178, 71, 143, 74, 217,
      52, 0, 127, 190, 12, 214, 231, 84, 239, 165, 155, 89, 95, 106, 62, 30,
      182, 137, 85, 39, 221, 51, 188, 149, 104, 167, 71, 11, 220, 212, 246,
      114, 10, 4, 216, 127, 233, 231, 178, 174, 181, 29, 49, 118, 177, 108,
      156, 174, 118, 196, 216, 106, 203, 96, 65, 12, 140, 248, 152, 35, 152,
      17, 89, 136, 138, 94, 5, 190, 92, 189, 16, 216, 61, 70, 165, 36, 238,
      167, 16, 61, 206, 140, 226, 251, 37, 225, 211, 111, 42, 195, 36, 248,
      233, 67, 146, 100, 244, 23, 154, 103, 48, 4, 15, 33, 169, 151, 13,
      151, 115, 173, 37, 103, 172, 23, 182, 29, 22, 25, 54, 46, 188, 14, 24,
      12, 182, 241, 163, 90, 121, 172, 29, 73, 191, 91, 232, 229, 197, 200,
      32, 7, 67, 214, 141, 248, 10, 135, 168, 4, 144, 17, 94, 228, 76, 202,
      130, 174, 251, 170, 100, 173, 232, 183, 132, 130, 35, 163, 1, 154, 134,
      56, 202, 13, 190, 224, 56, 107, 107, 244, 16, 12, 149, 220, 120, 245,
      179, 103, 85, 255, 195, 187, 191, 82, 225, 13, 206, 106, 60, 212, 12,
      211, 247, 112, 185, 5, 56, 226, 236, 179, 181, 208, 204, 16, 159, 158,
      36, 65, 101, 148, 23, 89, 125, 27, 61, 117, 255, 142, 32, 138, 105,
      166, 203, 253, 113, 138, 30, 247, 250, 198, 21, 244, 113, 40, 161, 229,
      179, 100, 76, 30, 177, 69, 87, 90, 9, 135, 254, 108, 99, 145, 195,
      145, 138, 223, 237, 52, 126, 244, 109, 171, 44, 0, 187, 129, 127, 49,
      220, 100, 253, 0, 116, 93, 87, 39, 245, 5, 54, 203, 241, 155, 255,
      125, 80, 253, 75, 71, 242, 147, 153, 148, 214, 91, 33, 181, 78, 10, 82,
      171, 89, 179, 221, 144, 224, 138, 112, 254, 152, 186, 190, 224, 44,
      251, 60, 133, 65, 70, 72, 203, 126, 123, 212, 108, 68, 185, 42, 208,
      51, 11, 177, 3, 24, 207, 14, 148, 113, 55, 1, 19, 179, 31, 133, 11,
      227, 72, 145, 242, 157, 244, 239, 129, 124, 109, 56, 134, 56, 95, 110,
      161, 73, 151, 136, 67, 176, 201, 193, 70, 53, 31, 238, 84, 81, 65, 50,
      182, 20, 17, 247, 179, 217, 14, 34, 182, 97, 55, 117, 176, 108, 234,
      147, 89, 168, 7, 251, 212, 22, 107, 63, 248, 179, 222, 167, 214, 136,
      74, 53, 47, 120, 233, 131, 41, 167, 220, 56, 12, 51, 125, 207, 112,
      179, 211, 47, 134, 223, 112, 223, 46, 249, 24, 64, 58, 36, 187, 77,
      132, 116, 116, 111, 36, 127, 217, 177, 24, 58, 102, 166, 105, 119, 234,
      187, 198, 77, 153, 23, 157, 103, 92, 33, 136, 182, 131, 154, 141, 149,
      4, 117, 213, 226, 64, 116, 55, 6, 159, 126, 225
    ]);
  }

  /**
   * Initialize RC4 with a key
   * 
   * @param {string|number} myKey - The key (string or number)
   * @param {string} [mode] - Key mode: 'old', 'artificialKey', 'new', 'initPremix'
   */
  setKey(myKey, mode) {
    const keyStr = String(myKey);
    const keyArr = new Uint8Array(256);

    // Default mode detection
    if (mode === undefined) {
      mode = (typeof myKey === 'number') ? 'artificialKey' : 'old';
    }

    switch (mode) {
      case 'old':
      case undefined: {
        for (let q = 0; q < 256; q++) {
          keyArr[q] = keyStr.charCodeAt(q % keyStr.length) & 0xFF;
          this.sbox[q] = q;
        }
        break;
      }

      case 'artificialKey': {
        const tMyKey = typeof myKey === 'number' ? myKey : 0;
        let len = (tMyKey & 248) / 8;
        if (len < 20) len += 20;
        const tOffset = tMyKey % 1024;

        const ckey = new Uint8Array(len);
        for (let q = 0; q < len; q++) {
          const tGiven = this._bitShiftRight(tMyKey, q % 32);
          const tOwn = this._artificialKey[Math.abs(tOffset + q) % this._artificialKey.length];
          ckey[q] = (tGiven ^ tOwn) & 32767;
        }
        for (let q = 0; q < 256; q++) {
          keyArr[q] = ckey[q % len] & 0xFF;
          this.sbox[q] = q;
        }
        break;
      }

      case 'new': {
        for (let q = 0; q < 256; q++) {
          keyArr[q] = q;
        }
        for (let q = 0; q < 1020; q++) {
          keyArr[q % 256] = (keyStr.charCodeAt(q % keyStr.length) + keyArr[q % 256]) % 256;
        }
        for (let q = 0; q < 256; q++) {
          this.sbox[q] = q;
        }
        break;
      }

      case 'initPremix': {
        for (let q = 0; q < 256; q++) {
          keyArr[q] = keyStr.charCodeAt(q % keyStr.length) & 0xFF;
          this.sbox[q] = q;
        }
        break;
      }
    }

    this.key = Array.from(keyArr);

    // Key-scheduling algorithm (KSA)
    let j = 0;
    for (let q = 0; q < 256; q++) {
      j = (j + this.sbox[q] + keyArr[q]) % 256;
      const temp = this.sbox[q];
      this.sbox[q] = this.sbox[j];
      this.sbox[j] = temp;
    }

    // Reset indices
    this.i = 0;
    this.j = 0;

    // Pre-mix for initPremix mode
    if (mode === 'initPremix') {
      const testData = '1wz8rzgiv87708l9oi7ot8l9smdqv5yvzz8tavkyuoi9p3kgrrq7r5p53kchnb5hly8jkfx5hsoo6imx8o5ktczwdst8dooa7r331wkrw8zi8789io89mq5vztvyo93gr755khbhyjf5soixokcws8oar3wr';
      this._preMixEncode(testData, 17);
    }
  }

  /**
   * Encrypt a string to hex
   * 
   * @param {string} data - Plaintext string
   * @returns {string} Hex-encoded ciphertext
   */
  encipher(data) {
    // Convert string to bytes
    const bytes = [];
    for (let e = 0; e < data.length; e++) {
      const a = data.charCodeAt(e);
      if (a > 255) {
        bytes.push(Math.floor(a / 256));
        if (a % 256) bytes.push(a % 256);
      } else {
        bytes.push(a);
      }
    }

    let cipher = '';
    for (let a = 0; a < bytes.length; a++) {
      this.i = (this.i + 1) % 256;
      this.j = (this.j + this.sbox[this.i]) % 256;

      // Swap
      const temp = this.sbox[this.i];
      this.sbox[this.i] = this.sbox[this.j];
      this.sbox[this.j] = temp;

      const d = this.sbox[(this.sbox[this.i] + this.sbox[this.j]) % 256];
      cipher += intToHex(bytes[a] ^ d);
    }

    return cipher;
  }

  /**
   * Decrypt hex string to plaintext
   * 
   * @param {string} data - Hex-encoded ciphertext
   * @returns {string} Decrypted plaintext
   */
  decipher(data) {
    let cipher = '';

    for (let a = 0; a < data.length; a += 2) {
      this.i = (this.i + 1) % 256;
      this.j = (this.j + this.sbox[this.i]) % 256;

      // Swap
      const temp = this.sbox[this.i];
      this.sbox[this.i] = this.sbox[this.j];
      this.sbox[this.j] = temp;

      const d = this.sbox[(this.sbox[this.i] + this.sbox[this.j]) % 256];
      const t = hexToInt(data.substring(a, a + 2));
      cipher += String.fromCharCode(t ^ d);
    }

    return cipher;
  }

  /**
   * Pre-mix: encode test data through cipher
   */
  _preMixEncode(testData, count) {
    for (let l = 0; l < count; l++) {
      this.encipher(testData);
    }
  }

  /**
   * Pre-mix: decode test data through cipher
   */
  _preMixDecode(testData, count) {
    for (let k = 0; k < count; k++) {
      this.decipher(testData);
    }
  }

  /**
   * Bit shift right (simulates Lingo's bitOr(x / power(2, n), 0))
   */
  _bitShiftRight(x, n) {
    return Math.floor(x / Math.pow(2, n));
  }
}

// ── RC4 Extended (Obfuscated / Triple-Swap) ────────────────────────────

/**
 * RC4 Extended with triple-swap perturbation.
 * 
 * Original Lingo: 86_tYy1rX5j7e4PLYJLER.ls (obfuscated)
 * 
 * Differences from standard RC4:
 * - Additional sbox swap at computed indices (t_i, t_j) every byte
 * - Conditional extra swap when q === 46, 67, or 192
 * - Extra key modes: 'initMUS', 'initConnect' with hardcoded key string
 * - Hardcoded mixing key: "mWxFRJnGJ5T9Si0OMVvEBBm8laihXkN8GmH6fuv7ldZhLyGRRKCcGzziPYBaJom"
 */
export class RC4Extended extends RC4 {
  constructor() {
    super();

    // Hardcoded mixing key (63 chars, used in initMUS/initConnect modes)
    this._mixKey = 'mWxFRJnGJ5T9Si0OMVvEBBm8laihXkN8GmH6fuv7ldZhLyGRRKCcGzziPYBaJom';

    // Pre-mix test string (used in initMUS/initConnect initialization)
    this._preMixString = 'NV6VVFPoC7FLDlzDUri3qcOAg9cRoFOmsYR9ffDGy5P8HfF6eekX40SFSVfJ1mDb3lcpYRqdg28sp61eHkPukKbqTu1JsVEKiRavi04YtSzUsLXaYSa5BEGwg5G2OF';

    // Post-encode test string (applied after every encipher call)
    this._postEncodeTest = 'xllVGKnnQcW8aX4WefdKrBWTqiW5EwT';
  }

  /**
   * Initialize RC4 Extended with key
   * 
   * @param {string|number} myKey - The key
   * @param {string} [mode] - Key mode: 'old', 'artificialKey', 'new', 'initMUS', 'initConnect'
   * @param {string} [otherKey] - Secondary key for initConnect mode
   */
  setKey(myKey, mode, otherKey) {
    const keyStr = String(myKey);
    const keyArr = new Uint8Array(256);

    if (mode === undefined) {
      mode = (typeof myKey === 'number') ? 'artificialKey' : 'old';
    }

    switch (mode) {
      case 'old':
      case undefined: {
        for (let q = 0; q < 256; q++) {
          keyArr[q] = keyStr.charCodeAt(q % keyStr.length) & 0xFF;
          this.sbox[q] = q;
        }
        break;
      }

      case 'artificialKey': {
        const tMyKey = typeof myKey === 'number' ? myKey : 0;
        let len = (tMyKey & 248) / 8;
        if (len < 20) len += 20;
        const tOffset = tMyKey % 1024;

        const ckey = new Uint8Array(len);
        for (let q = 0; q < len; q++) {
          const tGiven = this._bitShiftRight(tMyKey, q % 32);
          const tOwn = this._artificialKey[Math.abs(tOffset + q) % this._artificialKey.length];
          ckey[q] = (tGiven ^ tOwn) & 32767;
        }
        for (let q = 0; q < 256; q++) {
          keyArr[q] = ckey[q % len] & 0xFF;
          this.sbox[q] = q;
        }
        break;
      }

      case 'new': {
        for (let q = 0; q < 256; q++) {
          keyArr[q] = q;
        }
        for (let q = 0; q < 1020; q++) {
          keyArr[q % 256] = (keyStr.charCodeAt(q % keyStr.length) + keyArr[q % 256]) % 256;
        }
        for (let q = 0; q < 256; q++) {
          this.sbox[q] = q;
        }
        break;
      }

      case 'initMUS': {
        // XOR with hardcoded mixing key
        let modKey = '';
        let l = 0;
        for (let k = 0; k < keyStr.length; k++) {
          const val = keyStr.charCodeAt(k) ^ this._mixKey.charCodeAt(l);
          modKey += String.fromCharCode(val);
          l++;
          if (l >= this._mixKey.length) l = 0;
        }
        for (let q = 0; q < 256; q++) {
          keyArr[q] = modKey.charCodeAt(q % modKey.length) & 0xFF;
          this.sbox[q] = q;
        }
        break;
      }

      case 'initConnect': {
        const otherKeyStr = String(otherKey || '');

        // First pass: XOR with otherKey
        let modKey = '';
        let l = 0;
        for (let k = 0; k < keyStr.length; k++) {
          const val = keyStr.charCodeAt(k) ^ otherKeyStr.charCodeAt(l);
          modKey += String.fromCharCode(val);
          l++;
          if (l >= otherKeyStr.length) l = 0;
        }

        // Second pass: XOR result with hardcoded mixing key
        modKey = '';
        l = 0;
        for (let k = 0; k < modKey.length; k++) {
          const val = modKey.charCodeAt(k) ^ this._mixKey.charCodeAt(l);
          modKey += String.fromCharCode(val);
          l++;
          if (l >= this._mixKey.length) l = 0;
        }

        for (let q = 0; q < 256; q++) {
          keyArr[q] = modKey.charCodeAt(q % modKey.length) & 0xFF;
          this.sbox[q] = q;
        }
        break;
      }
    }

    this.key = Array.from(keyArr);

    // KSA
    let j = 0;
    for (let q = 0; q < 256; q++) {
      j = (j + this.sbox[q] + keyArr[q]) % 256;
      const temp = this.sbox[q];
      this.sbox[q] = this.sbox[j];
      this.sbox[j] = temp;
    }

    // Reset indices
    this.i = 0;
    this.j = 0;
    this.q = 0; // Extra state variable for RC4Extended

    // Pre-mix for initConnect/initMUS modes (52 rounds)
    if (mode === 'initConnect' || mode === 'initMUS') {
      for (let l = 0; l < 52; l++) {
        this._cryptBytes(this._preMixString);
      }
    }
  }

  /**
   * Encrypt with post-encoding step
   */
  encipher(data) {
    const result = this._cryptBytes(data);
    // Post-encode: run test string through cipher
    this._cryptBytes(this._postEncodeTest);
    return result;
  }

  /**
   * Decrypt (no post-encoding step for decipher)
   */
  decipher(data) {
    return this._decryptBytes(data);
  }

  /**
   * Core encryption: bytes → hex
   */
  _cryptBytes(data) {
    // Convert string to bytes
    const bytes = [];
    for (let e = 0; e < data.length; e++) {
      const a = data.charCodeAt(e);
      if (a > 255) {
        bytes.push(Math.floor(a / 256));
        if (a % 256) bytes.push(a % 256);
      } else {
        bytes.push(a);
      }
    }

    let cipher = '';
    for (let a = 0; a < bytes.length; a++) {
      this.q = (this.q + 1) % 256;
      this.j = (this.j + this.sbox[this.q]) % 256;

      // Standard swap
      const temp = this.sbox[this.q];
      this.sbox[this.q] = this.sbox[this.j];
      this.sbox[this.j] = temp;

      // ── Triple-swap perturbation ──
      // Additional swap at computed indices
      const t_i = (17 * (this.q + 19)) % 256;
      const t_j = (this.j + this.sbox[t_i]) % 256;
      const temp2 = this.sbox[t_i];
      this.sbox[t_i] = this.sbox[t_j];
      this.sbox[t_j] = temp2;

      // Conditional extra swap at specific q values
      if (this.q === 46 || this.q === 67 || this.q === 192) {
        const t2_i = (297 * (t_i + 67)) % 256;
        const t2_j = (t_j + this.sbox[t2_i]) % 256;
        const temp3 = this.sbox[t2_i];
        this.sbox[t2_i] = this.sbox[t2_j];
        this.sbox[t2_j] = temp3;
      }

      const d = this.sbox[(this.sbox[this.q] + this.sbox[this.j]) % 256];
      cipher += intToHex(bytes[a] ^ d);
    }

    // Randomize i (anti-debugging)
    this.i = (Math.random() * 256 | 0) - 1;
    return cipher;
  }

  /**
   * Core decryption: hex → bytes
   */
  _decryptBytes(data) {
    let cipher = '';

    for (let a = 0; a < data.length; a += 2) {
      this.q = (this.q + 1) % 256;
      this.j = (this.j + this.sbox[this.q]) % 256;

      // Standard swap
      const temp = this.sbox[this.q];
      this.sbox[this.q] = this.sbox[this.j];
      this.sbox[this.j] = temp;

      // ── Triple-swap perturbation ──
      const t_i = (17 * (this.q + 19)) % 256;
      const t_j = (this.j + this.sbox[t_i]) % 256;
      const temp2 = this.sbox[t_i];
      this.sbox[t_i] = this.sbox[t_j];
      this.sbox[t_j] = temp2;

      if (this.q === 46 || this.q === 67 || this.q === 192) {
        const t2_i = (297 * (t_i + 67)) % 256;
        const t2_j = (t_j + this.sbox[t2_i]) % 256;
        const temp3 = this.sbox[t2_i];
        this.sbox[t2_i] = this.sbox[t2_j];
        this.sbox[t2_j] = temp3;
      }

      const d = this.sbox[(this.sbox[this.q] + this.sbox[this.j]) % 256];
      const t = hexToInt(data.substring(a, a + 2));
      cipher += String.fromCharCode(t ^ d);
    }

    this.i = (Math.random() * 256 | 0) - 1;
    return cipher;
  }
}
