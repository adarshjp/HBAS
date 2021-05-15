const express=require('express'),
    app=express(),
    bodyparser=require('body-parser');
    require('dotenv').config()

app.set("view engine","ejs")
app.use(express.static("public"))
app.use(bodyparser.urlencoded({extended: true}));

const PORT = process.env.PORT || 3000
app.listen(PORT,()=>{
    console.log("Server Started!!")
})