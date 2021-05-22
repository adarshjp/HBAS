const District = require('./models/District');
const Hospital=require('./models/Hospital')
const Patient=require('./models/Patient')
const PatientsAdmitted=require('./models/patientadmitted')

const express=require('express'),
    passport=require('passport');
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
    console.log(PatientsAdmitted)	 
    res.render("home")
})

app.get("/view",(req,res)=>{
    res.render("view")
})
// Patient Request form starts
app.get("/request",(req,res)=>{
    District.find({},{name:1,_id:0},(err,district)=>{
        if(err)
            console.log(err)
        else
            res.render("request",{district:district})
    })
  
})

app.post("/request",(req,res)=>{
    District.find({name:req.body.patient.district},(err,result)=>{
        if(err)
            console.log("District id not found "+err)
        else{
            var newPatient = new Patient({
                name:req.body.patient.name,
                age:req.body.patient.age,
                address:req.body.patient.address,
                phoneno:req.body.patient.pno,
                status:'Requested',
                typeofbedreq:req.body.patient.typeofbed,
                caretakername:req.body.patient.cname,
                caretakerphno:req.body.patient.cpno,
                districtid:result[0]._id
            })
            Patient.create(newPatient,(err,newpatient)=>{
                if(err)
                    console.log(err)
                else{
                    Hospital.find({districtid:newpatient.districtid},{avaliablebeds:1,districtid:1,_id:1},(err,hosp)=>{
                        for(i=0;i<hosp.length;i++)
                        {
                            var hospital=hosp[i]
                            if(hosp[i].avaliablebeds[newpatient.typeofbedreq]>0){
                                Patient.findOneAndUpdate({_id:newpatient._id},{status:'Alloted',allotmenttime:Date.now()},(err,upPatient)=>{
                                    if(err)
                                        console.log(err)
                                    else
                                        console.log(upPatient)
                                })
                                //console.log(hospital._id)
                                var patadm=new PatientsAdmitted({
                                    patientid:newpatient._id,
                                    hospitalid:hospital._id,
                                    districtid:hospital.districtid,
                                    typeofbed:newpatient.typeofbedreq
                                })
                                PatientsAdmitted.create(patadm,(err,newpatadm)=>{
                                    if(err)
                                        console.log(err)
                                    else{
                                        console.log(newpatadm)
                                        var type=newpatadm.typeofbed
                                        var key1='avaliablebeds.'+type
                                        var key2='occupiedbeds.'+type
                                        Hospital.findOneAndUpdate({_id:newpatadm.hospitalid},{$inc:{[key1]:-1,[key2]:1}},(err,updatedhosp)=>{
                                            if(err) console.log(err)
                                            else console.log(updatedhosp)
                                        })
                                    }
                                      
                                })
                               
                                break;
                            }
                        }
                    })
                    res.redirect("/request")
                }
                    
            })
            
        }
    })
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
                },
                avaliablebeds:{
                    general:req.body.hosp.agen,
                    oxygen:req.body.hosp.aoxy,
                    icu:req.body.hosp.aicu,
                    icu_v:req.body.hosp.aicv
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
	successRedirect:"/home",
	failureRedirect:"/login"
	}),function(req,res){
		console.log(req.user)	 
});

app.get("/logout",function(req,res){
	req.logout();
	res.redirect("/");
});
// Hospital Auth ends

app.get("/home",isLoggedIn,(req,res)=>{
    res.render("hosphome",{user:req.user})
})
app.get("/admit",(req,res)=>{
    PatientsAdmitted.find().distinct('patientid',(err,id)=>{
        if(err) console.log(err)
        else{
            console.log(id)
            Patient.find({status:'Alloted',_id:{$in:id}},(err,allotedpatients)=>{
                if(err) console.log(err)
                else res.render("admit",{patients:allotedpatients,user:req.user})
            })
        }
    })
})
//
app.post("/admit/:id",isLoggedIn,(req,res)=>{
    console.log(req.params.id)
    Patient.findOneAndUpdate({_id:req.params.id},{status:'Admitted'},(err,admittedPatient)=>{
        if(err) console.log(err)
        else{
            console.log(admittedPatient)
        } 
    })
    PatientsAdmitted.findOneAndUpdate({patientid:req.params.id},{joining:Date.now()},(err,uppattime)=>{
        if(err) console.log(err)
        else{
            console.log(uppattime)
            /*var type=uppattime.typeofbed
            var key1='avaliablebeds.'+type
            var key2='occupiedbeds.'+type
            Hospital.findOneAndUpdate({_id:uppattime.hospitalid},{$inc:{[key1]:-1,[key2]:1}},(err,updatedhosp)=>{
                if(err) console.log(err)
                else console.log(updatedhosp)
            })*/
        } 
    })
    res.redirect("/admit")
})

app.get("/viewpatients",isLoggedIn,(req,res)=>{
    PatientsAdmitted.find({hospitalid:req.user._id}).distinct('patientid',(err,id)=>{
        if(err) console.log(err)
        else{
            console.log(id)
            Patient.find({_id:{$in:id},status:'Admitted'},(err,admittedpatients)=>{
                if(err) console.log(err)
                else {
                    console.log(admittedpatients)
                    res.render('viewpatients',{patients:admittedpatients,user:req.user})
                }
            })
        }
    })
})

app.post("/discharge/:id/:status",isLoggedIn,(req,res)=>{
    console.log(req.params)
    /*if(req.params.status==='discharge')
        res.send("Discharged")
    else
        res.send("Died")*/
    Patient.findOneAndUpdate({_id:req.params.id},{status:req.params.status},(err,statusUpPatient)=>{
        if(err) console.log(err)
        else{
            console.log(statusUpPatient)
            var type=statusUpPatient.typeofbedreq
            /*var key1='avaliablebeds.'+type
            var key2='occupiedbeds.'+type
            Hospital.findOneAndUpdate({_id:req.user._id},{$inc:{[key1]:1,[key2]:-1}},(err,updatedhosp)=>{
                if(err) console.log(err)
                else{
                    console.log(updatedhosp)
                    Patient.findOneAndUpdate({districtid:req.user.districtid,status:'Requested',typeofbedreq:type},{status:'Alloted',allotmenttime:Date.now()},(err,allottedpatient)=>{
                        if(err) console.log(err)
                        else{

                        }
                    })
                }
            })*/    
            Patient.findOneAndUpdate({districtid:req.user.districtid,status:'Requested',typeofbedreq:type},{status:'Alloted',allotmenttime:Date.now()},(err,allottedpatient)=>{
                if(err) console.log(err)
                else if(allottedpatient==null){
                    var key1='avaliablebeds.'+type
                    var key2='occupiedbeds.'+type
                    Hospital.findOneAndUpdate({_id:req.user._id},{$inc:{[key1]:1,[key2]:-1}},(err,updatedhosp)=>{
                        if(err) console.log(err)
                        else{
                            console.log(updatedhosp)
                        }
                    })
                }else{
                    console.log(allottedpatient)
                    var patadm=new PatientsAdmitted({
                        patientid:allottedpatient._id,
                        hospitalid:req.user._id,
                        districtid:req.user.districtid,
                        typeofbed:allottedpatient.typeofbedreq
                    })
                    PatientsAdmitted.create(patadm,(err,newpatadm)=>{
                        if(err) console.log(err)
                        else console.log(newpatadm)
                    })
                }

            })
        } 
    })
    PatientsAdmitted.findOneAndUpdate({patientid:req.params.id},{leaving:Date.now()},(err,datepat)=>{
        if(err) console.log(err)
        else console.log(datepat)
    })
    res.redirect("/viewpatients")
})

app.get("/view/:id",isLoggedIn,(req,res)=>{
    Patient.find({_id:req.params.id},(err,fulldetails)=>{
        if(err) console.log(err)
        else{
            console.log('Full',fulldetails)
            res.render("viewindividual",{patient:fulldetails[0]})
        } 
    })
})

function isLoggedIn(req,res,next){
	if(req.isAuthenticated())
		return next();
	res.redirect("/login");
}

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

function generatePid(){
    Patient.countDocuments((err,res)=>{
        if(err)
            console.log(err)
        else
        {
            var pid=res+1
            return pid
        }
    })
}

function getDistrictid(dname){
    let did
    District.find({name:dname},(err,res)=>{
        if(err)
            console.log(err)
        else{
            did=res[0]._id
        }
            
    })
    console.log(did)
}