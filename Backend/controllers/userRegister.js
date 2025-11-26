// controllers/userRegister.js
const User = require("../models/User");

exports.UserRegister = async (req, res) => {
  const { uid, name, email } = req.body;

  if (!uid || !name || !email) {
    return res.status(400).send({
      success: false,
      message: "Missing required fields: uid, name, or email",
    });
  }

  try {
    const updatedUser = await User.findOneAndUpdate(
      { firebase_uid: uid },
      { name, email },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).send({
      success: true,
      data: updatedUser,
      message: "User registered or updated successfully",
    });
  } catch (e) {
    return res.status(500).send({
      success: false,
      message: "Server error: " + e.message,
    });
  }
};
