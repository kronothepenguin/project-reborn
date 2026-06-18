export function union(list1, list2) {
  const result = list1.duplicate();
  for (let i = 1; i <= list2.count; i++) {
    const item = list2.getAt(i);
    if (result.getOne(item) === 0) {
      result.add(item);
    }
  }
  return result;
}
