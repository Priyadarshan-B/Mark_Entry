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

exports.revokeMarkEditStatus = async (req, res) => {
    const { course, faculty } = req.body;
        if (!course || !faculty) {
      return res.status(400).json({ error: "Course ID and Faculty are required..." });
    }
  
    try {
      const query = `
        UPDATE course SET edit_status = '3', count = count + 1 WHERE id = ?
      `;
      const updateStatus = await post_database(query, [course]);
  
      const updateRequest = `
        INSERT INTO request (course, faculty, date) VALUES(?, ?, CURRENT_TIMESTAMP)
      `;
      const insertRequest = await post_database(updateRequest, [course, faculty]);
  
      return res.status(200).json({
        message: "Mark edit status revoked and request added successfully",
        updateStatus,
        insertRequest,
      });
      
    } catch (err) {
      return res.status(500).json({ error: "Error updating mark status or adding request" });
    }
  };
  