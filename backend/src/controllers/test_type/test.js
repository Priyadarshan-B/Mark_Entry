const { get_database } = require("../../config/db_utils");

exports.get_test = async(req, res)=>{
    try{
        const query = `
        SELECT * FROM test_type
        `
        const test = await get_database(query)
        res.json(test)

    }catch(err){
        console.error("Error fetching Test types", err);
        res.status(500).json({ error: "Error fetching Test types" });
    }
}
