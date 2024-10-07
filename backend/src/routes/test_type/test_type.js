const express = require("express")
const test = require('../../controllers/test_type/test')
const router = express.Router();

router.get('/test-type', test.get_test)
router.get('/max-mark', test.get_max)

module.exports = router;