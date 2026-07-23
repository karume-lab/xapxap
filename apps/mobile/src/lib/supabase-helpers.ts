function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

export function transformRow<T>(row: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    const camelKey = snakeToCamel(key);
    if (Array.isArray(value)) {
      result[camelKey] = value.map((item) =>
        item && typeof item === "object" && !(item instanceof Date)
          ? transformRow(item as Record<string, unknown>)
          : item
      );
    } else if (value && typeof value === "object" && !(value instanceof Date)) {
      result[camelKey] = transformRow(value as Record<string, unknown>);
    } else if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
      result[camelKey] = new Date(value);
    } else {
      result[camelKey] = value;
    }
  }
  return result as T;
}

export function transformRows<T>(rows: Record<string, unknown>[]): T[] {
  return rows.map((row) => transformRow<T>(row));
}
