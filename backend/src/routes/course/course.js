const express = require("express")
const course = require('../../controllers/course/course');
const router = express.Router();

router.get('/course', course.get_course)
router.get('/course-all',course.get_Allcourse)

module.exports = router