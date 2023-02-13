const pdfUtil = require('pdf-to-text');

module.exports = (pdfPath) =>
  new Promise(async (resolve, reject) => {
    try {
      const option = { from: 0, to: 100 };
      pdfUtil.pdfToText(pdfPath, option, function (err, data) {
        if (err) throw err;
        resolve(data);
      });
    } catch (error) {
      console.log(`convertPdfToText Error: ${error}`);
      reject(error);
    }
  });
