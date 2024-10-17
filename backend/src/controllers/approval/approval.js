const { get_database, post_database } = require("../../config/db_utils");


exports.get_approvalCourse = async (req, res)=>{
   try{
    const query = `
    SELECT r.id, c.id AS course ,c.code, c.name ,c.count,  d.department , f.name AS faculty, f.staff_id FROM request r
    left join course c on c.id = r.course
    LEFT JOIN departments d ON d.id = c.department
    left join faculty f on f.id = r.faculty
    WHERE c.edit_status = '3' AND r.status = '1'
    `
    const approval = await get_database(query)
    res.json(approval)
   }
   catch(err){
    console.error("Error fetching Request", err);
    res.status(500).json({ error: "Error fetching Request" });
   }
}

exports.SemApproval = async (req, res)=>{
    const {year,  date} = req.body
    if(!year || !date){
        return res.status(400).json({error: "year id and date are required"})
    }
    try{
        const query = `
UPDATE due_dates
SET edit_status = '1',
    r_count = r_count + 1,
    date = ?
WHERE 
    year = ? `
        const gApproval = await post_database(query, [ date , year])
        res.json(gApproval)
    }
    catch(err){
        console.error("Error Updating sem Request", err);
        res.status(500).json({ error: "Error Updating sem Request" });
       }
    
}

exports.get_CourseApproval = async(req, res)=>{
    const {course, date}= req.body
    if(!course || !date){
        return res.status(400).json({error:"course and date are required.."})
    }
    try{
        const query = `
        UPDATE course SET edit_status = '1', due_date = ?
        WHERE id =? AND status = '1'
        `
        const cApproval = await post_database(query, [date , course])

        const updateRequest = `
        UPDATE request SET status = '2'
        WHERE course = ? AND status = '1'
        `
        const updateReq = await post_database(updateRequest, [course])
        return res.json({cApproval, updateReq})
    }
    catch(err){
        console.error("Error Updating course Request", err);
        res.status(500).json({ error: "Error Updating course Request" });
       }
}
