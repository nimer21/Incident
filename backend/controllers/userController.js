const Blacklist = require('../models/Blacklist');
const Incident = require('../models/Incident');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


/**
 * Registers a new user with the provided username, password, and associated incidents.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
exports.registerUser = async (req, res) => {
    try {
        const { username, password, incidents  } = req.body;

        // Validate that `incidents` is an array
        if (!Array.isArray(incidents)) {
            return res.status(400).json({ error: "Incidents must be an array." });
        }

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        //******************************Hashed In DB********************************************* */
         // Hash the password (use a library like bcrypt)
         /*const hashedPassword = bcrypt.hashSync(password, 10);

         const newUser = new User({
            username,
            password: hashedPassword,
        });*/
        //***************************************************************************

        const newUser = new User({ username, password, incidents: [incidents], // Link the incident during registration // Store as an array
             });
             console.log("newUser=> ",newUser);
        await newUser.save();
        // Update the incident to link it to the new user
        await Incident.updateMany(
            { _id: { $in: incidents } },
            { $set: { user: newUser._id } }
        );
        res.status(201).json({ message: 'User registered successfully', userId: newUser._id, username: newUser.username,});
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
};

exports.loginUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        // Check if the user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Validate the password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate a JWT token (optional but recommended)
        //const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { // Include role in the token payload
            expiresIn: "1d",
        });

        res.status(200).json({
            message: "Login successful",
            userId: user._id,
            token,
            role: user.role // Include role in response
        });       

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.logoutUser = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; // Extract token from Bearer header

        if (!token) {
            return res.status(400).json({ message: "Token not provided" });
        }

        // Decode token to validate or log user info (optional)
        const decoded = jwt.decode(token);

        if (!decoded) {
            return res.status(401).json({ message: "Invalid token" });
        }

        // Add the token to a blacklist to prevent reuse
        const blacklistToken = new Blacklist({ token });
        await blacklistToken.save();

        res.status(200).json({ message: "Logout successful" });      

    } catch (error) {
        console.error("Logout error: ", error);
        res.status(500).json({ message: "Internal server error" });        
    }
};

