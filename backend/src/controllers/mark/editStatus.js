const { get_database, post_database } = require("../../config/db_utils");

exports.updateStatus = async(req, res)=>{
    const {student, course} = req.body
    if(!student || !course){
        return res.status(400).json({error:"Student and course Id is required..."})
    }
    try{
        const query = `
        UPDATE marks SET edit_status = '0' WHERE student = ? AND course = ?
        `
        const UpdateStatus =  await post_database(query, [student, course]);
        res.status(200).json(UpdateStatus)
    }
    catch(err){
        return res.status(500).json({error:"Error Updating Marks status"})
    }
}

exports.revokeMarkStatus = async(req, res)=>{
    const {student, course} = req.body
    if(!student || !course){
        return res.status(400).json({error:"Student and course Id is required..."})
    }
    try{
        const query = `
        UPDATE marks SET edit_status = '1' WHERE student = ? AND course = ?
        `
        const UpdateStatus =  await post_database(query, [student, course]);
        res.status(200).json(UpdateStatus)
    }
    catch(err){
        return res.status(500).json({error:"Error Updating Marks status"})
    }
}