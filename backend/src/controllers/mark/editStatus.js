const { get_database, post_database } = require("../../config/db_utils");

exports.updateStatus = async(req, res)=>{
    const {course} = req.body
    if( !course){
        return res.status(400).json({error:"course Id is required..."})
    }
    try{
        const query = `
        UPDATE course SET edit_status = '2' WHERE  id = ?
        `
        const UpdateStatus =  await post_database(query, [course]);
        res.status(200).json(UpdateStatus)
    }
    catch(err){
        return res.status(500).json({error:"Error Updating Marks/Course status"})
    }
}

exports.revokeMarkEditStatus = async(req, res)=>{
    const {course} = req.body
    if( !course){
        return res.status(400).json({error:" course Id is required..."})
    }
    try{
        const query = `
        UPDATE course SET edit_status = '3' WHERE id = ?
        `
        const UpdateStatus =  await post_database(query, [course]);
        res.status(200).json(UpdateStatus)
    }
    catch(err){
        return res.status(500).json({error:"Error Updating Marks status"})
    }
}