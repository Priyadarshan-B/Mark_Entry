const express = require("express")
const marks = require('../../controllers/mark/editStatus')
const router = express.Router();

router.put('/marks-status',marks.updateStatus)
router.put('/marks-request',marks.revokeMarkEditStatus)

module.exports = router;
