const mongoose = require("mongoose");
const express = require("express");
const route = require("./routes/routes");
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(cors());

mongoose
  .connect(
    "mongodb+srv://rajgupta07082000:0Um5TBcHGam3DxeZ@cluster0.p92r9bx.mongodb.net/url-shortner",
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.use("/", route);

app.listen(5000, () => {
  console.log("Express server is running on port 5000");
});
