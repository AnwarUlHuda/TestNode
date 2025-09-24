const express = require('express');
const { userAuth } = require('../middlewares/userAuth');
const User = require("../models/user");
const bcrypt = require('bcrypt');
const profileRouter = express.Router();
const validator = require('validator');

profileRouter.get('/view', userAuth, (req, res) => {
    try {
        res.send(req.user);
    }
    catch (err) {
        res.status(400).send("Error occured" + err.message);
    }
});

profileRouter.get('/allUsers', userAuth, async (req, res) => {
    try {
        const result = await User.find();
        res.send(result);
    }
    catch (err) {
        res.status(500).send("Error occured" + err.message);
    }
});

profileRouter.patch('/edit', userAuth, async (req, res) => {
    const allowedEdit = ["skills", "age", "about", "photoUrl", "gender", "firstName", "lastName"]
    try {
        const isEditAllowed = Object.keys(req.body).every(field => allowedEdit.includes(field))
        if (!isEditAllowed) {
            throw new Error('Invalid Edit Request')
        }
        else {
            const user = await User.findByIdAndUpdate(req.user._id, req.body, {
                runValidators: true,
                returnDocument: 'after'
            })
            res.json({
                message: "Profile updated successfully",
                data: user
            });
        }
    }
    catch (err) {
        res.status(400).send("Error occured: " + err.message);
    }
});

profileRouter.patch("/password", async (req, res) => {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId })
    try {
        if (!user) {
            throw new Error('Invalid Credentials')
        }
        if(!validator.isStrongPassword(password))
        {
            throw new Error('Please enter a strong password')
        }
        const isPasswordValid = await bcrypt.compare(password,user.password)
        if(isPasswordValid){
            throw new Error("New password cannot be old password")
        }
        
        const hashpassword = await bcrypt.hash(password, 10)
        const update = await User.findByIdAndUpdate(user._id,{password : hashpassword},{
            returnDocument :"after"
        })
        res.send('Password updated successfully');

    } catch (err) {
        res.status(400).send("Error occured: " + err.message);
    }

});

module.exports = profileRouter