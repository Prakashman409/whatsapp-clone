const express=require('express');
const friendRoute=express.Router();
const userModel=require('../model/userModel');
const verifyJwt=require('../authenticate/passportLocal');


   friendRoute.post('/add',verifyJwt, (req, res) => {

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
