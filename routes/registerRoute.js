const express = require('express');
const registerRoute = express.Router();
const bcrypt = require('bcrypt');
const multer = require('multer')
const userModel = require('../model/userModel');
const path = require('path');
const appDir = path.dirname(require.main.filename);
const async = require('async');

const verifyJwt = require('../authenticate/passportLocal');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, appDir + '/public/userPhoto');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.fieldname);
    }
})


const upload = multer({ storage: storage });


registerRoute.route('/')
    .get(verifyJwt, (req, res) => {
        res.send('i am from registerRoute');
    })
    .post((req, res) => {
        const { firstname, lastname, email, password, username } = req.body;
        let errors = [];
        if (!firstname || !lastname || !email || !password || !username) {
            errors.push({ msg: "please enter all the fields" })
        };
        if (errors.length > 0) {
            res.json('register', { errors: errors });
        }
        userModel.findOne({ email: email }).exec((err, user) => {
            if (user) {
                errors.push({ msg: "email already existed" });
                res.json('register', { errors: errors });
            } else {
                const newUser = new userModel({
                    firstname: firstname,
                    lastname: lastname,
                    username: username,
                    email: email,
                    password: password,
                })
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(password, salt, (err, hash) => {
                        if (err) {
                            throw err;
                        }
                        //save password
                        newUser.password = hash;
                        newUser.save()
                            .then((value) => {
                                console.log(value);
                                res.status(201).send('register done');
                            }).catch((err) => console.log(err));
                    })
                })
            }
        })

    });

registerRoute.route('/upload')
    .post(verifyJwt, upload.single('file'), async (req, res) => {
        console.log(req.file.filename);
        if (!req.file) {
            res.status(404).json('file not found')

        } else {
            await userModel.findByIdAndUpdate({
                _id: req.user.id
            }, {
                userImage: req.file.filename
            }, {
                new: true
            })

        }
        res.status(200).json('photo Saved');

    });
registerRoute.route('/add')
    .post(verifyJwt, (req, res) => {

        async.parallel([
            //for updating receiver reciveRequest field
            function (cb) {
                if (req.body.receiverName) {
                    userModel.update({
                        'username': req.body.receiverName,
                        'receiveRequest.userId': { $ne: req.user.id },
                        'friendsList.friendId': { $ne: req.user.id }

                    }, {
                        $push: {
                            receiveRequest: {
                                userId: req.user.id,
                                username: req.user.username
                            }
                        },
                        $inc: { totalRequest: 1 },

                    }, (err, count) => {
                        console.log(err);
                        cb(err, count);
                    })
                }

            },
            //for updating sentRequest field 
            function (cb) {
                if (req.body.receiverName) {
                    userModel.update({
                        '_id': req.user.id,
                        'sentRequest.username': { $ne: req.body.receiverName }
                    },
                        {
                            $push: {
                                sentRequest: {
                                    username: req.body.receiverName
                                }
                            }
                        }, (err, count) => {
                            cb(err, count)
                        })
                }
            }

        ], (err, results) => {
            res.redirect('/add')
        });

        //this function is updated for the receiver of the receiveRequest when it is accepted
        async.parallel([
            function (cb) {
                if (req.body.receiverName) {
                    userModel.update({
                        'username': req.body.receiverName,
                        'friendsList.friendId': { $ne: req.user.id }
                    },
                        {
                            $push: {
                                friendsList: {
                                    friendId: req.user.id,
                                    friendName: req.user.username
                                }
                            },


                            $pull: {
                                receiveRequest: {
                                    userId: req.user.id,
                                    username: req.user.username
                                }

                            },
                            $inc: {
                                totalRequest: -1
                            }
                        }, (err, count) => {
                            cb(err, count)
                        })
                }
            },
            //for updating sender sentRequest when it is accepted by the receiver

            function (cb) {
               if(req.body.receiverName){
                   userModel.find({
                       username:req.body.receiverName
                   }).then((user)=>{
                       receiveUser=user
                   })
                   userModel.update({
                       _id:req.user.id,
                       'friendsList.friendId':{$ne:receiveUser._id}
                   },{
                       $push:{friendsList:{
                           friendId:receiveUser._id,
                           friendName:receiverUser.username
                       }
                       },
                       $pull:{
                           sentRequest:{
                               username:receiverUser.username
                           }
                       },
                       $inc:totalRequest=-1
                   },(err,count)=>{
                       cb(err,count)
                   })
               }
            },

        ])

    })


module.exports = registerRoute; 