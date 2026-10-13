/**
 * Turns a picked photo into a small square JPEG data URL (center-cropped),
 * so it fits in browser storage. Phones' photos are often several MB.
 */
export async function toAvatarDataUrl(file: File, size = 320): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("not-an-image");
  }
  const url = URL.createObjectURL(file);
  try {
    const image = await loadImage(url);
    const side = Math.min(image.naturalWidth, image.naturalHeight);
    const sx = (image.naturalWidth - side) / 2;
    const sy = (image.naturalHeight - side) / 2;

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("no-canvas");
    context.drawImage(image, sx, sy, side, side, 0, 0, size, size);
    return canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("unreadable-image"));
    image.src = src;
  });
}

/**
 * Shrinks an item photo so its longest side is at most `maxSide` px,
 * keeping its proportions. A few of these must fit in browser storage.
 */
export async function toItemPhotoDataUrl(
  file: File,
  maxSide = 720,
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("not-an-image");
  }
  const url = URL.createObjectURL(file);
  try {
    const image = await loadImage(url);
    const scale = Math.min(
      1,
      maxSide / Math.max(image.naturalWidth, image.naturalHeight),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("no-canvas");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.75);
  } finally {
    URL.revokeObjectURL(url);
  }
}
