const express=require('express');
const passport = require('passport');
const userModel = require('../model/userModel');
const authenticate=require('../authenticate/passportLocal');
const loginRoute=express.Router();
const jwt=require('jsonwebtoken');

loginRoute.route('/')
.get((req,res)=>{
    res.send('i am from login');
})
.post(passport.authenticate('local'),(req,res)=>{
    var token=jwt.sign({id:req.user._id},'prakash')
    res.status(200).send({auth:true,message:"login done",token:token});
});
loginRoute.route('/logout')
.get((req,res)=>{
    req.logout();
    res.redirect('/login');
})


module.exports=loginRoute;

