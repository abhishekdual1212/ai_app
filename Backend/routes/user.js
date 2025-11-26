// routes/user.js

const express = require('express');
const router = express.Router();
const { UserRegister } = require("../controllers/userRegister");


router.post("/userRegister", UserRegister);

module.exports = router;
