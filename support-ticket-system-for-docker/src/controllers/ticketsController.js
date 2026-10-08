const pool = require("../config/db");

const getTickets = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                t.id,
                t.title,
                t.description,
                t.status,
                t.priority,
                creator.name AS created_by,
                agent.name AS assigned_to,
                t.created_at,
                t.updated_at
            FROM tickets t
            JOIN users creator
                ON t.created_by = creator.id
            LEFT JOIN users agent
                ON t.assigned_to = agent.id
            ORDER BY t.id
        `);

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching tickets:", error);

        res.status(500).json({
            error: "Failed to fetch tickets"
        });
    }
};

const getTicketById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            SELECT
                t.id,
                t.title,
                t.description,
                t.status,
                t.priority,
                creator.name AS created_by,
                agent.name AS assigned_to,
                t.created_at,
                t.updated_at
            FROM tickets t
            JOIN users creator
                ON t.created_by = creator.id
            LEFT JOIN users agent
                ON t.assigned_to = agent.id
            WHERE t.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Ticket not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching ticket:", error);

        res.status(500).json({
            error: "Failed to fetch ticket"
        });
    }
};

module.exports = {
    getTickets,
    getTicketById
};