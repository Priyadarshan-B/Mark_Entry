const express = require("express")
const router = express.Router();
const approval = require('../../controllers/approval/approval')
const SemApproval = require('../../controllers/approval/sem_approval')

router.post('/approvals', approval.get_approvalCourse)
router.put('/c-approve',approval.get_CourseApproval)
router.put('/s-approval',approval.SemApproval)

router.get('/sem-approval', SemApproval.getSemApp)
router.put('/sem-approval', SemApproval.updateSemApp)

module.exports = router
