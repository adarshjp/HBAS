const mongoose=require('mongoose')
const patientSchema=new mongoose.Schema({
    name:String,
    districtid:{
        type:mongoose.Schema.Types.ObjectId, 
        ref: 'District'
    },
    age:Number,
    address:String,
    phoneno:Number,
    status:String,
    requesttime:{
        type:Date,
        default:Date.now
    },
    typeofbedreq:String,
    allotmenttime:Date,
    caretakername:String,
    caretakerphno:Number
})
module.exports=new mongoose.model('Patient',patientSchema)