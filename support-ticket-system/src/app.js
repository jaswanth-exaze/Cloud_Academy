require("dotenv").config();
const exprees = require("express");
const pool = require("./config/db");

const app = exprees();

const Port = process.env.PORT || 3000;

app.use(exprees.json());

app.get("/",(req,res)=>{
    res.json({
        message:"Support Ticket System API is Running on local"
    });
});

// Test PostgreSQL connection
pool.query("SELECT NOW()")
    .then(result => {
        console.log("Database connected:", result.rows[0]);
    })
    .catch(error => {
        console.error("Database connection failed:", error);
    });


app.listen(Port,()=>{
    console.log(`Server running on http://localhost:${Port}`);
});