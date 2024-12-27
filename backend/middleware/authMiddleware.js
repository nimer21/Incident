const Blacklist = require("../models/Blacklist");
const jwt = require('jsonwebtoken');

const authenticateToken = (requiredRoles) => { return async (req, res, next) => {
    //const token = req.headers.authorization?.split(" ")[1];
    const token = req.cookies.authToken; // Extract token from cookies
    console.error("Authentication token: ", token);

    if (!token) {
        return res.status(401).json({ message: "Access denied. Unauthorized: No token provided." });
    }

    try {
        // Check if the token is blacklisted
        const isBlacklisted = await Blacklist.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({ message: "Token is blacklisted. Please log in again." });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Validate the token
        req.user = decoded; // Attach user info to the request object
        //console.log("Authentication decoded: ", decoded);
        /**
         * Authentication decoded:  {
            userId: '6746bd73ebbabe7c6b1985d4',
            role: 'super_admin',
            iat: 1733222532,
            exp: 1733226132
            }
         */

        //Example: Check if user has 'admin' role
        if ( !requiredRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied. Insufficient permissions." });
        }

        next();
    } catch (error) {
        console.error("Authentication error: ", error);
        res.status(403).json({ message: "Invalid or expired token" });
    }
};
};

module.exports = authenticateToken;
