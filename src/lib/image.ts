// Photos are held in the browser alongside the rest of the app's state, so
// they get shrunk hard on the way in: a phone photo is several megabytes and
// the whole store only has a few to play with. Real uploads land with
// accounts; until then this keeps a set comfortably inside budget.
const MAX_EDGE = 900;
const JPEG_QUALITY = 0.62;

export function downscale(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that file"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Could not read that image"));
      image.onload = () => {
        const scale = Math.min(1, MAX_EDGE / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Could not process that image"));
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };
      image.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function photoId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
