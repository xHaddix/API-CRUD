const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");

// Obtener todos los usuarios
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtener un usuario por ID
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crear un nuevo usuario
router.post(
  "/",
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

// Eliminar un usuario por ID
router.delete("/:userId", async (req, res) => {
  try {
    const removedUser = await User.findByIdAndDelete(req.params.userId);
    if (!removedUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json({ message: "Usuario eliminado", user: removedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Actualizar un usuario por ID
router.patch("/:userId", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: { name: req.body.name, email: req.body.email } },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
