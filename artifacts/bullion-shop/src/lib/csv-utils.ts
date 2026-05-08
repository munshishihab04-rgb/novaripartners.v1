export const CSV_HEADERS = [
  "id",
  "name",
  "slug",
  "publisher",
  "version",
  "platform",
  "category",
  "price",
  "originalPrice",
  "currency",
  "shortDescription",
  "description",
  "features",
  "deliveryMethod",
  "imageUrl",
  "inStock",
  "isFeatured",
  "rating",
  "reviewCount",
] as const;

export type CsvRow = Record<string, string>;

function escapeCell(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n") || value.includes("\r")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function parseRow(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

export function parseCSV(text: string): CsvRow[] {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");
  if (lines.length < 2) return [];

  // Strip BOM if present
  const firstLine = lines[0].startsWith("\uFEFF") ? lines[0].slice(1) : lines[0];
  const headers = parseRow(firstLine).map((h) => h.trim());

  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseRow(line);
    const row: CsvRow = {};
    headers.forEach((h, idx) => { row[h] = (values[idx] ?? "").trim(); });
    rows.push(row);
  }
  return rows;
}

export interface ExportProduct {
  id: number;
  name: string;
  slug: string;
  publisher: string;
  version: string;
  platform: string;
  categoryName?: string | null;
  price: string;
  originalPrice?: string | null;
  currency: string;
  shortDescription: string;
  description: string;
  features: string[];
  deliveryMethod: string;
  imageUrl?: string | null;
  inStock: boolean;
  isFeatured: boolean;
  rating: string;
  reviewCount: number;
}

export function productsToCsv(products: ExportProduct[]): string {
  const headerLine = CSV_HEADERS.map(escapeCell).join(",");
  const rows = products.map((p) => {
    const cells: string[] = [
      String(p.id),
      p.name,
      p.slug,
      p.publisher,
      p.version,
      p.platform,
      p.categoryName || "",
      p.price,
      p.originalPrice || "",
      p.currency || "EUR",
      p.shortDescription,
      p.description,
      (p.features || []).join("|"),
      p.deliveryMethod,
      p.imageUrl || "",
      p.inStock ? "true" : "false",
      p.isFeatured ? "true" : "false",
      p.rating || "5.0",
      String(p.reviewCount || 0),
    ];
    return cells.map(escapeCell).join(",");
  });
  return "\uFEFF" + [headerLine, ...rows].join("\n");
}

export function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function csvRowsToProducts(rows: CsvRow[]): Record<string, unknown>[] {
  return rows.map((row) => ({
    name: row.name || "",
    slug: row.slug || "",
    publisher: row.publisher || "",
    version: row.version || "",
    platform: row.platform || "windows",
    category: row.category || row.categoryName || "",
    price: row.price || "0",
    originalPrice: row.originalPrice || null,
    currency: row.currency || "EUR",
    shortDescription: row.shortDescription || "",
    description: row.description || "",
    features: row.features
      ? row.features.split("|").map((f) => f.trim()).filter(Boolean)
      : [],
    deliveryMethod: row.deliveryMethod || "Email delivery within 24 hours",
    imageUrl: row.imageUrl || null,
    inStock: row.inStock?.toLowerCase() === "true",
    isFeatured: row.isFeatured?.toLowerCase() === "true",
    rating: row.rating || "5.0",
    reviewCount: Number(row.reviewCount || 0),
  }));
}
