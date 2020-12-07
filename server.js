const express=require('express');
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const ejs=require('ejs');
const loginRoute=require('./routes/loginRoute');
const registerRoute=require('./routes/registerRoute');
const homeRoute=require('./routes/homeRoute');
const passport = require('passport');
const userModel = require('./model/userModel');
const app=express();


//Database connection
const mongoosePath='mongodb+srv://basnetprakash:pokhara@trafficweb.tx4n0.mongodb.net/whatsappClone?retryWrites=true&w=majority';
mongoose.connect(mongoosePath,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}).then(()=>{
    console.log('database connected')
}).catch((err)=>console.log(err));

app.use(passport.initialize());
passport.serializeUser((user,done)=>{
     done(null,user.id);
});
passport.deserializeUser((id,done)=>{
    userModel.findById(id,(err,user)=>{
        done(err,user);
    });
});

app.set('view engine','ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));



app.use('/register',registerRoute);
app.use('/login',loginRoute);
app.use('/home',homeRoute);


//listening to server
const PORT=process.env.PORT||8000;
app.listen(PORT,()=>{
    console.log(`server is running in port ${PORT}`);
});