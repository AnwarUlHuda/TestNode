const mongoose = require("mongoose");

const validator = require('validator');

const userSchema = new mongoose.Schema({
    firstName : {
        type : String,
        required : true,
        minLength : 4,
        maxLength : 20,
    },
    lastName : {
        type : String,
        maxLength : 20,
    },
    password : {
        type : String,
        required : true,
        validate(value) {
            if(!validator.isStrongPassword(value)){
                throw new Error("Password is not a Strong Password")
            }
        }
    },
    age : {
        type : Number,
        min : 18,
        max : 100,
    },
    emailId : {
        type : String,
        trim : true,
        lowercase : true,
        required : true,
        unique : true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error("Enter a valid email", + value)
            }
        }
    },
    gender : {
        type : String,
        validate(value) {
            if(!["male", "female","others"].includes(value.toLowerCase())){
                throw new Error('Gender data is not valid')
            }
        }
    },
    photoUrl : {
        type : String,
        validate(value) {
            if(!validator.isURL(value)){
                throw new Error("Enter a valid photo");
            }
        }
    },
    about : {
        type : String,
        default : "This is a default about of a user.",
        maxLength: 250,
    },
    skills : {
        type: [String],
        validate(value) {
            if(value.length > 10){
                throw new Error("Skills must not be more than 10")
            }
        }
    }
},{
    timestamps : true
})

module.exports = mongoose.model("User",userSchema);