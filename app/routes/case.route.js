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
  caseSingleGet,
  insertScrapedData,
  searchCase,
} = require('../controllers/case.controller');

// Projects Routes
router.post('/search/project', searchCase);
router.post('/insertData', insertScrapedData);
router.get('/case/:caseNbr', apiAuth, caseSingleGet);

router.get('/:page_number?', apiAuth, index);
router.post('/store', store);
// Todo Correct the router.get("/:page_number?", apiAuth, index);
// route in order this one to work properly
router.get('/getOne/:id', apiAuth, show);
router.put('/:id', apiAuth, update);
router.delete('/:id', apiAuth, destroy);

module.exports = router;
