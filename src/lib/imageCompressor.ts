const MAX_IMAGE_DIMENSION = 300;
const JPEG_QUALITY = 0.75;

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The selected file could not be read as an image."));
    image.src = source;
  });
}

/**
 * Resizes an image to fit within 300x300px and returns a compressed JPEG data URL.
 */
export function compressImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    return Promise.reject(new Error("Please select an image file."));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("The selected image could not be read."));
    reader.onload = async () => {
      if (typeof reader.result !== "string") {
        reject(new Error("The selected image could not be read."));
        return;
      }

      try {
        const image = await loadImage(reader.result);
        const scale = Math.min(
          1,
          MAX_IMAGE_DIMENSION / image.naturalWidth,
          MAX_IMAGE_DIMENSION / image.naturalHeight,
        );
        const width = Math.max(1, Math.round(image.naturalWidth * scale));
        const height = Math.max(1, Math.round(image.naturalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Your browser could not prepare the image."));
          return;
        }

        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      } catch (error) {
        reject(
          error instanceof Error
            ? error
            : new Error("The selected image could not be compressed."),
        );
      }
    };

    reader.readAsDataURL(file);
  });
}
