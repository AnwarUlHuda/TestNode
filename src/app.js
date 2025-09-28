const express = require("express")
const { userAuth } = require('./middlewares/userAuth')
const app = express();
const connectDB = require("./config/database");
const User = require("./models/user");
const cookieParser = require('cookie-parser');
const cors = require("cors");
const http = require("http");
const initializeSocket = require('./utils/socket');
require('dotenv').config();

require('./utils/Cronjobs');

app.use(cors({
    origin:"http://localhost:5173",
    credentials: true,
}))
app.use(express.json());
app.use(cookieParser());

const authRouter = require('./routes/authRouter');
const profileRouter = require('./routes/profileRouter')
const connectionRouter = require('./routes/ConnectionRouter');
const userRouter = require('./routes/userRouter');
const paymentRouter = require("./routes/paymentRouter");
const chatRouter = require('./routes/chatRouter');

app.use('/', authRouter);
app.use('/',connectionRouter);
app.use('/',paymentRouter);
app.use('/',chatRouter);
app.use('/user',userRouter);
app.use('/profile',profileRouter);      

const server = http.createServer(app);
initializeSocket(server)


connectDB().then(() => {
    console.info("Connected to DB successfully")
    server.listen(process.env.PORT, () => {
        console.log("Server is up and listening");
    })
}).catch((err) => {
    console.error(err.message + " Error occured");
})