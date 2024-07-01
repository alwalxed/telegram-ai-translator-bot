type NestedObject = {
  [key: string]: any;
};

export function flattenObject(
  obj: NestedObject,
  prefix = ""
): Record<string, any> {
  return Object.keys(obj).reduce((acc, key) => {
    const prefixedKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === "object" && obj[key] !== null) {
      Object.assign(acc, flattenObject(obj[key], prefixedKey));
    } else {
      acc[prefixedKey] = obj[key];
    }
    return acc;
  }, {} as Record<string, any>);
}
