const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
require("dotenv").config(); // Asegúrate de tener un archivo .env con TOKEN_SECRET configurado

// Registro de usuario
router.post(
  "/register",
  [
    body("name")
      .isLength({ min: 3 })
      .withMessage("El nombre debe tener al menos 3 caracteres"),
    body("email").isEmail().withMessage("Por favor, introduce un email válido"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verificar si el usuario ya existe
    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists)
      return res.status(400).json({ message: "Email ya registrado" });

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Crear un nuevo usuario
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });

    try {
      const savedUser = await user.save();
      res.status(201).json({ userId: savedUser._id });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Logueo de usuario
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Por favor, introduce un email válido"),
    body("password").exists().withMessage("La contraseña es requerida"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verificar si el email existe
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res
        .status(400)
        .json({ message: "Email o contraseña incorrectos" });

    // Verificar la contraseña
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass)
      return res
        .status(400)
        .json({ message: "Email o contraseña incorrectos" });

    // Crear y asignar un token
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: "1h",
    });
    res
      .header("auth-token", token)
      .json({ message: "Logueado con exito", token });
  }
);

module.exports = router;
