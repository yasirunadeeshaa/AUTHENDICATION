const User = require('../models/User'); // Ensure correct path
const bcrypt = require('bcrypt');

exports.logout = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.getUserByEmail(email);
        if (!user) {
            return res.status(400).json({ message: "User not found!" });
        }

        // Update login status in the database
        await User.deleteUser(email);

        res.status(200).json({ message: "Logout successful!" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
        //Create a new promise
