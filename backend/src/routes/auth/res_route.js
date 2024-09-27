const express = require("express")

const resources = require('../../controllers/auth/resources')
const router = express.Router();

router.get("/resources", resources.get_resource)

module.exports = router;