const District = require('./models/District');
const Hospital=require('./models/Hospital')
const express=require('express'),
    passport=require('passport')
    LocalStrategy=require("passport-local"),
    app=express(),
    mongoose=require('mongoose')
    bodyparser=require('body-parser');
    require('dotenv').config()

app.set("view engine","ejs")
app.use(express.static("public"))
app.use(bodyparser.urlencoded({extended: true}));

//MONGODB ATLAS CONNECTION

const connectionParams={
    useNewUrlParser:true,
    useCreateIndex: true,
    useUnifiedTopology:true
}
mongoose.connect(process.env.DBURL,connectionParams)
.then( ()=>{
    console.log("Connected")
})
.catch((err)=>{
    console.log("NOT CONNECTED!!")
    console.log(err)
})
//MONGODB CONNECTION COMPLETED
// Auth setup starts
app.use(require("express-session")({
	secret:process.env.secret,
	resave:false,
	saveUninitialized:false
}));
app.use(passport.initialize());

app.use(passport.session());
passport.use(new LocalStrategy(Hospital.authenticate()));
passport.serializeUser(Hospital.serializeUser());
passport.deserializeUser(Hospital.deserializeUser());

app.use(function(req,res,next){
	res.locals.currentUser=req.user;
	next();
});

//Auth setup ends

app.get("/",(req,res)=>{
    res.render("home")
})

app.get("/view",(req,res)=>{
    res.render("view")
})
// Patient Request form starts
app.get("/request",(req,res)=>{
    res.render("request")
})
app.post("/request",(req,res)=>{
    console.log(req.body.patient)
})
//Patient request form ends

// Hospital Auth routes starts
app.get("/register",function(req,res){
	res.render("register");
});
app.post("/register",function(req,res){
    District.find({name:req.body.hosp.district},(err,result)=>{
        if(err)
            console.log("District id not found "+err)
        else
        {
            var newHosp=new Hospital({
                username:req.body.hosp.username,
                name:req.body.hosp.name,
                address:req.body.hosp.add,
                phoneno:req.body.hosp.phno,
                emailid:req.body.hosp.email,
                type:req.body.hosp.type,
                districtid:result[0]._id,
                totalbeds:{
                    general:req.body.hosp.tgen,
                    oxygen:req.body.hosp.toxy,
                    icu:req.body.hosp.ticu,
                    icu_v:req.body.hosp.ticv
                },
                occupiedbeds:{
                    general:req.body.hosp.ogen,
                    oxygen:req.body.hosp.ooxy,
                    icu:req.body.hosp.oicu,
                    icu_v:req.body.hosp.oicv
                }
            })
            Hospital.register(newHosp,req.body.hosp.pass,(err,hospital)=>{
                if(err)
                {
                    console.log(err);
			        return res.render("register");
                }
                passport.authenticate("local")(req,res,function(){
                    res.redirect("/");
                });
            })
        }
    })
})
app.get("/login",function(req,res){
	res.render("login");
});

app.post("/login",passport.authenticate("local",{
	successRedirect:"/",
	failureRedirect:"/register"
	}),function(req,res){
			 
});

app.get("/logout",function(req,res){
	req.logout();
	res.redirect("/");
});
// Hospital Auth ends
const PORT = process.env.PORT || 3000
app.listen(PORT,()=>{
    console.log("Server Started!!")
})

function addnewDistrict(name,phone) {
    var district_=new District({
        name:name,
        phoneno:phone
    })
    district_.save((err,res)=>{
        console.log(res)
    })
}