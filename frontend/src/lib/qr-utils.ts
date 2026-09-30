/**
 * QR Code utilities for generating clean SVG QR representations
 * and parsing item codes.
 */

// Simple deterministic 2D matrix pseudo-pattern generator for QR visualization
// ensuring clean, realistic-looking QR graphics for any string
export function generateSvgQrCode(value: string, size = 160): string {
  // Deterministic seed from string
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  const matrixSize = 21; // standard version 1 QR is 21x21
  const cellSize = size / matrixSize;
  const rects: string[] = [];

  // Corner markers (Finder patterns: 7x7)
  const isFinder = (r: number, c: number) => {
    // Top-left
    if (r < 7 && c < 7) {
      return r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
    }
    // Top-right
    if (r < 7 && c >= matrixSize - 7) {
      const cNorm = c - (matrixSize - 7);
      return r === 0 || r === 6 || cNorm === 0 || cNorm === 6 || (r >= 2 && r <= 4 && cNorm >= 2 && cNorm <= 4);
    }
    // Bottom-left
    if (r >= matrixSize - 7 && c < 7) {
      const rNorm = r - (matrixSize - 7);
      return rNorm === 0 || rNorm === 6 || c === 0 || c === 6 || (rNorm >= 2 && rNorm <= 4 && c >= 2 && c <= 4);
    }
    return false;
  };

  const isTiming = (r: number, c: number) => {
    return (r === 6 && c % 2 === 0) || (c === 6 && r % 2 === 0);
  };

  // Generate modules
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      let isDark = false;
      if (isFinder(r, c)) {
        isDark = true;
      } else if (
        (r < 8 && c < 8) ||
        (r < 8 && c >= matrixSize - 8) ||
        (r >= matrixSize - 8 && c < 8)
      ) {
        isDark = false;
      } else if (isTiming(r, c)) {
        isDark = true;
      } else {
        // Deterministic pseudo-random bit using character codes and positions
        const valChar = value.charCodeAt((r * matrixSize + c) % value.length);
        const bit = ((hash ^ (r * 31 + c * 17) ^ (valChar << 3)) % 7) > 2;
        isDark = bit;
      }

      if (isDark) {
        const x = c * cellSize;
        const y = r * cellSize;
        rects.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(cellSize + 0.1).toFixed(1)}" height="${(cellSize + 0.1).toFixed(1)}" fill="#0E1A3A" />`);
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="rounded bg-white p-1 shadow-sm">${rects.join('')}</svg>`;
}
