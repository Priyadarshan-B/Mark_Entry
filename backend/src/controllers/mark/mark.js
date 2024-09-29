const { get_database, post_database } = require("../../config/db_utils");

exports.get_marks = async(req, res) =>{
    const {student, code} = req.query
    if(!student, code){
        return res.status(400).json({error:"faculty and course is required.."})
    }
    try{
        const query = `
            SELECT DISTINCT(test_type) , s.name, s.reg_no, s.gmail,d.department,ye.year,c.code, c.name,t.test, m.mark FROM marks m
        JOIN students s ON m.student = s.id
        JOIN course c ON m.course = c.id
        JOIN test_type t ON m.test_type =  t.id
        JOIN departments d ON s.department = d.id
        JOIN years ye ON s.year = ye.id
        WHERE m.student= ?
        AND c.code = ?
        `
        const markDetails = await get_database(query,[student,code])
        res.status(200).json(markDetails)
    }
    catch(err){
        console.error("Error Fetching Marks..", err);
        res.status(500).json({ error: "Error Fetching Marks.." });
    }
}

exports.get_mark_report = async(req, res)=>{
    const course = req.query.course
    if(!course){
        return res.status(400).json({error:"Course id is required.."})
    }
    try{
        const query = `
    SELECT 
    s.id ,
    s.name AS student_name,
    c.code AS course_code,
    c.name AS course_name,
    s.reg_no,
    MAX(CASE WHEN t.id = 1 THEN IFNULL(m.mark, 0) END) AS 'PERIODICAL TEST - I',
    MAX(CASE WHEN t.id = 2 THEN IFNULL(m.mark, 0) END) AS 'PERIODICAL TEST - II',
    MAX(CASE WHEN t.id = 3 THEN IFNULL(m.mark, 0) END) AS 'FORMATIVE ASSESSMENT',
    MAX(CASE WHEN t.id = 4 THEN IFNULL(m.mark, 0) END) AS 'LAB CYCLE',
    MAX(CASE WHEN t.id = 5 THEN IFNULL(m.mark, 0) END) AS 'TUTORIAL',
    MAX(CASE WHEN t.id = 6 THEN IFNULL(m.mark, 0) END) AS 'ASSIGNMENT',
    MAX(CASE WHEN t.id = 7 THEN IFNULL(m.mark, 0) END) AS 'OTHERS'
FROM 
    students s
LEFT JOIN 
    marks m ON s.id = m.student
LEFT JOIN 
    test_type t ON m.test_type = t.id
LEFT JOIN 
    course c ON m.course = c.id
WHERE 
    m.course = ? 
GROUP BY 
    s.id, s.name, s.reg_no
ORDER BY 
    s.name;

        `
        const getMarksReport = await get_database(query, [course])
        res.json(getMarksReport)
    }
    catch(err){
        return res.status(500).json({error:"Error Fetching Marks"})
    }

}

exports.post_marks = async (req, res) => {
    const marksArray = req.body;
    if (!Array.isArray(marksArray) || marksArray.length === 0) {
        return res.status(400).json({ error: "Marks data must be an array and cannot be empty" });
    }

    try {
        const values = marksArray.map(({ student, course, faculty, test_type, mark }) => [student, course, faculty, test_type, mark]);
        const duplicateCheckQuery = `
            SELECT student, course, faculty, test_type 
            FROM marks 
            WHERE (student, course, faculty, test_type) 
            IN (${values.map(() => '(?,?,?,?)').join(',')});
        `;
        
        const { result: duplicates } = await post_database(duplicateCheckQuery, values.flat());
        console.log("Duplicate check result:", duplicates);

        if (!Array.isArray(duplicates)) {
            return res.status(500).json({ error: "Unexpected response format from the database" });
        }
        const duplicateKeys = duplicates.map(({ student, course, faculty, test_type }) => 
            `${student}-${course}-${faculty}-${test_type}`);
        const newRecords = marksArray.filter(({ student, course, faculty, test_type }) => 
            !duplicateKeys.includes(`${student}-${course}-${faculty}-${test_type}`)
        );

        if (newRecords.length === 0) {
            return res.status(200).json({ message: "No new marks to insert, all records are duplicates" });
        }
        const insertQuery = `
            INSERT INTO marks (student, course, faculty, test_type, mark) 
            VALUES ${newRecords.map(() => '(?,?,?,?,?)').join(',')};
        `;
        await post_database(insertQuery, newRecords.flatMap(({ student, course, faculty, test_type, mark }) => 
            [student, course, faculty, test_type, mark]
        ));

        res.status(200).json({ message: `Marks posted successfully. Inserted ${newRecords.length} new records, duplicates skipped.` });
    } catch (err) {
        console.error("Error Posting Marks..", err);
        res.status(500).json({ error: "Error Posting Marks.." });
    }
};
