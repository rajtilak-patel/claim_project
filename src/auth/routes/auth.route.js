const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getUserInfo,
} = require("../controller/auth.controller");
const { verifyToken } = require("../../auth/middleware/auth.middleware");

router.post("/register", register);
router.post("/login", login);

router.get("/user-info", verifyToken, getUserInfo);

module.exports = router;
