const express = require("express");
const { connectToMongoDB } = require("./connect");
const urlRoute = require("./routes/url");
const URL = require("./models/urlModel");

const app = express();
const PORT = 8001;

connectToMongoDB(
  "mongodb+srv://rajgupta07082000:0Um5TBcHGam3DxeZ@cluster0.p92r9bx.mongodb.net/url-shortner"
).then(() => console.log("Mongodb connected"));

app.use(express.json());

app.use("/url", urlRoute);

app.get("/:shortId", async (req, res) => {
  try {
    const shortId = req.params.shortId;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get("user-agent");
    const entry = await URL.findOneAndUpdate(
      {
        shortId,
      },
      {
        $push: {
          visitHistory: {
            timestamp: Date.now(),
            ipAddress,
            userAgent,
          },
        },
      }
    );
    res.redirect(entry.redirectURL);
  } catch (error) {
    res.send(error);
  }
});

app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));
