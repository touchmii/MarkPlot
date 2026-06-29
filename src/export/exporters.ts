import { SHEET_SVG_ID } from '../layout/SheetPreview';

function getSheet(): SVGSVGElement {
  const el = document.getElementById(SHEET_SVG_ID);
  if (!(el instanceof SVGSVGElement)) {
    throw new Error('找不到出图 SVG');
  }
  return el;
}

function serializeSheet(): string {
  const svg = getSheet();
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  const xml = new XMLSerializer().serializeToString(clone);
  return `<?xml version="1.0" encoding="UTF-8"?>\n${xml}`;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // 延迟释放，确保下载已开始
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** 导出当前页面为矢量 SVG 文件（与打印尺寸一致，最适合做标定图样）。 */
export function exportSvg(filename = 'markplot.svg') {
  const blob = new Blob([serializeSheet()], { type: 'image/svg+xml;charset=utf-8' });
  triggerDownload(blob, filename);
}

/** 导出当前页面为指定 DPI 的 PNG 位图。 */
export async function exportPng(dpi = 300, filename = 'markplot.png') {
  const svg = getSheet();
  const viewBox = svg.viewBox.baseVal; // 单位为 mm
  const widthMm = viewBox.width;
  const heightMm = viewBox.height;
  const scale = dpi / 25.4; // mm → px

  const xml = serializeSheet();
  const svg64 = btoa(unescape(encodeURIComponent(xml)));
  const img = new Image();
  img.src = `data:image/svg+xml;base64,${svg64}`;
  await img.decode();

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(widthMm * scale);
  canvas.height = Math.round(heightMm * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法创建画布');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  await new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('PNG 生成失败'));
      triggerDownload(blob, filename);
      resolve();
    }, 'image/png');
  });
}

/** 触发浏览器打印（打印样式见 styles.css 的 @media print）。 */
export function printSheet() {
  window.print();
}
