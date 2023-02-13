const textract = require('textract');

module.exports = (filePath) =>
  new Promise(async (resolve, reject) => {
    try {
      const textractConfig = {
        preserveLineBreaks: true,
      };
      textract.fromFileWithPath(filePath, textractConfig, async (error, content) => {
        if (error) {
          console.log(`textract Error: ${error}`);
          return reject(error);
        }

        return resolve(content);
      });
    } catch (error) {
      console.log('imgToText Error: ', error);
      reject(error);
    }
  });
