// utils/respond.js

const respond = (res, success, message, data = null, status = 200) => {
  return res.status(status).json({ success, message, data });
};

module.exports = respond;
