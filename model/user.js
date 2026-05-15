const mongoose=require('mongoose');
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true
    },
    user_id:{
        type:String,
        unique:true,
        require:true
    },
    apiKey:{
        type:String,
        unique:true,
        sparse:true
    }
},{timestamps:true})

const User=mongoose.model('user',userSchema);
module.exports=User;
