export type List<T> = Cons<T> | null;
export type Cons<T> = {
  value: T;
  next: List<T>;
};
export const toArray = <T>(list: List<T>): T[] => {
  const result: T[] = [];
  while (list) {
    result.push(list.value);
    list = list.next;
  }
  return result;
};
