const express = require("express");

const router = express.Router();

const urlController = require("../controllers/urlController");

router.post("/url/shorten", urlController.generateUrl);

router.get("/:urlCode", urlController.redirectToLongUrl);

router.all("/*", (req, res) => {
  return res
    .status(400)
    .send({ status: false, message: "Please provide correct path!" });
});

module.exports = router;
