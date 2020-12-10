const express=require('express');
const registerRoute=express.Router();
const bcrypt=require('bcrypt');
const multer=require('multer')
const userModel=require('../model/userModel');
const path=require('path');
const verifyJwt = require('../authenticate/passportLocal');
const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,__dirname+'/userPhoto');
    },
    filename:(req,file,cb)=>{
        cb(null,file.fieldname);
    }
})

const upload=multer({storage:storage});


registerRoute.route('/')
.get(verifyJwt,(req,res)=>{
    res.send('i am from registerRoute');
})
.post((req,res)=>{
      const {firstname,lastname,email,password}=req.body;
      let errors=[];
      if(!firstname||!lastname||!email||!password){
          errors.push({msg:"please enter all the fields"})
      };
      if(errors.length>0){
        res.render('register',{errors:errors});
      }
          userModel.findOne({email:email}).exec((err,user)=>{
              if(user){
                  errors.push({msg:"email already existed"});
                  res.render('register',{errors:errors})
              }else{
                  const newUser=new userModel({
                      firstname:firstname,
                      lastname:lastname,
                      email:email,
                      password:password,
                  })
                  bcrypt.genSalt(10,(err,salt)=>{
                      bcrypt.hash(password,salt,(err,hash)=>{
                          if(err){
                              throw err;
                          }
                          //save password
                          newUser.password=hash;
                          newUser.save()
                          .then((value)=>{
                              console.log(value);
                              res.send('register done');
                          }).catch((err)=>console.log(err));
                      })
                  })
              }
          })

})

registerRoute.route('/upload')
.post(verifyJwt,upload.single('file'),(req,res)=>{

    console.log(id);
   
        if(!req.file){
            return res.send('no file uploaded');
        } else{
           
        userModel.findOneAndUpdate({
            email:req.user.id
        },{
            'userImage':filename
        }, (err,result)=>{
            if(err){
                throw err;
            }
        }
        )
        }   
        res.send('profile pic uploaded');
})

module.exports=registerRoute; 