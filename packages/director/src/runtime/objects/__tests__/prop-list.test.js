import { describe, it, expect } from "vitest";
import { PropList, propList } from "../../types/prop-list.js";
import { list } from "../../types/list.js";

describe("PropList", () => {
  describe("constructor", () => {
    it("creates empty proplist", () => {
      const pl = new PropList();
      expect(pl).toBeInstanceOf(PropList);
      expect(pl.count).toBe(0);
    });

    it("creates proplist with key/value pairs", () => {
      const pl = new PropList(Symbol.for("name"), "John", Symbol.for("age"), 30);
      expect(pl.count).toBe(2);
      expect(pl.getaProp(Symbol.for("name"))).toBe("John");
      expect(pl.getaProp(Symbol.for("age"))).toBe(30);
    });

    it("creates proplist with single pair", () => {
      const pl = new PropList(Symbol.for("key"), "value");
      expect(pl.count).toBe(1);
      expect(pl.getaProp(Symbol.for("key"))).toBe("value");
    });
  });

  describe("count property", () => {
    it("returns 0 for empty proplist", () => {
      const pl = new PropList();
      expect(pl.count).toBe(0);
    });

    it("returns correct count", () => {
      const pl = new PropList(Symbol.for("a"), 10, Symbol.for("b"), 20, Symbol.for("c"), 30);
      expect(pl.count).toBe(3);
    });

    it("updates after addProp", () => {
      const pl = new PropList(Symbol.for("a"), 10);
      pl.addProp(Symbol.for("b"), 20);
      expect(pl.count).toBe(2);
    });

    it("updates after deleteProp", () => {
      const pl = new PropList(Symbol.for("a"), 10, Symbol.for("b"), 20);
      pl.deleteProp(Symbol.for("a"));
      expect(pl.count).toBe(1);
    });
  });

  describe("Symbol.iterator", () => {
    it("supports for...of iteration over values", () => {
      const pl = new PropList(Symbol.for("a"), 10, Symbol.for("b"), 20, Symbol.for("c"), 30);
      const result = [];
      for (const value of pl) {
        result.push(value);
      }
      expect(result).toEqual([10, 20, 30]);
    });

    it("supports spread operator", () => {
      const pl = new PropList(Symbol.for("x"), 1, Symbol.for("y"), 2);
      expect([...pl]).toEqual([1, 2]);
    });
  });

  describe("addProp()", () => {
    it("adds property to end of unsorted proplist", () => {
      const pl = new PropList(Symbol.for("gee"), 4, Symbol.for("ohasi"), 1);
      pl.addProp(Symbol.for("kayne"), 3);
      expect(pl.getPropAt(1)).toBe(Symbol.for("gee"));
      expect(pl.getPropAt(2)).toBe(Symbol.for("ohasi"));
      expect(pl.getPropAt(3)).toBe(Symbol.for("kayne"));
    });

    it("adds property in sorted position for sorted proplist", () => {
      const pl = new PropList(Symbol.for("gee"), 4, Symbol.for("ohasi"), 1);
      pl.sort();
      pl.addProp(Symbol.for("kayne"), 3);
      expect(pl.getPropAt(1)).toBe(Symbol.for("gee"));
      expect(pl.getPropAt(2)).toBe(Symbol.for("kayne"));
      expect(pl.getPropAt(3)).toBe(Symbol.for("ohasi"));
    });

    it("creates duplicate property if already exists", () => {
      const pl = new PropList(Symbol.for("gee"), 4, Symbol.for("kayne"), 3, Symbol.for("ohasi"), 1);
      pl.sort();
      pl.addProp(Symbol.for("kayne"), 7);
      expect(pl.count).toBe(4);
      expect(pl.getAt(2)).toBe(3);
      expect(pl.getAt(3)).toBe(7);
    });
  });

  describe("deleteAt()", () => {
    it("deletes entry at specified position", () => {
      const pl = new PropList(Symbol.for("gee"), 1, Symbol.for("kayne"), 2, Symbol.for("ohashi"), 3);
      pl.deleteAt(2);
      expect(pl.count).toBe(2);
      expect(pl.getPropAt(1)).toBe(Symbol.for("gee"));
      expect(pl.getPropAt(2)).toBe(Symbol.for("ohashi"));
    });

    it("deletes first entry", () => {
      const pl = new PropList(Symbol.for("a"), 10, Symbol.for("b"), 20);
      pl.deleteAt(1);
      expect(pl.count).toBe(1);
      expect(pl.getPropAt(1)).toBe(Symbol.for("b"));
    });

    it("deletes last entry", () => {
      const pl = new PropList(Symbol.for("a"), 10, Symbol.for("b"), 20);
      pl.deleteAt(2);
      expect(pl.count).toBe(1);
      expect(pl.getPropAt(1)).toBe(Symbol.for("a"));
    });
  });

  describe("deleteOne()", () => {
    it("deletes first occurrence of value", () => {
      const pl = new PropList(Symbol.for("a"), "Tuesday", Symbol.for("b"), "Wednesday", Symbol.for("c"), "Friday");
      pl.deleteOne("Wednesday");
      expect(pl.count).toBe(2);
      expect(pl.getaProp(Symbol.for("a"))).toBe("Tuesday");
      expect(pl.getaProp(Symbol.for("c"))).toBe("Friday");
      expect(pl.getaProp(Symbol.for("b"))).toBeUndefined();
    });

    it("deletes only first occurrence when duplicates exist", () => {
      const pl = new PropList(Symbol.for("a"), 1, Symbol.for("b"), 2, Symbol.for("c"), 2);
      pl.deleteOne(2);
      expect(pl.count).toBe(2);
      expect(pl.getaProp(Symbol.for("a"))).toBe(1);
      expect(pl.getaProp(Symbol.for("c"))).toBe(2);
    });

    it("does nothing if value not found", () => {
      const pl = new PropList(Symbol.for("a"), 1, Symbol.for("b"), 2);
      pl.deleteOne(99);
      expect(pl.count).toBe(2);
    });
  });

  describe("deleteProp()", () => {
    it("deletes property and its value", () => {
      const pl = new PropList(Symbol.for("height"), 100, Symbol.for("width"), 200, Symbol.for("color"), 34, Symbol.for("ink"), 15);
      pl.deleteProp(Symbol.for("color"));
      expect(pl.count).toBe(3);
      expect(pl.getaProp(Symbol.for("height"))).toBe(100);
      expect(pl.getaProp(Symbol.for("width"))).toBe(200);
      expect(pl.getaProp(Symbol.for("ink"))).toBe(15);
      expect(pl.getaProp(Symbol.for("color"))).toBeUndefined();
    });

    it("deletes only first occurrence of duplicate properties", () => {
      const pl = new PropList(Symbol.for("a"), 1, Symbol.for("b"), 2, Symbol.for("a"), 3);
      pl.deleteProp(Symbol.for("a"));
      expect(pl.count).toBe(2);
      expect(pl.getAt(1)).toBe(2);
      expect(pl.getAt(2)).toBe(3);
    });

    it("does nothing if property not found", () => {
      const pl = new PropList(Symbol.for("a"), 1);
      pl.deleteProp(Symbol.for("nonexistent"));
      expect(pl.count).toBe(1);
    });
  });

  describe("duplicate()", () => {
    it("creates a copy of the proplist", () => {
      const pl = new PropList(Symbol.for("a"), 1, Symbol.for("b"), 2);
      const copy = pl.duplicate();
      expect(copy).toBeInstanceOf(PropList);
      expect(copy.count).toBe(2);
      expect(copy.getaProp(Symbol.for("a"))).toBe(1);
      expect(copy.getaProp(Symbol.for("b"))).toBe(2);
    });

    it("copy is independent of original", () => {
      const pl = new PropList(Symbol.for("a"), 1);
      const copy = pl.duplicate();
      copy.addProp(Symbol.for("b"), 2);
      expect(pl.count).toBe(1);
      expect(copy.count).toBe(2);
    });

    it("duplicates nested lists", () => {
      const inner = list(10, 20);
      const pl = new PropList(Symbol.for("data"), inner);
      const copy = pl.duplicate();
      const innerCopy = copy.getaProp(Symbol.for("data"));
      expect(innerCopy.getAt(1)).toBe(10);
      expect(innerCopy).not.toBe(inner);
    });

    it("preserves sorted flag", () => {
      const pl = new PropList(Symbol.for("c"), 3, Symbol.for("a"), 1);
      pl.sort();
      const copy = pl.duplicate();
      expect(copy.sorted).toBe(true);
      copy.addProp(Symbol.for("b"), 2);
      expect(copy.getPropAt(1)).toBe(Symbol.for("a"));
      expect(copy.getPropAt(2)).toBe(Symbol.for("b"));
      expect(copy.getPropAt(3)).toBe(Symbol.for("c"));
    });
  });

  describe("findPos()", () => {
    it("returns 1-indexed position of property", () => {
      const pl = new PropList(Symbol.for("a"), 10, Symbol.for("b"), 12, Symbol.for("c"), 15, Symbol.for("d"), 22);
      expect(pl.findPos(Symbol.for("c"))).toBe(3);
    });

    it("returns undefined if property not found", () => {
      const pl = new PropList(Symbol.for("a"), 10, Symbol.for("b"), 12);
      expect(pl.findPos(Symbol.for("z"))).toBeUndefined();
    });

    it("returns first position for duplicate properties", () => {
      const pl = new PropList(Symbol.for("a"), 1, Symbol.for("b"), 2, Symbol.for("a"), 3);
      expect(pl.findPos(Symbol.for("a"))).toBe(1);
    });
  });

  describe("findPosNear()", () => {
    it("returns exact position when property exists", () => {
      const pl = new PropList(Symbol.for("Nile"), 2, Symbol.for("Pharaoh"), 4, Symbol.for("Raja"), 0);
      pl.sort();
      expect(pl.findPosNear(Symbol.for("Pharaoh"))).toBe(2);
    });

    it("returns nearest position when property doesn't exist", () => {
      const pl = new PropList(Symbol.for("Nile"), 2, Symbol.for("Pharaoh"), 4, Symbol.for("Raja"), 0);
      pl.sort();
      expect(pl.findPosNear(Symbol.for("Ni"))).toBe(1);
    });

    it("returns 1 for empty proplist", () => {
      const pl = new PropList();
      expect(pl.findPosNear(Symbol.for("test"))).toBe(1);
    });
  });

  describe("getaProp()", () => {
    it("returns value for existing property", () => {
      const pl = new PropList(Symbol.for("john"), 10, Symbol.for("joe"), 12, Symbol.for("cheryl"), 15, Symbol.for("barbara"), 22);
      expect(pl.getaProp(Symbol.for("joe"))).toBe(12);
    });

    it("returns undefined for non-existent property", () => {
      const pl = new PropList(Symbol.for("a"), 1);
      expect(pl.getaProp(Symbol.for("nonexistent"))).toBeUndefined();
    });
  });

  describe("getAt()", () => {
    it("returns value at 1-indexed position", () => {
      const pl = new PropList(Symbol.for("a"), 10, Symbol.for("b"), 12, Symbol.for("c"), 15, Symbol.for("d"), 22);
      expect(pl.getAt(1)).toBe(10);
      expect(pl.getAt(2)).toBe(12);
      expect(pl.getAt(3)).toBe(15);
      expect(pl.getAt(4)).toBe(22);
    });

    it("returns undefined for out of bounds", () => {
      const pl = new PropList(Symbol.for("a"), 10);
      expect(pl.getAt(5)).toBeUndefined();
    });
  });

  describe("getOne()", () => {
    it("returns property symbol for value", () => {
      const pl = new PropList(Symbol.for("a"), 10, Symbol.for("b"), 12, Symbol.for("c"), 15, Symbol.for("d"), 22);
      expect(pl.getOne(12)).toBe(Symbol.for("b"));
    });

    it("returns 0 if value not found", () => {
      const pl = new PropList(Symbol.for("a"), 10);
      expect(pl.getOne(99)).toBe(0);
    });

    it("returns first property for duplicate values", () => {
      const pl = new PropList(Symbol.for("a"), 10, Symbol.for("b"), 10);
      expect(pl.getOne(10)).toBe(Symbol.for("a"));
    });
  });

  describe("getPos()", () => {
    it("returns 1-indexed position of value", () => {
      const pl = new PropList(Symbol.for("a"), 10, Symbol.for("b"), 12, Symbol.for("c"), 15, Symbol.for("d"), 22);
      expect(pl.getPos(12)).toBe(2);
    });

    it("returns 0 if value not found", () => {
      const pl = new PropList(Symbol.for("a"), 10);
      expect(pl.getPos(99)).toBe(0);
    });

    it("returns first occurrence position", () => {
      const pl = new PropList(Symbol.for("a"), 10, Symbol.for("b"), 10);
      expect(pl.getPos(10)).toBe(1);
    });
  });

  describe("getProp()", () => {
    it("returns value for existing property", () => {
      const pl = new PropList(Symbol.for("a"), 10, Symbol.for("b"), 12, Symbol.for("c"), 15, Symbol.for("d"), 22);
      expect(pl.getProp(Symbol.for("c"))).toBe(15);
    });

    it("throws error if property not found", () => {
      const pl = new PropList(Symbol.for("a"), 10);
      expect(() => pl.getProp(Symbol.for("nonexistent"))).toThrow();
    });
  });

  describe("getPropAt()", () => {
    it("returns property symbol at 1-indexed position", () => {
      const pl = new PropList(Symbol.for("a"), 10, Symbol.for("b"), 20, Symbol.for("c"), 30);
      expect(pl.getPropAt(1)).toBe(Symbol.for("a"));
      expect(pl.getPropAt(2)).toBe(Symbol.for("b"));
      expect(pl.getPropAt(3)).toBe(Symbol.for("c"));
    });

    it("throws error for out of bounds", () => {
      const pl = new PropList(Symbol.for("a"), 10);
      expect(() => pl.getPropAt(5)).toThrow();
    });
  });

  describe("setaProp()", () => {
    it("sets value for existing property", () => {
      const pl = new PropList(Symbol.for("a"), 1, Symbol.for("b"), 5);
      pl.setaProp(Symbol.for("b"), 99);
      expect(pl.getaProp(Symbol.for("b"))).toBe(99);
      expect(pl.count).toBe(2);
    });

    it("adds new property if not exists", () => {
      const pl = new PropList(Symbol.for("a"), 1, Symbol.for("b"), 5);
      pl.setaProp(Symbol.for("c"), 10);
      expect(pl.getaProp(Symbol.for("c"))).toBe(10);
      expect(pl.count).toBe(3);
    });
  });

  describe("setAt()", () => {
    it("replaces value at position", () => {
      const pl = new PropList(Symbol.for("a"), 12, Symbol.for("b"), 34, Symbol.for("c"), 6, Symbol.for("d"), 7, Symbol.for("e"), 45);
      pl.setAt(4, 10);
      expect(pl.getAt(4)).toBe(10);
      expect(pl.getPropAt(4)).toBe(Symbol.for("d"));
    });

    it("does nothing for out of bounds position", () => {
      const pl = new PropList(Symbol.for("a"), 10);
      pl.setAt(5, 99);
      expect(pl.count).toBe(1);
    });
  });

  describe("sort()", () => {
    it("sorts proplist alphabetically by property name", () => {
      const pl = new PropList(Symbol.for("a"), 1, Symbol.for("d"), 2, Symbol.for("c"), 3);
      pl.sort();
      expect(pl.getPropAt(1)).toBe(Symbol.for("a"));
      expect(pl.getPropAt(2)).toBe(Symbol.for("c"));
      expect(pl.getPropAt(3)).toBe(Symbol.for("d"));
    });

    it("sets sorted flag", () => {
      const pl = new PropList(Symbol.for("c"), 3, Symbol.for("a"), 1);
      expect(pl.sorted).toBe(false);
      pl.sort();
      expect(pl.sorted).toBe(true);
    });

    it("maintains sort order on subsequent addProp()", () => {
      const pl = new PropList(Symbol.for("c"), 3, Symbol.for("a"), 1);
      pl.sort();
      pl.addProp(Symbol.for("b"), 2);
      expect(pl.getPropAt(1)).toBe(Symbol.for("a"));
      expect(pl.getPropAt(2)).toBe(Symbol.for("b"));
      expect(pl.getPropAt(3)).toBe(Symbol.for("c"));
    });
  });
});

describe("propList() factory", () => {
  it("creates proplist with given key/value pairs", () => {
    const pl = propList(Symbol.for("top"), "red", Symbol.for("sides"), "blue", Symbol.for("bottom"), "green");
    expect(pl.count).toBe(3);
    expect(pl.getaProp(Symbol.for("top"))).toBe("red");
    expect(pl.getaProp(Symbol.for("sides"))).toBe("blue");
    expect(pl.getaProp(Symbol.for("bottom"))).toBe("green");
  });

  it("creates empty proplist", () => {
    const pl = propList();
    expect(pl.count).toBe(0);
  });

  it("creates proplist with numeric values", () => {
    const pl = propList(Symbol.for("a"), 10, Symbol.for("b"), 20);
    expect(pl.count).toBe(2);
    expect(pl.getaProp(Symbol.for("a"))).toBe(10);
  });
});

describe("symbol access via Proxy", () => {
  it("gets property via pl[Symbol.for('key')]", () => {
    const pl = propList(Symbol.for("name"), "John", Symbol.for("age"), 30);
    expect(pl[Symbol.for("name")]).toBe("John");
    expect(pl[Symbol.for("age")]).toBe(30);
  });

  it("sets property via pl[Symbol.for('key')] = value", () => {
    const pl = propList(Symbol.for("name"), "John");
    pl[Symbol.for("age")] = 30;
    expect(pl[Symbol.for("age")]).toBe(30);
    expect(pl.count).toBe(2);
  });

  it("updates existing property via symbol access", () => {
    const pl = propList(Symbol.for("name"), "John");
    pl[Symbol.for("name")] = "Jane";
    expect(pl[Symbol.for("name")]).toBe("Jane");
    expect(pl.count).toBe(1);
  });

  it("supports has check for symbol properties", () => {
    const pl = propList(Symbol.for("a"), 1, Symbol.for("b"), 2);
    expect(Symbol.for("a") in pl).toBe(true);
    expect(Symbol.for("b") in pl).toBe(true);
    expect(Symbol.for("c") in pl).toBe(false);
  });

  it("supports numeric index access", () => {
    const pl = propList(Symbol.for("a"), 10, Symbol.for("b"), 20);
    expect(pl[1]).toBe(10);
    expect(pl[2]).toBe(20);
  });

  it("supports numeric index set", () => {
    const pl = propList(Symbol.for("a"), 10, Symbol.for("b"), 20);
    pl[2] = 99;
    expect(pl[2]).toBe(99);
    expect(pl.getAt(2)).toBe(99);
  });

  it("still allows method access through proxy", () => {
    const pl = propList(Symbol.for("a"), 10);
    expect(pl.count).toBe(1);
    expect(pl.getaProp(Symbol.for("a"))).toBe(10);
  });
});

describe("sorted proplist behavior", () => {
  it("addProp maintains sort order after sort()", () => {
    const pl = new PropList(Symbol.for("c"), 3, Symbol.for("a"), 1);
    pl.sort();
    pl.addProp(Symbol.for("b"), 2);
    pl.addProp(Symbol.for("d"), 4);
    expect(pl.getPropAt(1)).toBe(Symbol.for("a"));
    expect(pl.getPropAt(2)).toBe(Symbol.for("b"));
    expect(pl.getPropAt(3)).toBe(Symbol.for("c"));
    expect(pl.getPropAt(4)).toBe(Symbol.for("d"));
  });

  it("duplicate preserves sorted behavior", () => {
    const pl = new PropList(Symbol.for("c"), 3, Symbol.for("a"), 1);
    pl.sort();
    const copy = pl.duplicate();
    copy.addProp(Symbol.for("b"), 2);
    expect(copy.getPropAt(1)).toBe(Symbol.for("a"));
    expect(copy.getPropAt(2)).toBe(Symbol.for("b"));
    expect(copy.getPropAt(3)).toBe(Symbol.for("c"));
  });

  it("unsorted addProp appends to end", () => {
    const pl = new PropList(Symbol.for("a"), 1, Symbol.for("c"), 3);
    pl.addProp(Symbol.for("b"), 2);
    expect(pl.getPropAt(3)).toBe(Symbol.for("b"));
  });
});
