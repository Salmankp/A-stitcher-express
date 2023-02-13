const express = require("express");
const passport = require("passport");
const apiAuth = passport.authenticate("jwt", { session: false });
const router = express.Router();
const {
  store,
  show,
  update,
  destroy,
  getSingleMeeting,
  insertScrapedData,
  getAllMeetings,
  getMeetingItems,
  getMeetingField,
} = require("../controllers/meeting.controller");

//Projects Routes
router.post("/insertData", insertScrapedData);
router.get("/getMeetingItems/:meetingId", apiAuth, getMeetingItems);
router.get("/field/:field", getMeetingField);

router.get("/:page_number?", apiAuth, getAllMeetings);
router.post("/store", store);
router.get("/:id", apiAuth, show);
router.put("/:id", apiAuth, update);
router.delete("/:id", apiAuth, destroy);

module.exports = router;
