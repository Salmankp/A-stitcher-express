const express = require('express');
const passport = require('passport');
const apiAuth = passport.authenticate('jwt', {session: false});
const router = express.Router();
const {
  index,
  store,
  show,
  update,
  destroy,
  getSingleProject,
  insertScrapedData,
  getInsertedCaseNumbers,
  copyDocumentMetaInProjects,
  getCaseNumbersWithNullCompletionDate,
  getCaseNumbers,
  searchCaseNumber,
  importCloudFactoryExcelFilesInOneFile,
} = require('../controllers/project.controller');

// Projects Routes
router.get('/list/:page_number?', index);
router.post('/store', store);
router.get('/:id', apiAuth, show);
router.put('/:id', apiAuth, update);
router.delete('/:id', apiAuth, destroy);

router.get('/case/:caseNbr', apiAuth, getSingleProject);
router.post('/insertData', insertScrapedData);
router.post('/getCaseNumbers', getInsertedCaseNumbers);
router.post('/copyDocumentMeta', copyDocumentMetaInProjects);
router.post('/getNullCaseNbrs', getCaseNumbersWithNullCompletionDate);

router.post('/getCaseNumbers', getCaseNumbers);
router.post('/searchCaseNumber', searchCaseNumber);
router.post(
    '/importCloudFactoryFilesData',
    importCloudFactoryExcelFilesInOneFile,
);
module.exports = router;
