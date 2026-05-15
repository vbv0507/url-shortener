const mongoose=require('mongoose');

const apikeySchema=mongoose.Schema({
    key:{
        type:String,
        required:true,
        unique:true,
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true,
    },
    createAt:{
        type:Date,
        default:Date.now,
    },
});

module.exports=mongoose.model('apikey',apikeySchema);
