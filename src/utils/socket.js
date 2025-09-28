const socket = require('socket.io');
const crypto = require("crypto");
const Message = require('../models/chat');
const Chat = require('../models/chat');
const User = require('../models/user');

const getSecretRoomId = (userId, targetUserId) => {
    return crypto.createHash('sha256').update([userId, targetUserId].sort().join("_")).digest('hex');
}
const initializeSocket = (server) => {
    const io = socket(server, {
        cors: {
            origin: "http://localhost:5173"
        }
    });

    io.on("connection", (socket) => {
        socket.on("joinChat", async ({ firstName, userId, targetUserId }) => {
            const room = getSecretRoomId(userId, targetUserId)
            socket.join(room);
            const targetUser = await User.findById(targetUserId).select('firstName lastName photoUrl');
            io.to(room).emit("joinedSuccessful",{targetUser})
        });

        socket.on("sendMessage", async ({ firstName, lastName, userId, targetUserId, text }) => {
            const room = getSecretRoomId(userId, targetUserId);
            //save message to DB
            try {
                let chat = await Chat.findOne({
                    participants: { $all: [userId, targetUserId] }
                })
                if (!chat) {
                    chat = new Chat({
                        participants: [userId, targetUserId],
                        messages: []
                    })
                }

                chat.messages.push({
                    senderId: userId,
                    text,
                })

                await chat.save();

            }
            catch (err) {
                console.error(err);
            }
            io.to(room).emit("messageReceived", { firstName, lastName, text });
        });

        socket.on("disconnect", ({ firstName, userId, targetUserId }) => {
        });
    })
}

module.exports = initializeSocket;
