const express=require('express');
const passport = require('passport');
const verifyJwt = require('../authenticate/passportLocal');
const homeRoute=express.Router();

homeRoute.route('/')
.get(verifyJwt,(req,res)=>{
    res.send('this is homePage');
});

module.exports=homeRoute;