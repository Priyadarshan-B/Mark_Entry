const express = require("express")
const marks = require('../../controllers/mark/mark')
const router = express.Router();

router.get('/mark',marks.get_marks)
router.get('/marks-report', marks.get_mark_report)
router.post('/mark', marks.post_marks)

module.exports = router;