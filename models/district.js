const mongoose=require('mongoose')

const districtSchema=new mongoose.Schema({
    name:{
        type:String,
        unique:true,
        required:true
    },
    phoneno:{
        type:Number,
        unique:true,
        required:true
    }
})

module.exports=mongoose.model('District',districtSchema)