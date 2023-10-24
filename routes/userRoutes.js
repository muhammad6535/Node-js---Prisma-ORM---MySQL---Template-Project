const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");
const validator = require("validator");
const PhoneNumber = require("libphonenumber-js");
const bcrypt = require("bcrypt");

router.post("/users", async (req, res) => {
  try {
    const { username, password, email, phone } = req.body;

    // Validate email
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate username
    if (username.length < 3) {
      return res
        .status(400)
        .json({ error: "username must be more than 2 charechters" });
    }

    // Validate password
    if (password.length < 4) {
      return res
        .status(400)
        .json({ error: "Invalid password format or length" });
    }

    if (!PhoneNumber.isValidPhoneNumber("+972" + phone)) {
      return res.status(400).json({ error: "Invalid phone format or length" });
    }

    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword, email, phone },
    });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/userValidation", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user in the database by username
    const user = await prisma.user.findFirst({
      where: { username: username },
    });

    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found! Wrong username or password." });
    }

    // Compare the provided password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ error: "Incorrect password! Wrong username or password." });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
