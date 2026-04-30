/**
 * Comprime una imagen y la convierte a WebP.
 * @param {File} file - El archivo de imagen original.
 * @param {Object} options - Opciones de compresión.
 * @returns {Promise<string>} - Promise que resuelve a la URL Base64 de la imagen comprimida.
 */
async function compressImage(file, { maxWidth = 1920, maxHeight = 1080, quality = 0.8 } = {}) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Redimensionar manteniendo relación de aspecto si es necesario
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = width * ratio;
                    height = height * ratio;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                // Mejorar calidad de escalado
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);

                // Convertir a WebP con la calidad especificada
                // Si el navegador no soporta webp, caerá a png por defecto en toDataURL
                const compressedDataUrl = canvas.toDataURL('image/webp', quality);
                resolve(compressedDataUrl);
            };
            img.onerror = (err) => reject(new Error("Error al cargar la imagen: " + err));
        };
        reader.onerror = (err) => reject(new Error("Error al leer el archivo: " + err));
    });
}
