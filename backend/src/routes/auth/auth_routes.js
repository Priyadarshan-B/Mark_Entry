const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const path = require("path");
const axios = require("axios");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const {
  setEncryptedCookie,
  getDecryptedCookie,
  removeEncryptedCookie,
} = require("../../config/encrpyt");
const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
  }),
  async function (req, res) {
    const token = generateToken(req.user);

    const userData = {
      token: token,
      name: req.user.name,
      roll: req.user.reg_no,
      role: req.user.role,
      id: req.user.id,
      gmail: req.user.gmail,
      profile: req.user.profilePhoto,
    };
    setEncryptedCookie(res, "userdata", JSON.stringify(userData));

    const decryptedUserData = getDecryptedCookie(req, "userdata");
    console.log("Decrypted User Data:", decryptedUserData);
    

    if (decryptedUserData) {
      let parsedData;
      parsedData = JSON.parse(decryptedUserData);
     const { token, name, role, id, gmail, profile } = parsedData;
    
      console.log("Token:", token);
      console.log("Name:", name);
      console.log("Role:", role);
      console.log("ID:", id);
      console.log("Gmail:", gmail);
      console.log("Profile Photo URL:", profile);
    } else {
      console.error("Failed to decrypt userdata or userdata is null.");
    }
    
    try {
      const role = req.user.role;
      const response = await axios.get(
        `${process.env.API_URL}/resources?role=${role}`
      );
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
      userId: user.id,
      name: user.name,
      roll: user.reg_no, 
      role: user.role, 
      id: user.id,
      gmail: user.gmail,
      profile: user.profilePhoto,
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
};

// Logout
router.post("/logout", (req, res) => {
  removeEncryptedCookie(res, "userData");


  req.logout((err) => { 
    if (err) {
      return res.status(500).json({ message: "Error during logout" });
    }
    return res.status(200).json({ message: "Logout successful" });
  });
});


module.exports = router;
