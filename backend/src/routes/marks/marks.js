const express = require("express")
const marks = require('../../controllers/mark/mark')
const router = express.Router();

router.get('/mark',marks.get_marks)
router.get('/marks-report', marks.get_mark_report)
router.post('/mark', marks.post_marks)
router.put('/mark', marks.update_marks)
router.get('/marks-edit', marks.get_mark_edit)

module.exports = router;