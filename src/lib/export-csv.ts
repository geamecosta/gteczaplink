function escapeCell(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value)
  // Wrap in quotes and double any embedded quote so commas/newlines survive.
  return `"${text.replace(/"/g, '""')}"`
}

export function downloadCsv(filename: string, headers: string[], rows: unknown[][]) {
  const csv = [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\n')
  // BOM keeps accents readable when the file is opened in Excel.
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
