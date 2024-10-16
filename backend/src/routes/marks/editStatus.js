const express = require("express")
const marks = require('../../controllers/mark/editStatus')
const router = express.Router();

router.get('/mark-status',marks.updateStatus)
