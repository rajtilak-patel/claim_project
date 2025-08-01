const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../../auth/middleware/auth.middleware');
const { getFinalReports, downloadReport } = require('../controller/report.controller');

router.get('/', verifyToken, authorizeRoles('Admin'), getFinalReports);
router.get('/download', verifyToken, authorizeRoles('Admin'), downloadReport);

module.exports = router;
