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
    s.name AS 'STUDENT NAME',
    c.code AS 'COURSE CODE',
    c.name AS 'COURSE NAME',
    s.reg_no AS 'REGISTER NUMBER',
    MAX(CASE WHEN t.id = 1 THEN IFNULL(m.mark, 0) END) AS 'PERIODICAL TEST - I',
    MAX(CASE WHEN t.id = 2 THEN IFNULL(m.mark, 0) END) AS 'PERIODICAL TEST - II',
    MAX(CASE WHEN t.id = 4 THEN IFNULL(m.mark, 0) END) AS 'LAB CYCLE',
    MAX(CASE WHEN t.id = 5 THEN IFNULL(m.mark, 0) END) AS 'TUTORIAL',
    SUM(CASE WHEN t.id IN (6, 7, 8) THEN IFNULL(m.mark, 0) END) AS 'ASSIGNMENT',
    SUM(CASE WHEN t.id IN (9, 10, 11) THEN IFNULL(m.mark, 0) END) AS 'OTHER ASSESSMENT',
    MAX(CASE WHEN t.id = 12 THEN IFNULL(m.mark, 0) END) AS 'OPEN BOOK TEST',
    IFNULL(fa.marks, 0) AS 'FORMATIVE ASSESSMENT' 
FROM 
    students s
LEFT JOIN 
    marks m ON s.id = m.student
LEFT JOIN 
    test_type t ON m.test_type = t.id
LEFT JOIN 
    course c ON m.course = c.id
LEFT JOIN 
    fa_marks fa ON s.reg_no = fa.student 
WHERE 
    m.course = ?
GROUP BY 
    s.id, s.name, s.reg_no, c.code, c.name, fa.marks
ORDER BY 
    s.id;

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
        let insertedCount = 0;
        for (const { student, course, faculty, test_type, mark } of marksArray) {
            const insertQuery = `
                INSERT INTO marks (student, course, faculty, test_type, mark)
                VALUES (?, ?, ?, ?, ?);
            `;
            await post_database(insertQuery, [student, course, faculty, test_type, mark]);
            insertedCount++;
        }

        res.status(200).json({ message: `Marks posted successfully. Inserted ${insertedCount} new records.` });
    } catch (err) {
        console.error("Error Posting Marks..", err);
        res.status(500).json({ error: "Error Posting Marks.." });
    }
};

exports.update_marks = async(req, res)=>{
    const {student, course, test_type, mark} = req.body
    if(!student || !course || !test_type || !mark){
        return res.status(400).json({error:"student, course, test_type, mark are required.."})
    }
   try {const query = `
    UPDATE marks SET 
    mark =?
    WHERE student = ? AND course = ? AND test_type =?
    AND status = '1'
    `
    await post_database(query, [mark, student, course,test_type ])
    res.status(200).json({message:"success"})}
    catch(err){
        console.error("Error Updating Marks..", err);
        res.status(500).json({ error: "error" });
    }
}

exports.get_mark_edit = async(req, res)=>{
    const course = req.query.course
    if(!course){
        return res.status(400).json({error:"Course id is required.."})
    }
    try{
        const query = 
       `SELECT 
    s.id AS student,
    s.name AS 'STUDENT NAME',
    s.reg_no AS 'REGISTER NUMBER',
    ye.year AS 'YEAR',
    c.code AS 'COURSE CODE',
    c.name AS 'COURSE NAME',
    MAX(CASE WHEN t.id = 1 THEN IFNULL(m.mark, 0) END) AS 'PERIODICAL TEST - I',
    1 AS 'PERIODICAL_TEST_1_ID', 
    MAX(CASE WHEN t.id = 2 THEN IFNULL(m.mark, 0) END) AS 'PERIODICAL TEST - II',
    2 AS 'PERIODICAL_TEST_2_ID',
    MAX(CASE WHEN t.id = 4 THEN IFNULL(m.mark, 0) END) AS 'LAB CYCLE',
    4 AS 'LAB_CYCLE_ID',
    MAX(CASE WHEN t.id = 5 THEN IFNULL(m.mark, 0) END) AS 'TUTORIAL',
    5 AS 'TUTORIAL_ID',
    MAX(CASE WHEN t.id = 6 THEN IFNULL(m.mark, 0) END) AS 'ASSIGNMENT 1',
    6 AS 'ASSIGNMENT_1_ID',
    MAX(CASE WHEN t.id = 7 THEN IFNULL(m.mark, 0) END) AS 'ASSIGNMENT 2',
    7 AS 'ASSIGNMENT_2_ID',
    MAX(CASE WHEN t.id = 8 THEN IFNULL(m.mark, 0) END) AS 'ASSIGNMENT 3',
    8 AS 'ASSIGNMENT_3_ID',
    MAX(CASE WHEN t.id = 9 THEN IFNULL(m.mark, 0) END) AS 'OTHER ASSESSMENT 1',
    9 AS 'OTHER_ASSESSMENT_1_ID',
    MAX(CASE WHEN t.id = 10 THEN IFNULL(m.mark, 0) END) AS 'OTHER ASSESSMENT 2',
    10 AS 'OTHER_ASSESSMENT_2_ID',
    MAX(CASE WHEN t.id = 11 THEN IFNULL(m.mark, 0) END) AS 'OTHER ASSESSMENT 3',
    10 AS 'OTHER_ASSESSMENT_3_ID',
    MAX(CASE WHEN t.id = 12 THEN IFNULL(m.mark, 0) END) AS 'OPEN BOOK TEST',
    12 AS 'OPEN_BOOK_TEST_ID',
    IFNULL(fa.marks, 0) AS 'FORMATIVE ASSESSMENT',
    d.edit_status AS 'EDIT STATUS' 
FROM 
    students s
LEFT JOIN 
    marks m ON s.id = m.student
LEFT JOIN 
    years ye ON s.year = ye.id
LEFT JOIN 
    test_type t ON m.test_type = t.id
LEFT JOIN 
    course c ON m.course = c.id
LEFT JOIN 
    fa_marks fa ON s.reg_no = fa.student 
LEFT JOIN
    due_dates d ON s.year = d.year
WHERE 
    m.course = ?
GROUP BY 
    s.id, s.name, s.reg_no, c.code, c.name, fa.marks,d.edit_status
ORDER BY 
    s.id;
`
        const getMarksEdit = await get_database(query, [course])
        res.json(getMarksEdit)
    }
    catch(err){
        return res.status(500).json({error:"Error Fetching Edit Marks"})
    }

}
