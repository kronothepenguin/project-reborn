export default class {
  m_ar_iValue;
  m_iLength;
  m_iBitsPerWord;
  m_iBitMask;
  m_iCarryMask;

  construct() {
    this.m_ar_iValue = list();
    this.m_iLength = 0;
    this.m_iBitsPerWord = 12;
    this.m_iBitMask = 1;
    for (let i = 1; i <= this.m_iBitsPerWord; i++) {
      this.m_iBitMask = bitOr(this.m_iBitMask * 2, 1);
    }
    this.m_iCarryMask = bitOr(this.m_iBitMask * 2, 1);
    return 1;
  }

  setup(a_vInput) {
    let t_iValue;
    let t_iLength;
    switch (a_vInput.ilk) {
      case Symbol.for("integer"):
        t_iValue = a_vInput;
        t_iLength = ((4 * 8) + 7) / this.m_iBitsPerWord;
        this.m_ar_iValue = list();
        this.m_ar_iValue.addAt(t_iLength, 0);
        for (let i = 1; i <= t_iLength; i++) {
          t_iValue = bitAnd(t_iValue, this.m_iBitMask);
          t_iValue = t_iValue / 2;
          this.m_ar_iValue[i] = t_iValue;
        }
        this.m_iLength = t_iLength;
        while (1) {
          if (this.m_ar_iValue[this.m_iLength] == 0) {
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
  }

  multiply(a_rOperand) {
    const t_ar_iResult = list();
    t_ar_iResult.addAt(this.m_iLength + a_rOperand.m_iLength, 0);
    for (let i = 1; i <= this.m_iLength; i++) {
      for (let j = 1; j <= a_rOperand.m_iLength; j++) {
        let t_iProduct = this.m_ar_iValue[i] * a_rOperand.m_ar_iValue[j];
        let k = i + j;
        while (t_iProduct != 0) {
          t_iProduct = t_iProduct + t_ar_iResult[k];
          t_ar_iResult[k] = bitAnd(t_iProduct, this.m_iBitMask);
          t_iProduct = this.BitRight(t_iProduct, this.m_iBitsPerWord);
          k = k + 1;
        }
      }
    }
    const t_rBigInt = createObject(Symbol.for("temp"), "CBigInt16");
    t_rBigInt.setup(t_ar_iResult);
    return t_rBigInt;
  }

  power(a_rBigIntExp, a_rBigIntMod) {
    const t_rResult = createObject(Symbol.for("temp"), "CBigInt16");
    let t_rBase = this;
    for (let n = 1; n <= a_rBigIntExp.m_iLength; n++) {
      let bit = 1;
      while (bit < this.m_iBitMask) {
        if (bitAnd(a_rBigIntExp.m_ar_iValue[n], bit) != 0) {
          t_rResult = t_rResult.multiply(t_rBase).Modulo(a_rBigIntMod);
        }
        t_rBase = t_rBase.multiply(t_rBase).Modulo(a_rBigIntMod);
      }
    }
    return t_rResult;
  }

  Compare(a_rOperand) {
    if (this.m_iLength == a_rOperand.m_iLength) {
    }
    return 0;
  }

  Modulo(a_rModulus) {
  }

  toString() {
    return EMPTY;
  }

  FromString(a_sHex) {
  }

  BitRight(n, s) {
    s = s % 32;
    if (n > 0) {
      return bitOr(n / power(2, s), 0);
    } else {
      const f = n / power(2, s);
      const i = integer(f);
      if (i > f) {
        return i - 1;
      } else {
        return i;
      }
    }
  }
}
