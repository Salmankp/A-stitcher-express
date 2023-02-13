const express = require("express");
const router = express.Router();
const propertyController = require("../controllers/property.controller");

//Property Routes
router.post("/insertData", propertyController.insertScrapedData);
router.get("/:id", propertyController.getSingleProperty);
router.put("/:id", propertyController.updateSingleProperty);
router.post("/project/:id", propertyController.insertSingleProperty);
router.post(
  "/project/:projectId/unlink",
  propertyController.unlinkSingleProperty
);

module.exports = router;
