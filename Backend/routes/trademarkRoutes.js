//routes/trademarkRoutes.js 
const express = require("express");
const router = express.Router();
const { createTrademark, updateTrademark, getServices } = require("../controllers/trademarkController");
 
router.post("/trademarks", createTrademark);
router.patch("/trademarks/:id", updateTrademark);
router.get("/trademarks/services", getServices); 
 
module.exports = router;
 