
const express = require("express");

const {
    getUsers,
    getUserById
} = require("../controllers/usersController");

const router = express.Router();

// GET /api/users
router.get("/", getUsers);

// GET /api/users/:id
router.get("/:id", getUserById);

module.exports = router;
