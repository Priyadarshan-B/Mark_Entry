const { get_database, post_database } = require("../../config/db_utils");

exports.get_marks = async(req, res) =>{
    const {faculty, course} = req.query
    if(!faculty, course){
        return res.status(400).json({error:"faculty and course is required.."})
    }
    try{
        const query = `
        
        `
    }
    catch(err){

    }
}

exports.post_marks = async (req, res) => {
    const marksArray = req.body;
    if (!Array.isArray(marksArray) || marksArray.length === 0) {
        return res.status(400).json({ error: "Marks data must be an array and cannot be empty" });
    }

    try {
        const insertQuery = `
            INSERT INTO marks(student, course, faculty, test_type, mark) 
            VALUES(?,?,?,?,?);
        `;

        const checkDuplicateQuery = `
            SELECT COUNT(*) AS count 
            FROM marks 
            WHERE student = ? AND course = ? AND faculty = ? AND test_type = ?;
        `;

        for (const markRecord of marksArray) {
            const { faculty, course, student, test_type, mark } = markRecord;

            if (!faculty || !course || !student || !test_type || !mark) {
                return res.status(400).json({ error: "All fields are required for each record" });
            }
            const duplicateCheckResult = await post_database(checkDuplicateQuery, [student, course, faculty, test_type]);

            if (duplicateCheckResult[0].count > 0) {
                console.log(`Duplicate entry found for student ${student}, course ${course}, test_type ${test_type}. Skipping...`);
                continue; 
            }
            await post_database(insertQuery, [student, course, faculty, test_type, mark]);
        }
        res.status(200).json({ message: "Marks posted successfully, duplicates skipped" });
    } catch (err) {
        console.error("Error Posting Marks..", err);
        res.status(500).json({ error: "Error Posting Marks.." });
    }
};
