const {connectToDb} = require('../config/db');
const Document = require('../models/Document');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const getFieldsInFile = async () => {
  try {
    const documents = await Document.find();
    const csvWriter = createCsvWriter({
      path: 'DocumentFields.csv',
      header: [
        {id: 'dbFileId', title: 'dbFileId'},
        {id: 'externalUrl', title: 'externalUrl'},
      ],
    });
    const data = [];
    for (const document of documents) {
      console.log(`documentId: ${document._id}`);
      const object = {
        dbFileId: document.dbFileId,
        externalUrl: document.externalUrl,
      };
      data.push(object);
    }
    await csvWriter
        .writeRecords(data)
        .then(() => console.log('The CSV file was written successfully'));
  } catch (e) {
    console.log(e);
  }
};

const runScript = async () => {
  await connectToDb();
  await getFieldsInFile();
};

runScript();
