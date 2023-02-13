const express = require("express");
const router = express.Router();
const auth = require("../config/auth");
const adminController = require("../controllers/admincontrollers/admin.controller");
const documentController = require("../controllers/admincontrollers/document.controller");
const searchesController = require("../controllers/admincontrollers/searches.controller");
const usersController = require("../controllers/admincontrollers/users.controller");
const projectController = require("../controllers/admincontrollers/project.controller");

/* GET users listing. */
router.get("/", auth.ensureAuthenticatedAdmin, adminController.admin_get);

/* GET - Public - Show admin log in page */
router.get("/login", adminController.login_get);

/* POST - Public - admin log */
router.post("/login", adminController.login_post);

/* GET - Public - admin log out */
router.get(
  "/logout",
  auth.ensureAuthenticatedAdmin,
  adminController.logout_get
);

// Projects Routes
router.get(
  "/projects/:page_number?",
  auth.ensureAuthenticatedAdmin,
  projectController.projects_get
);
router.get(
  "/projects/delete/:id",
  auth.ensureAuthenticatedAdmin,
  projectController.delete_project_get
);
router.get(
  "/projects/new",
  auth.ensureAuthenticatedAdmin,
  projectController.new_project_get
);
router.get(
  "/projects/edit/:id",
  auth.ensureAuthenticatedAdmin,
  projectController.edit_project_get
);
router.get(
  "/projects/documents/:id",
  auth.ensureAuthenticatedAdmin,
  projectController.project_documents_get
);

router.post(
  "/projects",
  auth.ensureAuthenticatedAdmin,
  projectController.projects_post
);
router.post(
  "/projects/edit",
  auth.ensureAuthenticatedAdmin,
  projectController.edit_project_post
);

// Documents Routes
router.get(
  "/documents/:page_number?",
  auth.ensureAuthenticatedAdmin,
  documentController.documents_get
);
router.get(
  "/documents/new/:page_number?",
  auth.ensureAuthenticatedAdmin,
  documentController.new_document_get
);
router.get(
  "/documents/multiple",
  auth.ensureAuthenticatedAdmin,
  documentController.documents_multiple_get
);
router.get(
  "/documents/delete/:id",
  auth.ensureAuthenticatedAdmin,
  documentController.delete_document_get
);
router.get(
  "/documents/edit/:id/:page_number?",
  auth.ensureAuthenticatedAdmin,
  documentController.edit_document_get
);

router.post(
  "/documents",
  auth.ensureAuthenticatedAdmin,
  documentController.documents_post
);
router.post(
  "/documents/multiple",
  auth.ensureAuthenticatedAdmin,
  documentController.documents_multiple_post
);
router.post(
  "/documents/edit",
  auth.ensureAuthenticatedAdmin,
  documentController.edit_document_post
);
router.post(
  "/documents/extract-text",
  auth.ensureAuthenticatedAdmin,
  documentController.extract_text_post
);
router.post(
  "/documents/extract-url",
  auth.ensureAuthenticatedAdmin,
  documentController.extract_url_post
);

// Searches Routes
router.get(
  "/searches",
  auth.ensureAuthenticatedAdmin,
  searchesController.searches_get
);

// Users Routes
router.get("/users", auth.ensureAuthenticatedAdmin, usersController.users_get);
router.get(
  "/users/delete/:id",
  auth.ensureAuthenticatedAdmin,
  usersController.delete_user_get
);
router.get(
  "/users/new",
  auth.ensureAuthenticatedAdmin,
  usersController.new_user_get
);
router.post(
  "/users",
  auth.ensureAuthenticatedAdmin,
  usersController.users_post
);
router.get(
  "/users/edit/:id",
  auth.ensureAuthenticatedAdmin,
  usersController.edit_user_get
);
router.post(
  "/users/edit",
  auth.ensureAuthenticatedAdmin,
  usersController.edit_user_post
);

module.exports = router;
