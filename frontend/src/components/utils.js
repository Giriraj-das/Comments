const urlRegex = /^(https?|ftps?|ftp):\/\/([A-Z0-9][A-Z0-9-]{0,61}[A-Z0-9]\.)+[A-Z]{2,63}(:\d{1,5})?(\/[^\s]*)?$/i;

export const validateURL = (url) => {
  if (!url) return true;
  return urlRegex.test(url);
};

export const resizeImage = (file, maxWidth, maxHeight, callback) => {
  const img = new Image();
  const reader = new FileReader();

  reader.onload = (event) => {
    img.src = event.target.result;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      let width = img.width;
      let height = img.height;
      const scaleFactor = Math.min(maxWidth / width, maxHeight / height, 1);
      width *= scaleFactor;
      height *= scaleFactor;

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        callback(new File([blob], file.name, { type: file.type }), URL.createObjectURL(blob));
      }, file.type);
    };
  };

  reader.readAsDataURL(file);
};