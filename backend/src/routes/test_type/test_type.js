const express = require("express")
const test = require('../../controllers/test_type/test')
const router = express.Router();

router.get('/test-type', test.get_test)

module.exports = router;