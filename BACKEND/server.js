// --- 1. Imports ---
require('dotenv').config(); // Loads .env file credentials
const express = require('express');
const { Pool } = require('pg');       // PostgreSQL driver
const bcrypt = require('bcryptjs');   // For hashing passwords
const jwt = require('jsonwebtoken');  // For JWT (auth)
const cors = require('cors');         // For allowing frontend access

// --- 2. Setup & Middleware ---
const app = express();
app.use(cors());                      // Allow all cross-origin requests
app.use(express.json());              // Parse incoming JSON bodies

// --- 3. Database Connection (D1, D2, D3 from DFD) ---
const pool = new Pool({
    connectionString: process.env.DB_CONNECT_STRING,
});

const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 3000;

// --- 4. API Endpoints (The "Arrows" from your DFD) ---

/*
 * @endpoint   POST /api/register
 * @desc       Matches "Sign-up" flow from DFD
 * Matches "signUp()" from Class Diagram
 */
app.post('/api/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // --- Hashing the password (from SRS) ---
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // --- Store in D1: User DB ---
        const newUser = await pool.query(
            "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
            [email, password_hash]
        );

        res.status(201).json(newUser.rows[0]);

    } catch (err) {
        console.error(err.message);
        if (err.code === '23505') { // Unique constraint violation
            return res.status(400).json({ message: 'Email already exists.' });
        }
        res.status(500).send('Server Error');
    }
});


/*
 * @endpoint   POST /api/login
 * @desc       Matches "Sign-up/Login" flow from DFD
 * Matches "login()" from Class Diagram
 */
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user in D1: User DB
        const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = userResult.rows[0];

        if (!user) {
            // Don't tell the attacker "user not found"
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // 2. Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // 3. Create JWT (as specified in SRS)
        const payload = {
            user: {
                id: user.id,
                email: user.email
            }
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        // 4. Send token back to frontend
        res.status(200).json({
            token: token,
            message: 'Login successful!'
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/*
 * TODO: Add a middleware function here to *check* the JWT on
 * protected routes (like posting a journal entry).
 * This middleware will be the "Authentication" arrow from your DFD.
 */


// --- 5. Start Server ---
app.listen(PORT, () => {
    console.log(`Backend server (Process 0) is running on http://localhost:${PORT}`);
});
