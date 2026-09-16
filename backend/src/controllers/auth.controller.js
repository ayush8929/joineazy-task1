import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";

const SALT_ROUNDS = 10;

// Simple name@domain.tld shape check — not RFC-5322-exhaustive, just enough
// to catch obvious typos/garbage before hitting the database.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
  return typeof email === "string" && EMAIL_REGEX.test(email.trim());
}

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function toPublicUser(user) {
  const { passwordHash, ...publicUser } = user;
  return publicUser;
}

export async function register(req, res) {
  try {
    const { name, email, password, role, student_id } = req.body;

    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: "name, email, password, and role are required." });
    }

    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address." });
    }

    if (!["student", "admin"].includes(role)) {
      return res
        .status(400)
        .json({ message: "role must be 'student' or 'admin'." });
    }

    if (role === "student" && !student_id) {
      return res
        .status(400)
        .json({ message: "student_id is required for student accounts." });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        studentId: role === "student" ? student_id : null,
      },
    });

    const token = signToken(user);
    res.status(201).json({ token, user: toPublicUser(user) });
  } catch (err) {
    console.error("Register error:", err);
    res
      .status(500)
      .json({ message: "Something went wrong during registration." });
  }
}

// Protected — returns the logged-in user's own profile.
// Used by the frontend to confirm a stored token is still valid,
// and useful for manually testing that requireAuth works.
export async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user: toPublicUser(user) });
  } catch (err) {
    console.error("Me error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required." });
    }

    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address." });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signToken(user);
    res.json({ token, user: toPublicUser(user) });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Something went wrong during login." });
  }
}
