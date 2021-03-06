const express = require("express");
const helemt = require("helmet");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const MongooseConnection = require("./utility/mongoose.connection");
const cors = require("cors");

require("dotenv").config();

MongooseConnection();
const app = express();

//middleware
app.use(express.json());
app.use(helemt());
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(cors());

app.use("/auth", require("./routes/user.routes"));

app.listen(process.env.PORT, () => {
  console.log("Server started listening on PORT : " + process.env.PORT);
});
