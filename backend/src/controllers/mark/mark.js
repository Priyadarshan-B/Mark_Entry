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
