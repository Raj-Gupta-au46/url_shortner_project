const urlModel = require("../models/urlModel");
const isUrlValid = require("url-validation");
const { isValidRequestBody, isValid } = require("../validations/validation");
const shortid = require("shortid");
const redis = require("redis");
const { promisify } = require("util");

// 1. Connect to the Redis server
const redisClient = redis.createClient(
  10198,
  "redis-10198.c305.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);

redisClient.auth("Eu7uRDj6Inpvqa6k2pPEUx8pqCoXPWaZ", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});

// 2. Prepare the functions for each command
const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

//------------------------first API to generate URL code-------------------------------------------------
const generateUrl = async function (req, res) {
  try {
    const { longUrl } = req.body;

    if (!isValidRequestBody(req.body)) {
      return res.status(400).send({
        status: false,
        message: "Invalid request parameters. Please provide long URL",
      });
    }

    if (!isValid(longUrl)) {
      return res
        .status(400)
        .send({ status: false, message: "longUrl is required" });
    }

    // Check if the long URL is valid
    if (!isUrlValid(longUrl)) {
      return res.status(400).send({
        status: false,
        message: "longUrl is not valid. Please provide a valid URL",
      });
    }

    let cachedUrlData = await GET_ASYNC(`${longUrl}`);
    if (cachedUrlData) {
      const urlDetails = JSON.parse(cachedUrlData);
      return res.status(200).send({
        status: true,
        data: urlDetails,
        msg: "URL is coming from Cache",
      });
    }

    let myUrl = longUrl;
    let url = await urlModel
      .findOne({ longUrl: myUrl })
      .select({ longUrl: 1, shortUrl: 1, urlCode: 1, _id: 0 });
    if (url) {
      await SET_ASYNC(`${longUrl}`, JSON.stringify(url), "EX", 30);
      return res
        .status(200)
        .send({ status: true, data: url, msg: "URL is coming from DB" });
    } else {
      const urlCode = shortid.generate();
      let shortUrl = `${req.protocol}://${req.headers.host}/` + urlCode;
      let shortUrlInLowerCase = shortUrl.toLowerCase();

      url = {
        longUrl: longUrl,
        shortUrl: shortUrlInLowerCase,
        urlCode: urlCode,
      };

      const myShortUrl = await urlModel.create(url);
      await SET_ASYNC(`${longUrl}`, JSON.stringify(myShortUrl), "EX", 30);
      res.status(201).send({ status: true, data: myShortUrl });
    }
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
};

//--------------------------GetApi-----------------------

const redirectToLongUrl = async function (req, res) {
  try {
    const urlCode = req.params.urlCode;

    //finding longUrl in cache through urlCode

    let cachedUrlData = await GET_ASYNC(`${urlCode}`);

    if (cachedUrlData) {
      console.log(cachedUrlData);
      const parseLongUrl = JSON.parse(cachedUrlData);
      console.log(parseLongUrl);
      res.status(302).redirect(parseLongUrl.longUrl);
    } else {
      const findUrl = await urlModel.findOne({ urlCode: urlCode });
      if (!findUrl) {
        return res.status(404).send({ status: false, msg: "No URL Found" });
      } else {
        await SET_ASYNC(`${urlCode}`, JSON.stringify(findUrl), "EX", 30);
        res.status(302).redirect(findUrl.longUrl);
      }
    }
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

module.exports = { generateUrl, redirectToLongUrl };
