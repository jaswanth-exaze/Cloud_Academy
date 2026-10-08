
const pool = require("../config/db");

const getUsers = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, name, email, role, created_at FROM users ORDER BY id"
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching users:", error);

        res.status(500).json({
            error: "Failed to fetch users"
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching user:", error);

        res.status(500).json({
            error: "Failed to fetch user"
        });
    }
};

module.exports = {
    getUsers,
    getUserById
};
