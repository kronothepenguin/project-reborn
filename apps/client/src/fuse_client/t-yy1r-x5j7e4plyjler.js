// fuse_client/86_tYy1rX5j7e4PLYJLER.ls → t-yy1r-x5j7e4plyjler.js
// Obfuscated encryption class - RC4 variant with additional mixing

import {
  symbol,
  stringp,
  integerp,
  voidP,
  listp,
  length,
  charToNum,
  numToChar,
  bitOr,
  bitAnd,
  bitXor,
  power,
  random,
  chars,
  value,
  getStringServices,
  createPropList,
  EMPTY,
} from '../core/lingo-runtime.js'

export class TYy1rX5j7e4PLYJLERClass {
  constructor() {
    this.pR3hu24v5 = []
    this.q = 0
    this.j = 0
    this.i = 0
  }

  construct() {
    this.pR3hu24v5 = []
    this.q = 0
    this.j = 0
    this.i = 0
    return true
  }

  qe2AkKOGGKDTTnd1Nei(tMyKey, tMode, tOtherKey) {
    const tMyKeyS = String(tMyKey)
    this.pR3hu24v5 = []
    const tKey = []
    tOtherKey = String(tOtherKey)

    const artificialKey = [204, 53, 74, 109, 63, 4, 163, 182, 210, 186, 19, 162, 160, 115, 139, 83, 235, 177, 14, 15, 11, 127, 4, 210, 222, 138, 10, 138, 151, 236, 158, 186, 67, 1, 168, 69, 139, 214, 243, 32, 157, 161, 211, 155, 20, 192, 214, 155, 12, 153, 192, 112, 98, 146, 33, 30, 22, 131, 81, 161, 105, 142, 103, 204, 112, 9, 167, 185, 176, 51, 27, 166, 249, 228, 24, 165, 197, 25, 166, 216, 74, 14, 104, 15, 77, 49, 6, 50, 65, 126, 10, 187, 15, 17, 189, 155, 246, 221, 92, 104, 79, 87, 186, 88, 80, 50, 223, 126, 148, 217, 81, 223, 91, 70, 165, 237, 150, 95, 195, 205, 199, 176, 156, 122, 187, 232, 252, 230, 169, 94, 157, 194, 44, 164, 208, 22, 141, 139, 167, 236, 201, 42, 130, 14, 44, 57, 253, 224, 130, 118, 242, 226, 146, 202, 154, 40, 201, 171, 160, 91, 143, 144, 150, 197, 169, 204, 121, 131, 139, 112, 214, 196, 74, 123, 159, 220, 77, 176, 151, 73, 125, 135, 166, 26, 176, 31, 255, 234, 91, 30, 218, 41, 121, 17, 45, 3, 234, 35, 185, 52, 112, 108, 65, 72, 184, 93, 225, 113, 62, 0, 110, 38, 43, 15, 44, 114, 162, 167, 69, 40, 103, 144, 114, 215, 228, 47, 112, 235, 179, 211, 116, 237, 70, 167, 36, 224, 183, 11, 0, 74, 145, 241, 153, 40, 151, 211, 231, 199, 235, 176, 109, 95, 160, 141, 137, 236, 39, 17, 246, 97, 120, 227, 12, 1, 195, 239, 150, 169, 85, 226, 23, 58, 145, 157, 37, 218, 132, 168, 94, 15, 240, 24, 152, 230, 249, 80, 145, 208, 209, 144, 154, 228, 197, 40, 6, 248, 90, 15, 1, 82, 145, 77, 220, 27, 167, 0, 149, 0, 103, 53, 226, 242, 175, 9, 177, 130, 65, 216, 107, 4, 194, 71, 135, 231, 151, 178, 188, 220, 33, 152, 120, 165, 73, 124, 32, 215, 127, 130, 29, 40, 20, 3, 212, 254, 106, 42, 98, 7, 8, 129, 195, 30, 74, 118, 169, 81, 88, 235, 149, 232, 181, 182, 206, 82, 163, 26, 116, 37, 41, 50, 63, 185, 165, 2, 81, 10, 149, 103, 211, 168, 34, 55, 32, 233, 16, 238, 219, 235, 170, 255, 244, 12, 89, 211, 88, 33, 24, 38, 190, 75, 70, 86, 89, 2, 189, 134, 207, 65, 6, 148, 124, 22, 57, 21, 118, 227, 173, 21, 236, 236, 139, 189, 230, 153, 153, 182, 230, 216, 26, 0, 9, 50, 32, 189, 9]

    if (voidP(tMode)) {
      if (voidP(value(tMyKey))) {
        tMode = symbol('#old')
      } else {
        tMode = symbol('#artificialKey')
      }
    }

    switch (tMode) {
      case symbol('#old'):
      case null:
        for (let q = 0; q <= 255; q++) {
          tKey[q + 1] = charToNum(tMyKeyS[q % tMyKeyS.length])
          this.pR3hu24v5[q + 1] = q
        }
        break
      case symbol('#artificialKey'): {
        let len = bitAnd(tMyKey, 248) / 8
        if (len < 20) len += 20
        const tOffset = tMyKey % 1024
        const ckey = []
        for (let q = 0; q < len; q++) {
          const tGiven = this.b6(tMyKey, q % 32)
          const tOwn = artificialKey[(Math.abs(tOffset + q) % artificialKey.length)]
          ckey[q + 1] = bitAnd(bitXor(tGiven, tOwn), 32767)
        }
        for (let q = 0; q <= 255; q++) {
          tKey[q + 1] = ckey[(q % len) + 1]
          this.pR3hu24v5[q + 1] = q
        }
        break
      }
      case symbol('#new'):
        for (let q = 0; q <= 255; q++) {
          tKey[q + 1] = q
        }
        for (let q = 0; q <= 1019; q++) {
          tKey[(q % 256) + 1] = (charToNum(tMyKeyS[q % tMyKeyS.length]) + tKey[(q % 256) + 1]) % 256
        }
        for (let q = 0; q <= 255; q++) {
          this.pR3hu24v5[q + 1] = q
        }
        break
      case symbol('#initMUS'): {
        let tModKey = ''
        let l = 1
        const mixKey = 'mWxFRJnGJ5T9Si0OMVvEBBm8laihXkN8GmH6fuv7ldZhLyGRRKCcGzziPYBaJom'
        for (let k = 0; k < tMyKeyS.length; k++) {
          const tVal = bitXor(charToNum(tMyKeyS[k]), charToNum(mixKey[l - 1]))
          tModKey += numToChar(tVal)
          l++
          if (l > 63) l = 1
        }
        for (let q = 0; q <= 255; q++) {
          tKey[q + 1] = charToNum(tModKey[q % tModKey.length])
          this.pR3hu24v5[q + 1] = q
        }
        break
      }
      case symbol('#initConnect'): {
        let tModKey = ''
        let l = 1
        for (let k = 0; k < tMyKeyS.length; k++) {
          const tVal = bitXor(charToNum(tMyKeyS[k]), charToNum(tOtherKey[l - 1]))
          tModKey += numToChar(tVal)
          l++
          if (l > tOtherKey.length) l = 1
        }
        const tModKey2 = tModKey
        tModKey = ''
        l = 1
        const mixKey2 = 'mWxFRJnGJ5T9Si0OMVvEBBm8laihXkN8GmH6fuv7ldZhLyGRRKCcGzziPYBaJom'
        for (let k = 0; k < tModKey2.length; k++) {
          const tVal = bitXor(charToNum(tModKey2[k]), charToNum(mixKey2[l - 1]))
          tModKey += numToChar(tVal)
          l++
          if (l > 63) l = 1
        }
        for (let q = 0; q <= 255; q++) {
          tKey[q + 1] = charToNum(tModKey[q % tModKey.length])
          this.pR3hu24v5[q + 1] = q
        }
        break
      }
    }

    this.j = 0
    for (let q = 0; q <= 255; q++) {
      this.j = (this.j + this.pR3hu24v5[q + 1] + tKey[q + 1]) % 256
      const k = this.pR3hu24v5[q + 1]
      this.pR3hu24v5[q + 1] = this.pR3hu24v5[this.j + 1]
      this.pR3hu24v5[this.j + 1] = k
    }
    this.q = 0
    this.j = 0
    this.i = 0

    if ((tMode === symbol('#initConnect')) || (tMode === symbol('#initMUS'))) {
      const tPrMixString = 'NV6VVFPoC7FLDlzDUri3qcOAg9cRoFOmsYR9ffDGy5P8HfF6eekX40SFSVfJ1mDb3lcpYRqdg28sp61eHkPukKbqTu1JsVEKiRavi04YtSzUsLXaYSa5BEGwg5G2OF'
      for (let l = 0; l < 52; l++) {
        this.zLmj71sZDldCwpaZLbqHds(tPrMixString)
      }
    }
  }

  lzNP3UFWUtBTs1stvSHGgk(tdata) {
    const tCipher = this.zLmj71sZDldCwpaZLbqHds(tdata)
    this.zLmj71sZDldCwpaZLbqHds('xllVGKnnQcW8aX4WefdKrBWTqiW5EwT')
    return tCipher
  }

  zLmj71sZDldCwpaZLbqHds(tdata) {
    let tCipher = ''
    const tBytes = []
    for (let e = 0; e < tdata.length; e++) {
      let a = charToNum(tdata[e])
      if (a > 255) {
        tBytes.push(Math.floor(a / 256))
        if (a % 256) {
          tBytes.push(a % 256)
        }
        continue
      }
      tBytes.push(a)
    }
    const tStrServ = getStringServices()
    for (let a = 0; a < tBytes.length; a++) {
      this.q = (this.q + 1) % 256
      this.j = (this.j + this.pR3hu24v5[this.q + 1]) % 256
      const temp = this.pR3hu24v5[this.q + 1]
      this.pR3hu24v5[this.q + 1] = this.pR3hu24v5[this.j + 1]
      this.pR3hu24v5[this.j + 1] = temp

      const t_i = (17 * (this.q + 19)) % 256
      const t_j = (this.j + this.pR3hu24v5[t_i + 1]) % 256
      const temp2 = this.pR3hu24v5[t_i + 1]
      this.pR3hu24v5[t_i + 1] = this.pR3hu24v5[t_j + 1]
      this.pR3hu24v5[t_j + 1] = temp2

      if ((this.q === 46) || (this.q === 67) || (this.q === 192)) {
        const t2_i = (297 * (t_i + 67)) % 256
        const t2_j = (t_j + this.pR3hu24v5[t2_i + 1]) % 256
        const temp3 = this.pR3hu24v5[t2_i + 1]
        this.pR3hu24v5[t2_i + 1] = this.pR3hu24v5[t2_j + 1]
        this.pR3hu24v5[t2_j + 1] = temp3
      }

      const d = this.pR3hu24v5[((this.pR3hu24v5[this.q + 1] + this.pR3hu24v5[this.j + 1]) % 256) + 1]
      tCipher += tStrServ.convertIntToHex(bitXor(tBytes[a], d))
    }
    this.i = random(256) - 1
    return tCipher
  }

  TTF97D0LvibV6X(tdata) {
    let tCipher = ''
    const tStrServ = getStringServices()
    for (let a = 0; a < tdata.length; a += 2) {
      this.q = (this.q + 1) % 256
      this.j = (this.j + this.pR3hu24v5[this.q + 1]) % 256
      const temp = this.pR3hu24v5[this.q + 1]
      this.pR3hu24v5[this.q + 1] = this.pR3hu24v5[this.j + 1]
      this.pR3hu24v5[this.j + 1] = temp

      const t_i = (17 * (this.q + 19)) % 256
      const t_j = (this.j + this.pR3hu24v5[t_i + 1]) % 256
      const temp2 = this.pR3hu24v5[t_i + 1]
      this.pR3hu24v5[t_i + 1] = this.pR3hu24v5[t_j + 1]
      this.pR3hu24v5[t_j + 1] = temp2

      if ((this.q === 46) || (this.q === 67) || (this.q === 192)) {
        const t2_i = (297 * (t_i + 67)) % 256
        const t2_j = (t_j + this.pR3hu24v5[t2_i + 1]) % 256
        const temp3 = this.pR3hu24v5[t2_i + 1]
        this.pR3hu24v5[t2_i + 1] = this.pR3hu24v5[t2_j + 1]
        this.pR3hu24v5[t2_j + 1] = temp3
      }

      const d = this.pR3hu24v5[((this.pR3hu24v5[this.q + 1] + this.pR3hu24v5[this.j + 1]) % 256) + 1]
      const t = tStrServ.convertHexToInt(tdata.substring(a, a + 2))
      tCipher += numToChar(bitXor(t, d))
    }
    this.i = random(256) - 1
    return tCipher
  }

  jfh2ZSJi5QnANFH() {
    const tKeyMinLength = 30
    const tKeyLengthVariation = 40
    const tCharacters = 'abcdefghijklmnopqrstuvwxyz1234567890'
    const tLength = tKeyMinLength + Math.abs(random(65536) % tKeyLengthVariation)
    let tTable = ''
    let tKey = ''
    for (let i = 0; i < tLength; i++) {
      const c1 = tCharacters[random(65536) % tCharacters.length]
      const c2 = tCharacters[random(65536) % tCharacters.length]
      tTable += c1 + c2
      tKey += c2
    }
    return tTable + tKey
  }

  b6(x, n) {
    return Math.floor(x / Math.pow(2, n))
  }

  handlers() {
    return []
  }

  handler() {
    return 0
  }
}
