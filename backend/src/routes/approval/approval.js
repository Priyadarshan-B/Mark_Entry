const express = require("express")
const router = express.Router();
const approval = require('../../controllers/approval/approval')

router.post('/approvals', approval.get_approvalCourse)
router.put('/c-approve',approval.get_CourseApproval)
router.put('/s-approval',approval.SemApproval)

module.exports = router
