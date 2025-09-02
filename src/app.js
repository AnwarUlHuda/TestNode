const express = require("express")

const app = express();

app.use("/test",(req,res) => {
    res.send("Hello from server");
})
app.listen(7777, () => {
    console.log("Server is up and listening");
});