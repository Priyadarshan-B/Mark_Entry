const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const path = require("path");
const axios = require("axios");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const { setEncryptedCookie, removeEncryptedCookie } = require("../../config/encrpyt");
const router = express.Router();

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
  }),
  async function (req, res) {
    const token = generateToken(req.user);

    setEncryptedCookie(res, "authToken", token);

    try {
      const role = req.user.role;
      const response = await axios.get(`${process.env.API_URL}/resources?role=${role}`);
      const allowedRoutes = response.data;

      if (allowedRoutes.length > 0) {
        const routes = allowedRoutes.map((route) => route.path);
        setEncryptedCookie(res, "allowedRoutes", JSON.stringify(routes));

        const redirectPath = routes[0];
        res.redirect(`${process.env.CLIENT_URL}${redirectPath}`);
      } else {
        res.redirect(`${process.env.CLIENT_URL}/error`);
      }
    } catch (error) {
      console.error("Error fetching allowed routes:", error);
      res.redirect(`${process.env.CLIENT_URL}/error`);
    }
  }
);

const generateToken = (user) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      role: user.role,
      reg_no:user.reg_no,
      gmail: user.gmail,
      profile: user.profilePhoto,
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
};

router.post("/logout", (req, res) => {
  removeEncryptedCookie(res, "authToken");
  removeEncryptedCookie(res, 'allowedRoutes')

  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Error during logout" });
    }
    return res.status(200).json({ message: "Logout successful" });
  });
});

module.exports = router;
