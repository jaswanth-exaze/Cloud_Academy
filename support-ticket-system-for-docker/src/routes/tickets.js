const express = require("express");

const {
    getTickets,
    getTicketById
} = require("../controllers/ticketsController");

const router = express.Router();

// GET /api/tickets
router.get("/", getTickets);

// GET /api/tickets/:id
router.get("/:id", getTicketById);

module.exports = router;