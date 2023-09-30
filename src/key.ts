export const first = "1";
export const next = (
  left: string | null | undefined,
  right: string | null | undefined
) => {
  left ??= "";
  right ??= "";
  return left.length < right.length ? right.replace(/(1)$/, "01") : left + "1";
};
