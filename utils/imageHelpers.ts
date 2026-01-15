// utils/imageHelpers.ts

/**
 * Converts a File object (e.g., from an input type="file") into a Base64 string.
 * This Base64 string can then be used directly as the `src` for an `<img>` tag.
 * @param file The File object to convert.
 * @returns A Promise that resolves with the Base64 string of the file.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
