const mongoose=require('mongoose');

const registerData=new mongoose.Schema({
    firstname:{
        type:String,
        required:true,
    },
    lastname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    userImage:{
        type:String,
        default:'default.png'
    }
});

module.exports=mongoose.model('registerInfo',registerData);

