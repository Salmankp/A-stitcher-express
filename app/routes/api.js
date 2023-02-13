const express = require('express');
const router = express.Router();
const propertyRoute = require('./property.route');
const projectRoute = require('./project.route');
const entityRoute = require('./entity.route');
const caseRoute = require('./case.route');
const meetingRoute = require('./meeting.route');
const documentRoute = require('./document.route');
const healthRoute = require('./health.route');
const passport = require('passport');
const userController = require('../controllers/users.controller');
const authController = require('../controllers/auth.controller');
const projectController = require('../controllers/project.controller');
const documentController = require('../controllers/document.controller');
const caseController = require('../controllers/case.controller');
const logController = require('../controllers/log.controller');
const allowedFieldsController =
require('../controllers/allowedFields.controller');

const userMiddleware = require('../middlewares/userMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

router.use('/property', propertyRoute);
router.use('/projects', projectRoute);
router.use('/entities', entityRoute);
router.use('/cases', caseRoute);
router.use('/meeting', meetingRoute);
router.use('/documents', documentRoute);
router.use('/health', healthRoute);

const apiAuth = passport.authenticate('jwt', {session: false});

router.get('/', (req, res) =>
  res.status(200).json({status: 200, data: 'API Running'}),
);
router.post(
    '/users/signup',
    userMiddleware.validate_signup_request,
    userController.register_post,
);
router.post(
    '/users/login',
    authMiddleware.validate_user_login,
    authController.login_post,
);
router.get('/users/me', apiAuth, authController.me_get);
router.post('/users/refreshToken', authController.resfreshToken);
router.put('/users', apiAuth, userController.users_put);
router.post(
    '/users/change-password',
    apiAuth,
    userMiddleware.validate_change_password,
    userController.change_password_put,
);

router.post('/getCaseNumbers', projectController.getCaseNumbers);
router.post('/searchCaseNumber', projectController.searchCaseNumber);
router.post(
    '/importCloudFactoryFilesData',
    projectController.importCloudFactoryExcelFilesInOneFile,
);

router.get('/case/startsWith', apiAuth, caseController.getCasesStartsWith);
router.get(
    '/case/completedFlg/:option',
    caseController.getCaseNumberBycompletedFlg,
);

router.get(
    '/documents-subtypes/:page_number?',
    documentController.getDocumentSubtypes,
);

router.post('/logs/create', logController.createLog);
router.get('/logs', logController.getAllLogs);
router.get('/logs/getRecentLogs/:hours', logController.getRecentLogs);

router.post(
    '/importPrefixSuffixData',
    projectController.importActivePrefixSuffixCodes,
);

router.post('/typeahead', allowedFieldsController.addAllowedFieldValues);
router.get('/typeahead/:fieldName',
    allowedFieldsController.getAllowedFieldValues,
);

module.exports = router;
