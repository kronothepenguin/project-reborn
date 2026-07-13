export default class {
  pMemName;
  pMember;
  pProps;

  define(tMemName, tPriority, tProps) {
    this.pMemName = tMemName;
    this.pMember = member(getmemnum(tMemName));
    if (this.pMember.type != Symbol.for("sound")) {
      return error(this, `Sound member not found or not a sound: ${tMemName}`, Symbol.for("define"), Symbol.for("minor"));
    }
    this.pPriority = tPriority;
    if (listp(tProps)) {
      this.pProps = tProps;
    } else {
      this.pProps = propList();
    }
    if (this.pProps.findPos(Symbol.for("volume")) == 0) {
      this.pProps[Symbol.for("volume")] = 255;
    }
    return 1;
  }

  getProperty(tProp) {
    if (tProp == VOID) {
      return 0;
    }
    if (!listp(this.pProps)) {
      return 0;
    }
    return this.pProps[tProp];
  }

  getMember() {
    return this.pMember;
  }

  dump() {
    putInto(undefined, `member:${this.pMemName}${this.pMember}`);
    putInto(undefined, `props:${this.pProps}`);
  }
}
