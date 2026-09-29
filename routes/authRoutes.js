const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "E-mail e senha são obrigatórios.",
      });
    }

    if (!process.env.ADMIN_EMAIL) {
      throw new Error(
        "ADMIN_EMAIL não configurado."
      );
    }

    if (!process.env.ADMIN_PASSWORD_HASH) {
      throw new Error(
        "ADMIN_PASSWORD_HASH não configurado."
      );
    }

    if (!process.env.JWT_SECRET) {
      throw new Error(
        "JWT_SECRET não configurado."
      );
    }

    const emailMatches =
      email.toLowerCase().trim() ===
      process.env.ADMIN_EMAIL.toLowerCase().trim();

    if (!emailMatches) {
      return res.status(401).json({
        message: "Credenciais inválidas.",
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        process.env.ADMIN_PASSWORD_HASH
      );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Credenciais inválidas.",
      });
    }

    const token = jwt.sign(
      {
        role: "admin",
        email: process.env.ADMIN_EMAIL,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h",
      }
    );

    return res.json({
      token,
      admin: {
        email: process.env.ADMIN_EMAIL,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);

    return res.status(500).json({
      message: "Erro interno ao realizar login.",
    });
  }
});

module.exports = router;