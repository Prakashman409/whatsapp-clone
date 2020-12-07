const express=require('express');
const registerRoute=express.Router();
const bcrypt=require('bcrypt');
const userModel=require('../model/userModel');


registerRoute.route('/')
.get((req,res)=>{
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

module.exports=registerRoute; 