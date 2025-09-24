const express = require('express');
const authRouter = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

authRouter.post('/signUp', async (req, res) => {
    //Creating a new User
    const {firstName, lastName, emailId, password} = req.body;

    const hashPassword = await bcrypt.hash(password , 10)

    const user = new User({firstName , lastName , emailId , password : hashPassword});
    try {
        await user.save();
        res.send("User Added Successfully");
    }
    catch (err) {
        res.status(500).send("error occured "+ err.message)
    }
});

authRouter.post('/login',async (req,res) => {
    const {emailId, password} = req.body;

    try {
    const user = await User.findOne({emailId});

    if(!user) {
        throw new Error("Invalid Credentials")
    }
    const isPasswordValid = await bcrypt.compare(password,user.password)

    if(!isPasswordValid) {
        throw new Error("Invalid Credentials");
    }
    if(isPasswordValid) {
        const token = jwt.sign({id : user._id},"DevTinder@1%7");

        res.cookie('token',token)
        res.send(user);
    }
}    
    catch (err) {
        res.status(500).send("error occured "+ err.message)
    }
});

authRouter.post('/logout', (req, res) => {
    res.cookie('token',null ,{
        expires : new Date(Date.now())
    });
    res.send('Logged out successfully');
});

module.exports = authRouter;