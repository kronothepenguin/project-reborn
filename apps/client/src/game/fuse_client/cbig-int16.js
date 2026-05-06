import { EMPTY, VOID, bitAnd, bitOr, ilk, integer } from "../../director";

export default function () {
  let t_iValue, t_iLength, i, j, t_iProduct, k, t_rBigInt;
  let t_rResult, t_rBase, n, bit;
  let f;

  return {
    m_ar_iValue: VOID,
    m_iLength: VOID,
    m_iBitsPerWord: VOID,
    m_iBitMask: VOID,
    m_iCarryMask: VOID,

    construct() {
      this.m_ar_iValue = [];
      this.m_iLength = 0;
      this.m_iBitsPerWord = 12;
      this.m_iBitMask = 1;
      for (let i = 1; i <= this.m_iBitsPerWord; i++) {
        this.m_iBitMask = bitOr(this.m_iBitMask * 2, 1);
      }
      this.m_iCarryMask = bitOr(this.m_iBitMask * 2, 1);
      return 1;
    },

    setup(a_vInput) {
      switch (ilk(a_vInput)) {
        case Symbol.for("integer"):
          t_iValue = a_vInput;
          t_iLength = Math.floor(((4 * 8) + 7) / this.m_iBitsPerWord);
          this.m_ar_iValue = [];
          this.m_ar_iValue.addAt(t_iLength, 0);
          for (let i = 1; i <= t_iLength; i++) {
            t_iValue = bitAnd(t_iValue, this.m_iBitMask);
            t_iValue = Math.floor(t_iValue / 2);
            this.m_ar_iValue[i] = t_iValue;
          }
          this.m_iLength = t_iLength;
          while (true) {
            if (this.m_ar_iValue[this.m_iLength] === 0) {
              this.m_iLength = this.m_iLength - 1;
              continue;
            }
            break;
          }
          break;
        case Symbol.for("list"):
          this.m_ar_iValue = a_vInput.m_ar_iValue.duplicate();
          this.m_iValue = a_vInput.m_iValue;
          break;
      }
    },

    multiply(a_rOperand) {
      t_ar_iResult = [];
      t_ar_iResult.addAt(this.m_iLength + a_rOperand.m_iLength, 0);
      for (let i = 1; i <= this.m_iLength; i++) {
        for (let j = 1; j <= a_rOperand.m_iLength; j++) {
          t_iProduct = this.m_ar_iValue[i] * a_rOperand.m_ar_iValue[j];
          k = i + j;
          while (t_iProduct !== 0) {
            t_iProduct = t_iProduct + t_ar_iResult[k];
            t_ar_iResult[k] = bitAnd(t_iProduct, this.m_iBitMask);
            t_iProduct = this.BitRight(t_iProduct, this.m_iBitsPerWord);
            k = k + 1;
          }
        }
      }
      t_rBigInt = _director.createObject(Symbol.for("temp"), "CBigInt16");
      t_rBigInt.setup(t_ar_iResult);
      return t_rBigInt;
    },

    power(a_rBigIntExp, a_rBigIntMod) {
      t_rResult = _director.createObject(Symbol.for("temp"), "CBigInt16");
      t_rBase = this;
      for (let n = 1; n <= a_rBigIntExp.m_iLength; n++) {
        bit = 1;
        while (bit < this.m_iBitMask) {
          if (bitAnd(a_rBigIntExp.m_ar_iValue[n], bit) !== 0) {
            t_rResult = t_rResult.multiply(t_rBase).Modulo(a_rBigIntMod);
          }
          t_rBase = t_rBase.multiply(t_rBase).Modulo(a_rBigIntMod);
        }
      }
      return t_rResult;
    },

    Compare(a_rOperand) {
      if (this.m_iLength === a_rOperand.m_iLength) {
      }
      return 0;
    },

    Modulo(a_rModulus) {
    },

    toString() {
      return EMPTY;
    },

    FromString(a_sHex) {
    },

    BitRight(n, s) {
      s = s % 32;
      if (n > 0) {
        return bitOr(Math.floor(n / Math.pow(2, s)), 0);
      } else {
        f = n / Math.pow(2, s);
        i = integer(f);
        if (i > f) {
          return i - 1;
        } else {
          return i;
        }
      }
    },
  };
}
