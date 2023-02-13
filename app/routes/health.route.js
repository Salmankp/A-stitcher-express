const express = require("express");
const router = express.Router();

const healthCheck = async (req, res) => {
    res.status(200).json({"status": 'UP'})
}

router.get("", healthCheck);

module.exports = router;
