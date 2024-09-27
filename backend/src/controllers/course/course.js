const { get_database } = require("../../config/db_utils");

exports.get_course = async (req, res) => {
    const faculty = req.query.faculty;
    if(!faculty){
        return res.status(400).status({error:"Faculty id required.."})
    }
    try{
        const query = `
        SELECT c.code,c.name FROM faculty_course_map fcm
JOIN course c ON fcm.course =c.id
WHERE fcm.faculty = ?
AND fcm.status = '1'
        `
        const course = await get_database(query, [faculty])
        res.status(200).json(course);
    }catch(err){
        console.error("Error fetching resources", err);
        res.status(500).json({ error: "Error fetching resources" });
    }
}