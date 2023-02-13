module.exports = (base64Image) => {
  const splitImage = base64Image.split(',');
  let fileExtension = '';
  switch (splitImage[0].toLowerCase()) {
    case 'data:image/jpeg;base64':
      fileExtension = 'jpeg';
      break;
    case 'data:image/png;base64':
      fileExtension = 'png';
      break;
    default:
      fileExtension = 'jpg';
      break;
  }

  return fileExtension;
};
