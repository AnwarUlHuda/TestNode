const express = require('express');
const { userAuth } = require('../middlewares/userAuth');
const connectionRequest = express.Router();
const ConnectionModel = require('../models/connection');
const User = require('../models/user');


connectionRequest.post('/request/send/:status/:toUserId', userAuth, async (req, res) => {
    try {
        const userId = req.user._id;
        const toUserId = req.params.toUserId
        const status = req.params.status
        if(userId.equals(toUserId)) {
            return res.status(400).json({message : "Cannot send connection request to yourself...!!!"})
        }
        if (!['interested', 'ignored'].includes(status)) {
            return res.status(400).send({ message: `Invalid status type: ${status}` })
        }
        const userExist = await User.findById(toUserId)
        if(!userExist){
            return res.status(400).json({message : 'User not found'});
        }
        const isExist = await ConnectionModel.findOne({
            $or: [
                {fromUserId: toUserId,toUserId: userId,}, 
                { fromUserId: userId, toUserId: toUserId }]
        })

        if (isExist && isExist.status == 'interested' && status == 'interested') {
            if(isExist.fromUserId == toUserId) {
            await isExist.updateOne({ status: 'accepted' })
            return res.send('Profile Matched');
            }
            else{
                return res.status(400).json({message : "Connection request already exist!!!"});
            }
        }

        if(isExist && isExist.status == 'accepted'){
            return res.status(400).json({message:"You are already connected"})
        }

        const sendRequest = new ConnectionModel({
            fromUserId: userId,
            toUserId: toUserId,
            status: status
        })
        await sendRequest.save();
        if (status == 'interested') {
            return res.send({ message: 'Connection request sent successfully' });
        }
        res.send("Profile Ignored successfully");
    }
    catch (err) {
        res.status(400).send("Error occured: " + err.message);
    }
})

connectionRequest.post('/request/review/:status/:requestId', userAuth, async (req,res) => {
    try{
        const loggedInUser = req.user;  
        const {status, requestId} = req.params;
        if(!['accepted', 'rejected'].includes(status)){
            return res.status(400).json({message : `${status} not allowed`});
        }
        const userExist = await ConnectionModel.findOne({
            _id : requestId,
            toUserId : loggedInUser,
            status : "interested"
        });

        if(!userExist){
            return res.status(400).json({message : "Connection request not founnd"});
        }
        userExist.status = status;
        const data = await userExist.save();
        res.json({message : status + "connection request successfully"});

    }
    catch (err) {
        res.status(400).send("Error occured: " + err.message);
    }
})

module.exports = connectionRequest