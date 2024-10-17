const { get_database, post_database } = require("../../config/db_utils");

exports.getSemApp = async(req, res)=>{
   try {
    const query = `
    SELECT d.id,ye.id AS year_id,  ye.year,d.date, d.r_count FROM due_dates d
    LEFT JOIN years ye ON ye.id = d.year
    WHERE d.edit_status = '0'
    `
    const SemApp = await get_database(query)
    res.json(SemApp)}
    catch(err){
        return res.status(500).json({error:"Error Fetching Sem Approval..."})
    }
}

exports.updateSemApp = async (req, res) => {
    const { year, date } = req.body;
      if (!year || !date) {
      return res.status(400).json({ error: "Year and Date are required..." });
    }
    try {
      const query = `
        UPDATE due_dates 
        SET date = ?, r_count = r_count + 1, edit_status = '1'
        WHERE year = ?
      `;
      const updateSem = await post_database(query, [date, year]);
      res.json(updateSem)
    //   if (updateSem.affectedRows > 0) {
    //     return res.json({ success: true, message: "Semester approval updated successfully!" });
    //   } else {
    //     return res.status(404).json({ error: "No records found for the provided year." });
    //   }
    } catch (err) {
      console.error("Error updating semester approval:", err);
      return res.status(500).json({ error: "Error updating semester approval." });
    }
  };
  

// exports.rejectSemApp = async(req, res) =>{
//     const {course} = req.course
//     if(!course){
//         return res.status(400).json({error:"Course id is required..."})
//     }
//     try{
//         const query = `
//         UPDATE 
//         `
//     }
//     catch{

//     }
// }