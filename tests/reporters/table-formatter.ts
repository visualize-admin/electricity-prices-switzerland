interface TableColumn<T> {
  name: string;
  format: (item: T) => string;
}

/**
 * Creates a markdown table from an array of data items and column definitions.
 *
 * @param items - Array of data items to display in the table
 * @param columns - Array of column definitions with name and format function
 * @returns Formatted markdown table as string array (lines)
 *
 * @example
 * ```typescript
 * const data = [
 *   { name: 'John', age: 30, active: true },
 *   { name: 'Jane', age: 25, active: false }
 * ];
 *
 * const table = formatTable(data, [
 *   { name: 'Name', format: x => x.name },
 *   { name: 'Age', format: x => x.age.toString() },
 *   { name: 'Status', format: x => x.active ? 'Active' : 'Inactive' }
 * ]);
 * ```
 */
export function formatTable<T>(
  items: T[],
  columns: TableColumn<T>[]
): string[] {
  if (items.length === 0) {
    return [];
  }

  const lines: string[] = [];

  // Header row
  const headers = columns.map((col) => col.name);
  lines.push(`| ${headers.join(" | ")} |`);

  // Separator row
  const separators = columns.map(() => "-".repeat(8)); // Minimum 8 dashes per column
  lines.push(`| ${separators.join(" | ")} |`);

  // Data rows
  for (const item of items) {
    const cells = columns.map((col) => col.format(item));
    lines.push(`| ${cells.join(" | ")} |`);
  }

  return lines;
}
