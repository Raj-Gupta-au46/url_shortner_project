const URL = require("../models/urlModel");
const shortid = require("shortid");
const winston = require("winston");

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "url-shortener.log" }),
  ],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
});

async function handleGenerateNewShortURL(req, res) {
  const body = req.body;
  const ipAddress = req.ip; // Obtain the client's IP address
  const userAgent = req.get("User-Agent"); // Obtain the user agent
  if (!body.url) {
    logger.error("URL is required");
    return res.status(400).json({ error: "url is required" });
  }

  const isValidURL = isValidUrl(body.url);
  if (!isValidURL) {
    logger.error("Invalid URL");
    return res.status(400).json({ error: "Invalid URL" });
  }

  const shortID = shortid();

  try {
    await URL.create({
      shortId: shortID,
      redirectURL: body.url,
      visitHistory: [{ timestamp: Date.now(), ipAddress, userAgent }],
    });

    logger.info(
      `Short URL generated: ${shortID}, Original URL: ${body.url}, IP Address: ${ipAddress}, User Agent: ${userAgent}`
    );
    return res.json({ id: shortID });
  } catch (error) {
    logger.error(`Error generating short URL: ${error.message}`);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function handleGetAnalytics(req, res) {
  const shortId = req.params.shortId;

  try {
    const result = await URL.findOne({ shortId });
    logger.info(`Analytics requested for Short URL: ${shortId}`);

    return res.json({
      totalClicks: result.visitHistory.length,
      analytics: result.visitHistory,
    });
  } catch (error) {
    logger.error(`Error fetching analytics: ${error.message}`);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  handleGenerateNewShortURL,
  handleGetAnalytics,
};
