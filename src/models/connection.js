const mongoose = require('mongoose')

const ConnectionSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required : true
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    status: {
        type: String,
        required :  true,
        enum: { 
            values: ['interested', 'ignored', 'accepted', 'rejected'],
            message : `{VALUE} is an incorrect status.`
        }
    }
},
{
    timestamps : true,
});

ConnectionSchema.pre("save", function (next) {
    const connectionRequest = this;
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
        throw new Error("Cannot send connection request to yourself!!")
    }
    next();
})
module.exports = mongoose.model('ConnectionRequest', ConnectionSchema);