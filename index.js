var express = require('express');
var cors = require('cors'); 
const dotenv = require("dotenv");
var app = express();
app.use(cors());
dotenv.config();

// parse application/json
app.use(express.json())
app.get("/", (req, res) => {
    res.send("Api Working");
});
const quizRoute = require('./routes/quizRoute');
app.use("/quiz", quizRoute);

const port = process.env.PORT || 8000;
app.listen(port, () =>
    console.log(`Server listening at http://localhost:${port}`)
);