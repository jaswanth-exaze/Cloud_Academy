require("dotenv").config();
const exprees = require("express");
const pool = require("./config/db")
const app = exprees();

const Port = process.env.PORT || 3000;

const usersRoutes = require("./routes/users");
const ticketsRoutes = require("./routes/tickets");

app.use(exprees.json());

app.get("/",(req,res)=>{
    res.json({
        message:"Support Ticket System API is Running Docker "
    });
});
app.use("/api/users", usersRoutes);
app.use("/api/tickets", ticketsRoutes);

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