export async function exportScenePNG(
  glCanvas: HTMLCanvasElement | null,
  streetName: string
): Promise<void> {
  if (!glCanvas) return;

  const width = 2400;
  const height = 1600;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Solid White CAD Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Outer border
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // 2. Header Area
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 44px Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`⬢ BENGALURU DIGITAL TWIN — ${streetName.toUpperCase()}`, 60, 50);

  ctx.fillStyle = '#444444';
  ctx.font = '22px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  const isoTime = new Date().toISOString();
  ctx.fillText(`${isoTime}  |  BBMP GIS SPATIAL SCHEMA`, width - 60, 56);

  // Divider line
  ctx.beginPath();
  ctx.moveTo(60, 110);
  ctx.lineTo(width - 60, 110);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#000000';
  ctx.stroke();

  // 3. 3D Render Centered
  // Draw 3D canvas image
  const renderMarginX = 60;
  const renderMarginY = 130;
  const renderW = width - 120;
  const renderH = height - 320;

  // Background frame for render
  ctx.fillStyle = '#f8f8f8';
  ctx.fillRect(renderMarginX, renderMarginY, renderW, renderH);

  // Calculate aspect-ratio fit
  const srcAspect = glCanvas.width / glCanvas.height;
  const targetAspect = renderW / renderH;

  let drawW = renderW;
  let drawH = renderH;
  let drawX = renderMarginX;
  let drawY = renderMarginY;

  if (srcAspect > targetAspect) {
    drawH = renderW / srcAspect;
    drawY = renderMarginY + (renderH - drawH) / 2;
  } else {
    drawW = renderH * srcAspect;
    drawX = renderMarginX + (renderW - drawW) / 2;
  }

  ctx.drawImage(glCanvas, 0, 0, glCanvas.width, glCanvas.height, drawX, drawY, drawW, drawH);

  // 3D canvas frame
  ctx.strokeRect(renderMarginX, renderMarginY, renderW, renderH);

  // 4. Legend Area at Bottom
  const legendY = height - 165;
  ctx.beginPath();
  ctx.moveTo(60, legendY - 15);
  ctx.lineTo(width - 60, legendY - 15);
  ctx.stroke();

  // Legend Title
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 20px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('SPATIAL LEGEND:', 60, legendY + 5);

  // Utility Swatches
  const utilities = [
    { label: 'BWSSB WATER (Ø0.6m -2.5m)', color: '#00aaff' },
    { label: 'GAIL GAS (Ø0.4m -1.8m)', color: '#ff8800' },
    { label: 'FIBER TRUNK (Ø0.2m -1.0m)', color: '#ff00aa' },
    { label: 'BESCOM POWER (Ø0.35m -1.4m)', color: '#ff3300' },
  ];

  let curX = 260;
  ctx.font = '16px "JetBrains Mono", monospace';
  for (const u of utilities) {
    ctx.fillStyle = u.color;
    ctx.fillRect(curX, legendY + 6, 24, 16);
    ctx.strokeRect(curX, legendY + 6, 24, 16);

    ctx.fillStyle = '#000000';
    ctx.fillText(u.label, curX + 32, legendY + 7);
    curX += 340;
  }

  // House footprint legend
  ctx.fillStyle = '#666666';
  ctx.font = '15px "JetBrains Mono", monospace';
  ctx.fillText(
    'BUILDINGS: [20×30ft G+1: 600sqft]  [30×40ft G+2: 1200sqft]  [40×60ft G+3: 2400sqft]  [BBMP MAX HEIGHT: 30m]',
    60,
    legendY + 45
  );

  // 5. Footer Line
  ctx.fillStyle = '#888888';
  ctx.font = '14px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(
    `Exported ${isoTime} · Bengaluru Digital Twin v1 · Offline Engine`,
    width - 60,
    legendY + 45
  );

  // Trigger download
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    a.href = url;
    a.download = `bengaluru-twin-${timestamp}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 'image/png');
}
