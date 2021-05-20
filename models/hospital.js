const mongoose=require('mongoose'),
psssportLocalMongoose=require('passport-local-mongoose')
const hospSchema=new mongoose.Schema({
    username:String,
    password:String,
    name:String,
    address:String,
    phoneno:Number,
    emailid:String,
    type:String,
    districtid:{
        type:mongoose.Schema.Types.ObjectId, 
        ref: 'District'
    },
    totalbeds:{
        general:Number,
        oxygen:Number,
        icu:Number,
        icu_v:Number
    },
    occupiedbeds:{
        general:Number,
        oxygen:Number,
        icu:Number,
        icu_v:Number
    },
    avaliablebeds:{
        general:Number,
        oxygen:Number,
        icu:Number,
        icu_v:Number
    }
})

hospSchema.plugin(psssportLocalMongoose);
module.exports=new mongoose.model('Hospital',hospSchema)