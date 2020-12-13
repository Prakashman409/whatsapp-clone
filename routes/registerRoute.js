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

module.exports = registerRoute; 