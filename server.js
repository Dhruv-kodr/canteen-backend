const dns = require("node:dns");

require('dotenv').config()
const app = require('./src/app')

dns.setServers(["1.1.1.1", "8.8.8.8"]);
const connectDB = require("./src/database/mongoDB")
const port = process.env.PORT || 3000
connectDB();

app.listen(port,()=>{
    console.log("Server is started on port " + port)
})
