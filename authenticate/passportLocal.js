const passport=require('passport');
const localStrategy=require('passport-local').Strategy;
const userModel=require('../model/userModel');
const bycrpt=require('bcrypt');
const jwt=require('jsonwebtoken');


// email and password verify
passport.use(new localStrategy({
    usernameField:'email',
    passwordField:'password'
},function(username,password,done){
    userModel.findOne({email:username},function(err,user){
        if(err){
            return done(err);
        }
        if(!user){
            return done(null,false);
        }

        bycrpt.compare(password,user.password,(err,isMatch)=>{
                if(err) throw err;
                if(isMatch){
                    return done(null,user)
                }else{
                    return done(null,false,{message:'password incorrect'});
                }
                 })
    })
}))

//verifying jwt

const verifyJwt=(req,res,next)=>{
    var token=req.headers['x-access-token'];
    var id;
    if(!token){
        return res.status(401).send({auth:false,message:'no token provided'});
    }
    jwt.verify(token,'prakash',function(err,decoded){
        if(err){
            return res.status(500).send({auth:false,message:'failed to authenticate token'})
        }
        id=decoded;
        next();
    })
   
}

module.exports=verifyJwt;

