const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect(
        "mongodb+srv://DataDynamo:Anwar-test@mine.62vlsly.mongodb.net/devTinder"
    )
}

module.exports = connectDB