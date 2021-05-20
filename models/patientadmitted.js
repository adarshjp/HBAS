const mongoose=require('mongoose')
const patadmSchema=new mongoose.Schema({
    patientid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Patient'
    },
    hospitalid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Hospital'
    },
    districtid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'District'
    },
    joining:{
        type:Date
    },
    leaving:Date,
    typeofbed:String
})
module.exports=new mongoose.model('PatientsAdmitted',patadmSchema)