import { describe, it, expect } from "vitest";
import { List, list } from "../../types/list.js";

describe("List", () => {
  describe("constructor", () => {
    it("creates empty list", () => {
      const l = new List();
      expect(l).toBeInstanceOf(List);
      expect(l.count).toBe(0);
    });

    it("creates list with variadic arguments", () => {
      const l = new List(1, 2, 3);
      expect(l.count).toBe(3);
      expect(l.getAt(1)).toBe(1);
      expect(l.getAt(2)).toBe(2);
      expect(l.getAt(3)).toBe(3);
    });

    it("creates list with string values", () => {
      const l = new List("a", "b", "c");
      expect(l.count).toBe(3);
      expect(l.getAt(1)).toBe("a");
    });

    it("creates list with mixed types", () => {
      const l = new List(1, "two", 3);
      expect(l.getAt(1)).toBe(1);
      expect(l.getAt(2)).toBe("two");
      expect(l.getAt(3)).toBe(3);
    });
  });

  describe("count property", () => {
    it("returns 0 for empty list", () => {
      const l = new List();
      expect(l.count).toBe(0);
    });

    it("returns correct count", () => {
      const l = new List(10, 20, 30);
      expect(l.count).toBe(3);
    });

    it("updates after add", () => {
      const l = new List(10, 20, 30);
      l.add(40);
      expect(l.count).toBe(4);
    });

    it("updates after deleteAt", () => {
      const l = new List(10, 20, 30);
      l.deleteAt(2);
      expect(l.count).toBe(2);
    });
  });

  describe("Symbol.iterator", () => {
    it("supports for...of iteration", () => {
      const l = new List(10, 20, 30);
      const result = [];
      for (const item of l) {
        result.push(item);
      }
      expect(result).toEqual([10, 20, 30]);
    });

    it("supports spread operator", () => {
      const l = new List(1, 2, 3);
      expect([...l]).toEqual([1, 2, 3]);
    });
  });

  describe("add()", () => {
    it("adds value to end of unsorted list", () => {
      const l = new List(3, 4, 1);
      l.add(2);
      expect([...l]).toEqual([3, 4, 1, 2]);
    });

    it("adds value in sorted position for sorted list", () => {
      const l = new List(1, 4, 5);
      l.sort();
      l.add(2);
      expect([...l]).toEqual([1, 2, 4, 5]);
    });

    it("adds value at beginning of sorted list", () => {
      const l = new List(10, 20, 30);
      l.sort();
      l.add(5);
      expect([...l]).toEqual([5, 10, 20, 30]);
    });

    it("adds value at end of sorted list", () => {
      const l = new List(10, 20, 30);
      l.sort();
      l.add(40);
      expect([...l]).toEqual([10, 20, 30, 40]);
    });
  });

  describe("addAt()", () => {
    it("inserts at specified position", () => {
      const l = new List(3, 2, 4, 5, 6, 7);
      l.addAt(4, 8);
      expect([...l]).toEqual([3, 2, 4, 8, 5, 6, 7]);
    });

    it("inserts at beginning", () => {
      const l = new List(10, 20, 30);
      l.addAt(1, 99);
      expect([...l]).toEqual([99, 10, 20, 30]);
    });

    it("inserts at end", () => {
      const l = new List(10, 20, 30);
      l.addAt(4, 40);
      expect([...l]).toEqual([10, 20, 30, 40]);
    });
  });

  describe("append()", () => {
    it("appends to end of unsorted list", () => {
      const l = new List(1, 2, 3);
      l.append(4);
      expect([...l]).toEqual([1, 2, 3, 4]);
    });

    it("appends to end of sorted list (ignores sort order)", () => {
      const l = new List(1, 3, 4);
      l.sort();
      l.append(2);
      expect([...l]).toEqual([1, 3, 4, 2]);
    });
  });

  describe("deleteAt()", () => {
    it("deletes item at specified position", () => {
      const l = new List("gee", "kayne", "ohashi");
      l.deleteAt(2);
      expect([...l]).toEqual(["gee", "ohashi"]);
    });

    it("deletes first item", () => {
      const l = new List(10, 20, 30);
      l.deleteAt(1);
      expect([...l]).toEqual([20, 30]);
    });

    it("deletes last item", () => {
      const l = new List(10, 20, 30);
      l.deleteAt(3);
      expect([...l]).toEqual([10, 20]);
    });
  });

  describe("deleteOne()", () => {
    it("deletes first occurrence of value", () => {
      const l = new List("Tuesday", "Wednesday", "Friday");
      l.deleteOne("Wednesday");
      expect([...l]).toEqual(["Tuesday", "Friday"]);
    });

    it("deletes only first occurrence when duplicates exist", () => {
      const l = new List(1, 2, 3, 2, 4);
      l.deleteOne(2);
      expect([...l]).toEqual([1, 3, 2, 4]);
    });

    it("does nothing if value not found", () => {
      const l = new List(1, 2, 3);
      l.deleteOne(99);
      expect([...l]).toEqual([1, 2, 3]);
    });
  });

  describe("deleteProp()", () => {
    it("deletes item at position (same as deleteAt for linear lists)", () => {
      const l = new List(10, 20, 30);
      l.deleteProp(2);
      expect([...l]).toEqual([10, 30]);
    });
  });

  describe("duplicate()", () => {
    it("creates a copy of the list", () => {
      const l = new List(1, 2, 3);
      const copy = l.duplicate();
      expect([...copy]).toEqual([1, 2, 3]);
      expect(copy).toBeInstanceOf(List);
    });

    it("copy is independent of original", () => {
      const l = new List(1, 2, 3);
      const copy = l.duplicate();
      copy.add(4);
      expect(l.count).toBe(3);
      expect(copy.count).toBe(4);
    });

    it("duplicates nested lists", () => {
      const inner = new List(10, 20);
      const l = new List(inner, 30);
      const copy = l.duplicate();
      const innerCopy = copy.getAt(1);
      expect([...innerCopy]).toEqual([10, 20]);
      expect(innerCopy).not.toBe(inner);
    });

    it("preserves sorted flag", () => {
      const l = new List(3, 1, 2);
      l.sort();
      const copy = l.duplicate();
      expect(copy.sorted).toBe(true);
      copy.add(0);
      expect([...copy]).toEqual([0, 1, 2, 3]);
    });
  });

  describe("getAt()", () => {
    it("returns item at 1-indexed position", () => {
      const l = new List(10, 12, 15, 22);
      expect(l.getAt(1)).toBe(10);
      expect(l.getAt(2)).toBe(12);
      expect(l.getAt(3)).toBe(15);
      expect(l.getAt(4)).toBe(22);
    });

    it("returns undefined for out of bounds", () => {
      const l = new List(10, 20);
      expect(l.getAt(5)).toBeUndefined();
    });
  });

  describe("getOne()", () => {
    it("returns 1-indexed position of value", () => {
      const l = new List(10, 12, 15, 22);
      expect(l.getOne(12)).toBe(2);
    });

    it("returns 0 if value not found", () => {
      const l = new List(10, 12, 15, 22);
      expect(l.getOne(99)).toBe(0);
    });

    it("returns first occurrence position", () => {
      const l = new List(10, 12, 12, 22);
      expect(l.getOne(12)).toBe(2);
    });
  });

  describe("getPos()", () => {
    it("returns 1-indexed position of value", () => {
      const l = new List(10, 12, 15, 22);
      expect(l.getPos(15)).toBe(3);
    });

    it("returns 0 if value not found", () => {
      const l = new List(10, 12, 15);
      expect(l.getPos(99)).toBe(0);
    });

    it("behaves same as getOne for linear lists", () => {
      const l = new List(10, 20, 30);
      expect(l.getPos(20)).toBe(l.getOne(20));
    });
  });

  describe("getLast()", () => {
    it("returns last item", () => {
      const l = new List(10, 12, 15, 22);
      expect(l.getLast()).toBe(22);
    });

    it("returns only item in single-item list", () => {
      const l = new List(42);
      expect(l.getLast()).toBe(42);
    });

    it("returns undefined for empty list", () => {
      const l = new List();
      expect(l.getLast()).toBeUndefined();
    });
  });

  describe("setAt()", () => {
    it("replaces item at position", () => {
      const l = new List(12, 34, 6, 7, 45);
      l.setAt(4, 10);
      expect([...l]).toEqual([12, 34, 6, 10, 45]);
    });

    it("expands list when position exceeds length", () => {
      const l = new List(1, 2);
      l.setAt(5, 99);
      expect(l.count).toBe(5);
      expect(l.getAt(5)).toBe(99);
      expect(l.getAt(3)).toBe(0);
      expect(l.getAt(4)).toBe(0);
    });
  });

  describe("sort()", () => {
    it("sorts list in alphanumeric order", () => {
      const l = new List(30, 10, 20);
      l.sort();
      expect([...l]).toEqual([10, 20, 30]);
    });

    it("sorts strings alphabetically", () => {
      const l = new List("charlie", "alpha", "bravo");
      l.sort();
      expect([...l]).toEqual(["alpha", "bravo", "charlie"]);
    });

    it("sets sorted flag", () => {
      const l = new List(3, 1, 2);
      expect(l.sorted).toBe(false);
      l.sort();
      expect(l.sorted).toBe(true);
    });

    it("maintains sort order on subsequent add()", () => {
      const l = new List(3, 1, 2);
      l.sort();
      l.add(0);
      expect([...l]).toEqual([0, 1, 2, 3]);
    });
  });
});

describe("list() factory", () => {
  it("creates list with given values", () => {
    const l = list("Gee", "Kayne", "Ohashi");
    expect(l.count).toBe(3);
    expect(l.getAt(1)).toBe("Gee");
    expect(l.getAt(2)).toBe("Kayne");
    expect(l.getAt(3)).toBe("Ohashi");
  });

  it("creates empty list", () => {
    const l = list();
    expect(l.count).toBe(0);
  });

  it("creates list with numeric values", () => {
    const l = list(10, 20, 30);
    expect(l.count).toBe(3);
    expect(l.getAt(1)).toBe(10);
  });
});

describe("bracket access via Proxy", () => {
  it("gets item via list[1]", () => {
    const l = list(10, 20, 30);
    expect(l[1]).toBe(10);
    expect(l[2]).toBe(20);
    expect(l[3]).toBe(30);
  });

  it("sets item via list[2] = value", () => {
    const l = list(10, 20, 30);
    l[2] = 99;
    expect(l[2]).toBe(99);
    expect(l.getAt(2)).toBe(99);
  });

  it("supports string index access", () => {
    const l = list(10, 20, 30);
    expect(l["1"]).toBe(10);
    expect(l["2"]).toBe(20);
  });

  it("supports has check for numeric indices", () => {
    const l = list(10, 20, 30);
    expect(1 in l).toBe(true);
    expect(2 in l).toBe(true);
    expect(3 in l).toBe(true);
    expect(4 in l).toBe(false);
  });

  it("still allows method access through proxy", () => {
    const l = list(10, 20, 30);
    expect(l.count).toBe(3);
    expect(l.getAt(1)).toBe(10);
  });
});

describe("sorted list behavior", () => {
  it("add maintains sort order after sort()", () => {
    const l = new List(5, 3, 1);
    l.sort();
    l.add(2);
    l.add(4);
    expect([...l]).toEqual([1, 2, 3, 4, 5]);
  });

  it("append ignores sort order", () => {
    const l = new List(1, 3, 5);
    l.sort();
    l.append(2);
    expect([...l]).toEqual([1, 3, 5, 2]);
  });

  it("duplicate preserves sorted behavior", () => {
    const l = new List(3, 1, 2);
    l.sort();
    const copy = l.duplicate();
    copy.add(0);
    expect([...copy]).toEqual([0, 1, 2, 3]);
  });
});
