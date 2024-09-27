const {get_database, post_database} = require('../../config/db_utils')

exports.get_students = async (req,res) =>{
    const faculty = req.query.faculty
    if(!faculty){
        return res.status(400).json({error:"mentor id is required.."})
    }
    try{
        const query = `
        SELECT 
    s.id AS student_id,
    s.name AS student_name,
    s.reg_no AS registration_number,
    s.gmail AS student_email,
    ye.year AS year_label,
    d.department AS department_name
FROM 
    students s
JOIN 
    student_course_map scm ON s.id = scm.student
JOIN 
    faculty_course_map fcm ON scm.course = fcm.course
JOIN 
    faculty f ON f.id = fcm.faculty
LEFT JOIN 
    years ye ON s.year = ye.id 
LEFT JOIN 
    departments d ON s.department = d.id  
WHERE 
    f.id = ?
    AND f.status = '1' 
    AND scm.status = '1'
    AND fcm.status = '1';

        `
        const students = await get_database(query, [faculty])
        res.json(students)
    }
    catch(err){
        console.error("Error fetching students", err);
        res.status(500).json({ error: "Error fetching students.." });
    }
}