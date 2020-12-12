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
    username:{
        type:String,
        required:true,
        unique:true
    },
    userImage:{
        type:String,
        default:'default.png'
    },
    sentRequest:[{
        username:{
            type:String,
            ref:'User'
        }
    }],
    receiveRequest:[{
      userId:{
          type:mongoose.Schema.Types.ObjectId,
          ref:'userModel'
      },
      username:{
          type:String
      }
    }],
    friendsList:[{
        friendId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'userModel'
        },
        friendName:{type:String}
    }],
    totalRequest:{type:Number}
});

module.exports=mongoose.model('registerInfo',registerData);

