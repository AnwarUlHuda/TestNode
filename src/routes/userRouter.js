const express = require('express');
const { userAuth } = require('../middlewares/userAuth');
const userRouter = express.Router();
const ConnectionModel = require('../models/connection');
const User = require('../models/user');

userRouter.get('/requests', userAuth, async (req, res) => {
    try{
        const loggedInUser = req.user;
        const requests = await ConnectionModel.find(
            {
                toUserId : loggedInUser._id, 
                status: 'interested'
            }).populate("fromUserId" , "firstName lastName photoUrl")

        if(requests.length == 0){
            return res.json({message:"No requests found"})
        }
        else{
            const data = requests.map(({fromUserId}) => fromUserId);
            res.json({data});
        }
    }
    catch (err) {
        res.status(400).send("Error occured: " + err.message);
    }
})

userRouter.get('/connections', userAuth, async (req, res) => {
    try{
        const loggedInUser = req.user;
        const data = await ConnectionModel.find({
            $or: [{fromUserId : loggedInUser._id},{toUserId : loggedInUser._id}],
            $and: [{status : "accepted" }]
        }).populate("fromUserId", "firstName lastName").populate("toUserId","firstName lastName")
        const response = data.map(({fromUserId, toUserId})=> fromUserId.equals(loggedInUser._id) ? toUserId : fromUserId)
        res.json(response);
    }
    catch (err) {
        res.status(400).send("Error occured: " + err.message);
    }
})

userRouter.get("/feed", userAuth , async (req, res) => {
try {
    const loggedInUser = req.user;
    const pageNumber = parseInt(req.query.page) || 1;
    let documents = parseInt(req.query .limit) || 10;
    documents = documents > 50 ? 50 : documents

    const skip = (pageNumber-1)*documents;
    const allConnections = await ConnectionModel.find({
        $or:[{fromUserId : loggedInUser},{toUserId:loggedInUser}]
    }).select("fromUserId toUserId")
    let hideUsers = new Set();
    allConnections.forEach(({fromUserId, toUserId}) => {
        hideUsers.add(fromUserId.toString())
        hideUsers.add(toUserId.toString())
    })    
    const allUsers = await User.find({
        $and : [
            {_id : { $nin : Array.from(hideUsers)}},
            {_id :{ $ne : loggedInUser._id}}]
        }).select("firstName lastName skills age gender about").skip(skip).limit(documents);

    res.json({data : allUsers})
}
catch (err) {
        res.status(400).send("Error occured: " + err.message);
    }
})
module.exports = userRouter;