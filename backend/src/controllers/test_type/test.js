const { get_database } = require("../../config/db_utils");

exports.get_test = async(req, res)=>{
    try{
        const query = `
        SELECT * FROM test_type;
        `
        const test = await get_database(query)
        res.json(test)

    }catch(err){
        console.error("Error fetching Test types", err);
        res.status(500).json({ error: "Error fetching Test types" });
    }
}

exports.get_max = async(req, res) =>{
    const test = req.query.test
    if(!test){
        return res.status(400).json({error:"test id is required..."})
    }
    try{
        const query = `
        SELECT max_mark FROM test_type WHERE id = ?
        `
        const getMax = await get_database(query, [test])
        res.json(getMax)
    }
    catch(err){
        console.error("Error fetching Test types", err);
        res.status(500).json({ error: "Error fetching Test types" });
    }
}