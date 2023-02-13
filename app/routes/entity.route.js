const express = require("express");
const router = express.Router();
const passport = require("passport");
const entityController = require("../controllers/entity.controller");

const apiAuth = passport.authenticate("jwt", { session: false });

router.get("/", apiAuth, entityController.entities_get);
router.get(
  "/basedOnProject",
  apiAuth,
  entityController.get_entity_based_on_project_id
);
router.get(
  "/basedOnDocument",
  apiAuth,
  entityController.get_entity_based_on_document_id
);
router.get(
  "/getCategories/:page_number?",
  apiAuth,
  entityController.getAllCategories
);
router.post("/insertData", entityController.insertScrapedData);
router.post("/exportToExcel", entityController.exportEntitiesToExcelFile);

router.post("/getAffectedCaseNumbers", entityController.getAffectedCaseNumbers);
router.post("/updateAll", entityController.entity_update_all);

router.post(
  "/project/:projectId/entity",
  apiAuth,
  entityController.insertSingleEntity
);
router.get("/:id", apiAuth, entityController.getSingleEntity);
router.put("/:id", apiAuth, entityController.updateEntity);
router.post(
  "/:entityId/project/:projectId/unlink",
  apiAuth,
  entityController.unlinkEntity
);

module.exports = router;
