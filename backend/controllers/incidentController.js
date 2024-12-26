const Blacklist = require('../models/Blacklist');
const Incident = require('../models/Incident');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");

const generateCaseReference = () => {
    // Generate a short alphanumeric reference (e.g., 4dbdf)
    return Math.random().toString(36).substring(2, 7);
};
// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email provider
    //host: "smtp.ethereal.email",
    //port: 587,
    //secure: false, // true for port 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

exports.reportIncident = async (req, res) => {
    try {
        const incidentData = req.body;
        console.log("req.body: ", req.body);
        if (req.file) {
            incidentData.fileAttachment = req.file.path; // Attach file path
        }
        // Generate a case reference
        incidentData.caseReference = generateCaseReference(); // Generate case reference
        const incident = new Incident(incidentData);
        await incident.save();

         // Fetch case managers
        const caseManagers = await User.find({
        role: { $in: ['asset_safeguarding', 'child_safeguarding', 'youth_adult', 'data_breach'] },
            });
        // Send email notification to admin
        /*const adminEmail = process.env.ADMIN_EMAIL;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: adminEmail,
            subject: "New Incident Reported",
            text: `A new incident has been reported: ${incidentData.title}. Case Reference: ${incidentData.caseReference}`,
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email:", error);
            } else {
                console.log("Email sent:", info.response);
            }
        });*/
        // Send email notifications
        //caseManagers.forEach((manager) => {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          //to: manager.email,
          to: "nimerelsayed@hotmail.com",
          subject: `New Incident Reported: ${req.body.subject}`,
          //text: `Hello ${manager.username},\n\nA new incident has been reported with the following details:\n\nTitle: ${req.body.subject}\nDescription: ${req.body.incidentDescription}\nLocation: ${req.body.programLocation}\n\nPlease login to review the incident.`,
          text: `Hello ${"Tiger"},\n\nA new incident has been reported with the following details:\n\nTitle: ${req.body.subject}\nDescription: ${req.body.incidentDescription}\nLocation: ${req.body.programLocation}\n\nPlease login to review the incident.`,
        };
  
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending email:', error);
          } else {
            console.log(`Email sent to ${"nimerelsayed@hotmail.com"}:`, info.response); //manager.email
          }
        });
      //});
  
      // Update incident's notifiedManagers field
      incident.notifiedManagers = true;
        await incident.save();

        // Link the incident to the user's account
        await User.findByIdAndUpdate(
            incidentData.user,
            { $push: { incidents: incident._id } }, // Add the incident to the user's list //savedIncident
            { new: true }
        );

        /*if (incidentData.userId) {
            // Link the incident to the user's account
            console.log(" if (incidentData.userId) => ",incidentData);
            await User.findByIdAndUpdate(incidentData.userId, { $push: { incidents: incident._id } });//{ new: true }
        }*/

        res.status(201).json({ message: 'Incident reported successfully!',
            caseReference: incident.caseReference, incedent_id: incident._id });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
};

// Update Severity
exports.updateIncidentSeverity = async (req, res) => {
    try {
        const { severity } = req.body;
    const validSeverities = ["Low", "Medium", "High"];
    if (!validSeverities.includes(severity)) {
      return res.status(400).json({ message: "Invalid severity level." });
    }

    const updatedIncident = await Incident.findByIdAndUpdate(
      req.params.id,
      { severity },
      { new: true }
    );
    res.status(200).json(updatedIncident);        
    } catch (error) {
        res.status(500).json({ message: "Error updating severity.", error });        
    }
};

exports.addCommentsIncident = async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;
    try {
    // const { id } = req.params;
    // // const { text, author } = req.body;
    // // const comment = { text, author };
    // const { text, author } = req.body;

    // Extract user details from the request (assumes middleware sets req.user)
    const user = req.user || {};

    const author = user?.role === "super_admin" 
    ? "Admin"
    : user?.role === "user" 
        ? "User"
        : "Anonymous";

    // Update the incident with the new comment
    const updatedIncident = await Incident.findByIdAndUpdate(
    //   req.params.id,
    id,
    //   { $push: { comments: comment } },
    { $push: { comments: { text, author, date: new Date() } } },
      { new: true } // Return the updated document
    );
    if (!updatedIncident) {
        return res.status(404).json({ message: "Incident not found" });
      }

    res.status(200).json({updatedIncident, ok: true}); // Include `ok: true` for clarity
    } catch (error) {
        res.status(500).json({ error: "Failed to add comment" });
    }
};
exports.fileUploadIncident = async (req, res) => {
    try {
    const { incidentId } = req.body;
    const filePath = req.file.path;

    // Save file path to the incident in MongoDB
    const incident = await Incident.findById(incidentId);
    if (!incident) return res.status(404).send("Incident not found");

    incident.fileAttachment.push(filePath);
    await incident.save();

    // Ensure `fileAttachment` is an array and push the new file path
    if (!Array.isArray(incident.fileAttachment)) {
        incident.fileAttachment = []; // Initialize as an empty array if not already
    }

    res.status(200).send({ message: "File uploaded successfully", filePath });
               
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).send("Server error");        
    }
};

exports.registerUser = async (req, res) => {
    try {
        const { username, password, incidents  } = req.body;

        // Validate that `incidents` is an array
        if (!Array.isArray(incidents)) {
            return res.status(400).json({ error: "Incidents must be an array." });
        }

        if (!username || !password) {
            return res.status(421).json({ error: 'Username and password are required' });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(422).json({ error: 'Username already exists' });
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
        await newUser.save();
        // Update the incident to link it to the new user
        await Incident.updateMany(
            { _id: { $in: incidents } },
            { $set: { user: newUser._id } }
        );
        res.status(201).json({ message: 'Account created successfully!',});
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
};

exports.loginUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        // Check if the user exists // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Validate the password // Check if the password is correct
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate a JWT token (optional but recommended)
        //const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { // Include role in the token payload
            expiresIn: "1h",
        });

        //Cookies will only be sent over HTTPS, cannot be accessed via JavaScript, and will work only with the same domain.
        // Set token as a secure, HTTP-only cookie
        res.cookie("authToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" && req.secure, // Adjust for local testing // Enable in production
            sameSite: "strict",
            maxAge: 3600000, // 1 hour
        });

        // Return success response
        res.status(200).json({
            message: "Login successful 😎",
            //userId: user._id,
            token,
            //role: user.role // Include role in response
            user: user,
        });       

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.logoutUser = async (req, res) => {
    try {
        //const token = req.headers.authorization?.split(" ")[1]; // Extract token from Bearer header
        // Extract token from cookies
        const token = req.cookies.authToken;

        if (!token) {
            return res.status(400).json({ message: "Token not provided" });
        }

        // Add the token to a blacklist to prevent reuse
        const existingBlacklistEntry = await Blacklist.findOne({ token });
        
        if (!existingBlacklistEntry) {
            const blacklistToken = new Blacklist({ token });
            await blacklistToken.save();
            //console.log("Token blacklisted successfully.",token);
        } else {
            //console.log("Token is already blacklisted.",token);
        }

        // Decode token to validate or log user info (optional)
        const decoded = jwt.decode(token);

        if (!decoded) {
            return res.status(401).json({ message: "Invalid token" });
        }

        // Add the token to a blacklist to prevent reuse
        //const blacklistToken = new Blacklist({ token });
        //await blacklistToken.save();
        //await Blacklist.create({ token });
4
        //res.clearCookie("authToken");
        // Clear the cookie that holds the token
        res.clearCookie("authToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        
        res.status(200).json({ message: "Logout successful 👋" });      

    } catch (error) {
        console.error("Logout error: ", error);
        res.status(500).json({ message: "Internal server error" });        
    }
};

exports.authenticate = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password"); // Exclude password
        //const user = req.user; // `req.user` is populated by the `authenticate` middleware
        if (!user) {
            return res.status(404).json({ error: "User not found" });
          }
        res.status(200).json({ authenticated: true, user }); 

    } catch (error) {
        console.error("Auth check failed:", error);
        res.status(500).json({ authenticated: false, message: "Server error" });  
    }
};

// Endpoint to fetch all incidents
exports.getIncidents = async (req, res) => {
    //const { role, category, search, page = 1, limit = 10 } = req.query;
    try {
        const { search = "", category = "", page = 1, limit = 10 } = req.query;
         // You can filter by user if authentication is implemented
         const query = {};
         // Access role from req.user
        const role = req.user.role;

        if (role !== "super_admin") {
            query.category = role.replace("_", " "); // Map role to category
        }

        if (category) {
            query.category = category;
        }
        // Filter incidents based on the role
        if (role === "asset_safeguarding") {
            query.category = "Asset Safeguarding";
          } else if (role === "child_safeguarding") {
            query.category = "Child Safeguarding";
          } else if (role === "youth_adult") {
            query.category = "Youth Adult";
          } else if (role === "data_breach") {
            query.category = "Data Breach";
          }

        if (search) {
            query.$or = [
                { subject: new RegExp(search, "i") },
                { caseReference: new RegExp(search, "i") },
            ];
        }

        // sort in descending (-1) order by length
        const sort = { createdAt: -1 };

        const incidents = await Incident.find(query)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(Number(limit));
         //const incidents = await Incident.find().limit(10);

         const total = await Incident.countDocuments(query);
         
        res.status(200).json({
            incidents,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
        });

    } catch (error) {
        console.error("Error fetching incidents:", error.message);
        res.status(500).json({ error: "Failed to fetch incidents" });       
    }
};

// Fetch full details of a specific incident
exports.getIncidentById = async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id);
        if (!incident) {
            return res.status(404).json({ error: "Incident not found" });
        }
        res.json(incident);

    } catch (error) {
        res.status(500).json({ error: "Failed to fetch incident details" });
    }
};

exports.getIncidentByUser = async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).send({ message: "User ID is required" });
    }
    try {
        // Find the user to ensure they exist
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Retrieve incidents linked to the user
        const incidents = await Incident.find({ _id: { $in: user.incidents } });

        res.status(200).json(incidents);

    } catch (error) {
        console.error('Error fetching user incidents:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
// GET incidents by role
exports.getIncidentsByRole  = async (req, res) => {
    try {
        const { search = "", page = 1, limit = 10 } = req.query;
        let filter = {};

        if (search) {
            filter.$or = [
                { subject: new RegExp(search, "i") },
                { caseReference: new RegExp(search, "i") },
            ];
        }

        // sort in descending (-1) order by length
        const sort = { createdAt: -1 };

        const { role } = req.user; // Assume `req.user` contains the authenticated user details
    
        if (!role) {
          return res.status(400).json({ error: "User role is required" });
        }
        
        // Filter incidents based on the role
        if (role === "asset_safeguarding") {
          filter.category = "Asset Safeguarding";
        } else if (role === "child_safeguarding") {
          filter.category = "Child Safeguarding";
        } else if (role === "youth_adult") {
          filter.category = "Youth Adult";
        } else if (role === "data_breach") {
          filter.category = "Data Breach";
        }

        const total = await Incident.countDocuments(filter);        
    
        const incidents = await Incident.find(filter)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(Number(limit));

            res.status(200).json({
                incidents,
                total,
                page: Number(page),
                pages: Math.ceil(total / limit),
            });
      } catch (error) {
        console.error("Error fetching incidents by role:", error);
        res.status(500).json({ error: "Server error" });
      }
};

exports.createSystemUsers = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
    
        if (!['asset_safeguarding', 'child_safeguarding', 'youth_adult', 'data_breach'].includes(role)) {
          return res.status(400).send('Invalid role');
        }

        if (!username || !password || !email) {
            return res.status(421).json({ error: 'Username, email and password are required' });
        }

        //const existingUser = await User.findOne({ email });
        const existingUser = await User.findOne({
            $or: [
                { email: email },
                { username: username }
            ]
        });
        if (existingUser) {
            return res.status(422).json({ error: 'Username/Email already exists' });
        }
    
        const newUser = new User({ username, email, password, role });
        await newUser.save();
        res.status(201).send('User created successfully');
      } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Server error');
      }
};
