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
  insertScrapedData,
} = require('../controllers/document.controller');

// Projects Routes
router.post('/insertData', insertScrapedData);

router.get('/list/:page_number?', apiAuth, index);
router.post('/store', store);
router.get('/:id', apiAuth, show);
router.put('/:id', apiAuth, update);
router.delete('/:id', apiAuth, destroy);

module.exports = router;
