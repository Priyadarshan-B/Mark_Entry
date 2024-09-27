const express = require("express")
const marks = require('../../controllers/mark/mark')
const router = express.Router();

router.post('/mark', marks.post_marks)

module.exports = router;