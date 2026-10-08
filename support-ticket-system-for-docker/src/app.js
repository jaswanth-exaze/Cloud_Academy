const exprees = require("express");

const app = exprees();

const Port = process.env.PORT || 3000;

app.use(exprees.json());

app.get("/",(req,res)=>{
    res.json({
        message:"Support Ticket System API is Running Docker "
    });
});

app.listen(Port,()=>{
    console.log(`Server running on http://localhost:${Port}`);
});