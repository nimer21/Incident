const Blacklist = require('../models/Blacklist');
const Incident = require('../models/Incident');
const User = require('../models/User');
const AuditLog = require("../models/AuditLog"); // Import Audit Log Model
const mongoose = require("mongoose"); // ✅ Import mongoose
const Task = require('../models/Task');
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

  const categoryToRoleMap = {
    'Asset Safeguarding': 'asset_safeguarding',
    'Child Safeguarding': 'child_safeguarding',
    'Youth Adult': 'youth_adult',
    'Data Breach': 'data_breach',
    'Conflict of Interest': 'super_admin',
};


exports.reportIncident = async (req, res) => {
    try {
      console.log("req.body: ", req.body);
      console.log("req.user?: ", req.user);

      const incidentData = req.body;

      // ✅ Handle file attachments (if any)
      if (req.file) {
        incidentData.fileAttachment = req.file.path; // Attach file path
      }
      // ✅ Generate a case reference
      incidentData.caseReference = generateCaseReference(); // Generate case reference

      // ✅ Determine user details (if authenticated)
    let userId = null;
    let reportedBy = "Anonymous"; // Default for anonymous users

    if (req.user) {  // ✅ Capture authenticated user data if available
      userId = req.user._id;
      reportedBy = req.user.role || "Registered User";
    }
    // ✅ Save the incident to the database
      const incident = new Incident(incidentData);
      await incident.save();

      let recipientEmails = [];

      // Case routing logic:
      if (req.body.category === "Conflict of Interest") {
        // Only send to Super Admins
        const superAdmins = await User.find({ role: "super_admin" });
        recipientEmails = superAdmins.map(admin => admin.email);
    } else {
        // Send to Case Managers for other cases
        const caseManagers = await User.find({
            role: { 
                $in: ["asset_safeguarding", "child_safeguarding", "youth_adult", "data_breach"]
            }
        });
        recipientEmails = caseManagers.map(manager => manager.email);
    }

      /*******************************************************************
         // Fetch case managers
        const caseManagers = await User.find({
        role: { $in: ['asset_safeguarding', 'child_safeguarding', 'youth_adult', 'data_breach'] },
            });

        // Extract emails from the case managers
        const emails = caseManagers.map(manager => manager.email).filter(email => email); // Ensure no undefined emails
        // if (!emails.length) {
        //     throw new Error("No case managers found");
        // }
        ********************************************************************/

      // Map the category to the corresponding role
      const categoryRole = categoryToRoleMap[req.body.category];
      if (!categoryRole) {
        return res.status(400).json({ error: "Invalid category specified" });
      }

      // Find the super admin
      const superAdmin = await User.findOne({ role: "super_admin" });

      /*
        let mapedRole = null;
        // Filter incidents based on the role
        if (req.body.category === "Asset Safeguarding") {
            mapedRole = "asset_safeguarding";
          } else if (req.body.category === "Child Safeguarding") {
            mapedRole = "child_safeguarding";
          } else if (req.body.category === "Youth Adult") {
            mapedRole = "youth_adult";
          } else if (req.body.category === "Data Breach") {
            mapedRole = "data_breach";
          }
            */

      // Find the case manager for the selected category
      // Find the case manager for the mapped role
      const caseManager = await User.findOne({
        role: categoryRole, // Category should map to role names like 'asset_safeguarding'
      });

      // Combine emails of super admin and case manager
      const emails = [superAdmin?.email, caseManager?.email].filter(Boolean);

      //****************************************************************** */
      // // Create tasks for case managers
      // const tasks = caseManagers.map(manager => ({
      //     title: `Assign Task for Incident ${incidentData.caseReference}`,
      //     assignedTo: manager._id,
      //     deadline: incidentData.deadline,
      //     incident: incident._id,
      // }));

      //await Task.insertMany(tasks);
      //******************************************************************
      // Send email notification to admin
      // if (emails.length > 0) {
      if (recipientEmails.length > 0) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: emails, // Use the array of emails
          subject: `New ${req.body.category} Incident Reported: ${req.body.subject}`,
          text: `Hello,\n\nA new incident has been reported with the following details:\n\nTitle: ${req.body.subject}\nDescription: ${req.body.incidentDescription}\nLocation: ${req.body.programLocation}\n\nPlease login to review the incident.`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email:", error);
            // Optionally log or track the error for later retries
          } else {
            console.log(`Email sent to ${emails.join(", ")}:`, info.response);

            // Mark the incident as notified
            // Use an async function to handle saving the incident
            (async () => {
              try {
                // Update incident's notifiedManagers field
                // Mark incident as notified
                incident.notifiedManagers = true;
                await incident.save(); // Save the updated incident only after successful email delivery
                console.log("Incident marked as notified.");
                //await logAudit(incident._id, req.user.userId, req.user.role, "Incident Created", `Case Reference: ${incident.caseReference}`);
                
                // await logAudit(
                //   incident._id,
                //   req.user?.userId || null,  // ✅ Prevents crash if req.user is undefined
                //   req.user?.role || "Unknown",
                //   "Incident Created",
                //   `Case Reference: ${incident.caseReference}`
                // );

                // ✅ Log audit only if user is authenticated
                if (userId) {
                  await logAudit(
                    incident._id,
                    userId,
                    reportedBy,
                    "Incident Created",
                    `Case Reference: ${incident.caseReference}`
                  );
                }
                
                // Update the incident's status to "In Progress" if it's not already in progress
                incident.status = "In Progress";
                await incident.save();
              } catch (saveError) {
                console.error(
                  "Error saving incident notification status:",
                  saveError
                );
              }
            })();
          }
        });
      }
      // Link the incident to the user's account
      await User.findByIdAndUpdate(
        incidentData.user,
        { $push: { incidents: incident._id } }, // Add the incident to the user's list //savedIncident
        { new: true }
      );

      // if (incidentData.userId) {
      //       // Link the incident to the user's account
      //       console.log(" if (incidentData.userId) => ",incidentData);
      //       await User.findByIdAndUpdate(incidentData.userId, { $push: { incidents: incident._id } });//{ new: true }
      //   }

      res
        .status(201)
        .json({
          message: "Incident reported successfully!",
          caseReference: incident.caseReference,
          incedent_id: incident._id,
        });
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
    await logAudit(req.params.id, req.user.userId, req.user.role, "Severity Updated", `Changed to: ${severity}`);    
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
    : ["asset_safeguarding", "child_safeguarding", "youth_adult", "data_breach"].includes(user?.role)
      ? "Case Manager"
      : "Anonymous";

    // Update the incident with the new comment
    const updatedIncident = await Incident.findByIdAndUpdate(
    //   req.params.id,
    id,
    //   { $push: { comments: comment } },
    { 
      $push: { comments: { text, author, date: new Date() } },
      $set: { commentViewedBy: [] } // Clears commentViewedBy to reset notifications
     },
      { new: true } // Return the updated document
    );
    if (!updatedIncident) {
        return res.status(404).json({ message: "Incident not found" });
      }

    await logAudit(id, req.user.userId, req.user.role, "Comment Added", `Comment: "${text}" by ${author}`);
    res.status(200).json({updatedIncident, ok: true}); // Include `ok: true` for clarity
    } catch (error) {
        res.status(500).json({ error: "Failed to add comment" });
    }
};

exports.clearCommentNotification = async (req, res) => {
  try {
        const { id } = req.params;
        await Incident.findByIdAndUpdate(id, { hasNewComment: false });
        res.status(200).json({ message: "Notification cleared" });
  } catch (error) {
    console.error("Error clearing notification:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.markCommentsAsViewed = async (req, res) => {
  try {
    const { incidentId } = req.params;
    const userId = req.user.userId;
    //console.log("Marking comments as viewed..."+incidentId);

    const incident = await Incident.findById(incidentId);

    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    // Check if user has already viewed the comments
    const alreadyViewed = incident.commentViewedBy.some(
      (view) => view.userId.toString() === userId.toString()
    );

    if (!alreadyViewed) {
      incident.commentViewedBy.push({ userId, viewedAt: new Date() });
      await incident.save();
    }

    res.status(200).json({ message: "Comments marked as viewed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

        // Get all indexes on the collection
    const indexes = await User.collection.getIndexes();
    //const indexExists = indexes.some(index => index.name === 'email_1');
    const indexExists = Object.keys(indexes).some((indexName) => indexName === 'email_1');

    if (indexExists) {
      // Drop the index
      await User.collection.dropIndex('email_1');
      console.log('Index email_1 dropped successfully.');
      //await User.collection.createIndex({ email: 1 }, { unique: true, sparse: true });
    } else {
      console.log('Index email_1 does not exist.');
      //console.log("Index 'email_1' does not exist. Creating index...");
      //await User.collection.createIndex({ email: 1 }, { unique: true, sparse: true });
      //console.log("Index email_1 created successfully.");
    }    


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
            sameSite: "strict", // Prevent CSRF
            //sameSite: "lax", // or "none" if you need cross-origin support
            maxAge: 3600000, // 1 hour
            //maxAge: 24 * 60 * 60 * 1000, // 1 day expiry
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
        // Ensure the token is not already in the blacklist
        const existingBlacklistEntry = await Blacklist.findOne({ token });
        
        if (!existingBlacklistEntry) {
            await Blacklist.create({ token });
            //const blacklistToken = new Blacklist({ token });
            // Save only if the token does not already exist
            //await blacklistToken.save();
            //console.log("Token blacklisted successfully.",token);
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
        if (error.code === 11000) {
            // Handle duplicate key errors gracefully
            console.error("Token is already blacklisted:", error);
            return res.status(200).json({ message: "Token already blacklisted, logout successful 👋" });
        }
        console.error("Logout error: ", error);
        res.status(500).json({ message: "Internal server error" });        
    }
};

exports.fetchUsers = async (req, res) => {
    try {
        // Fetch all users from the database, excluding password and version fields
        const users = await User.find({ role: { $ne: 'user' } }, '-password -__v'); // Exclude password and version fields

        // Check if users were found
        if (!users.length) {
            return res.status(404).json({ message: "No users found" });
        }

        // Format the response to include name and role
        const formattedUsers = users.map(user => ({
            name: user.username, // Assuming 'username' is the field for user's name
            role: user.role      // Assuming 'role' is a field that indicates user's role
        }));

        // Send the formatted list of users as a response
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Server error" });
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

// Endpoint to fetch all incidents with Tasks
exports.getIncidents = async (req, res) => {
    //const { role, category, search, page = 1, limit = 10 } = req.query;
    try {
        const { search = "", category = "", page = 1, limit = 10 } = req.query;
        const userId = req.user.userId; // Assuming you have user info in request
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
    
    // ✅ Count new/unread incidents for this user
    const newReports = await Incident.countDocuments({
      $and: [
        query,
        {
          $or: [
            { viewedBy: { $size: 0 } },
            { viewedBy: { $not: { $elemMatch: { userId: userId } } } }
          ]
        }
      ]
    });

    // ✅ Count new/unread comments for this user
const newComments = await Incident.countDocuments({
  $and: [
    query,
    {
      $or: [
        { commentViewedBy: { $size: 0 } },
        { commentViewedBy: { $not: { $elemMatch: { userId: userId } } } }
      ]
    }
  ]
});

    // Count incidents with new comments
    //const activeReminders = await Incident.countDocuments({ hasNewComment: true });


        const incidents = await Incident.find(query)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(Number(limit));
            //.lean();
         //const incidents = await Incident.find().limit(10);

         // Count total incidents
         const total = await Incident.countDocuments(query);

         // Fetch tasks related to these incidents
    const tasks = await Task.find({ incidentId: { $in: incidents.map((i) => i._id) } })
    .populate('assignedTo', 'username') // Populate `assignedTo` with `username`
    .populate('assignedBy', 'username'); // Populate `assignedBy` with `username`

  // Map tasks to their respective incidents
  const incidentsWithTasks = incidents.map((incident) => ({
    ...incident.toObject(),
    tasks: tasks.filter((task) => task.incidentId.toString() === incident._id.toString()),
  }));
         
        res.status(200).json({
            incidentsWithTasks,
            total,
            newReports,
            //activeReminders,
            newComments, // ✅ Add this to Active Reminders
            page: Number(page),
            pages: Math.ceil(total / limit),
        });

    } catch (error) {
        console.error("Error fetching incidents:", error.message);
        res.status(500).json({ error: "Failed to fetch incidents" });       
    }
};

// 3. Add an endpoint to mark incident as viewed (controllers/incidentController.js)
// Now, this function only marks the "Incident" as read.
exports.markIncidentAsViewed = async (req, res) => {
  try {
    const { incidentId } = req.params;
    const userId = req.user.userId;

    const incident = await Incident.findById(incidentId);

    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }
    
    // Check if user has already viewed this incident
    const alreadyViewed = incident?.viewedBy?.some(
      view => view.userId.toString() === userId.toString()
    );

    if (!alreadyViewed) {
      incident?.viewedBy?.push({ userId, viewedAt: new Date() });
      await incident?.save();
    }

    res.status(200).json({ message: 'Incident marked as viewed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

        // Force an error for testing
        // throw new Error("Forced error for testing"); // Uncomment this line to test the catch block

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

// Assign Task
exports.assignIncidentTasks = async (req, res) => {
  const { incidentId } = req.params;
  const { title, description, assignedTo, deadline, accessLevel } = req.body;

  try {
    if (!title ||!assignedTo ||!deadline ||!accessLevel) {
      return res.status(422).json({ error: "Title, assignedTo, deadline, and access level are required" });
    }

    // Fetch user details based on assignedBy (userId)
    const assigningUser = await User.findById(req.user.userId); // Assuming userId is stored in req.user
    if (!assigningUser) {
        return res.status(404).json({ message: "User (assigningUser) not found" });
    }
    // Fetch user details based on assignedTo (userId)
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
        return res.status(404).json({ message: "User (assignedUser) not found" });
    }
    
    const incident = await Incident.findById(incidentId);
    if (!incident) return res.status(404).json({ message: "Incident not found" });

    const task = new Task({
        title,
        description,
        assignedTo,
        assignedBy: req.user.userId,
        incidentId,
        deadline: new Date(deadline),
        accessLevel,
      });
    //incident.tasks.push(task);
    await task.save();

    await logAudit(incidentId, req.user.userId, req.user.role, "Task Assigned", `Assigned to: ${assignedUser.username}`);

    res.status(201).json({ message: "Task assigned successfully", task, assignedByName: assigningUser.username, assignedToName: assignedUser.username });
  } catch (error) {
    console.error("Error assigning task:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateEscalationStatus  = async (req, res) => {
    const { incidentId } = req.params;
    const { status } = req.body; // New escalation status
  
    try {
      const incident = await Incident.findById(incidentId);
      if (!incident) return res.status(404).json({ message: "Incident not found" });
  
      incident.escalationStatus = status;
      await incident.save();
  
      res.status(200).json({ message: "Escalation status updated successfully", incident });
    } catch (error) {
      console.error("Error escalating incident:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  exports.addUpdateaccessLevels  = async (req, res) => {
    const { incidentId } = req.params;
    const { userId, accessLevel, grantedBy } = req.body;
  
    try {
      const incident = await Incident.findById(incidentId);
      if (!incident) return res.status(404).json({ message: "Incident not found" });
  
      incident.accessTracking.push({ userId, accessLevel, grantedBy });
      await incident.save();
  
      res.status(200).json({ message: "Access updated successfully", incident });
    } catch (error) {
      console.error("Error updating access:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  exports.fetchAssignedTasks = async (req, res) => {
    try {
      const { userId } = req.user; // Extract logged-in user ID

      const tasks = await Task.find({ assignedTo: userId })
        .populate('incidentId', 'caseReference subject') // Populate related incident details
        .populate('assignedBy', 'username'); // Populate `assignedBy` details

      res.status(200).json(tasks);
    } catch (error) {
      console.error('Error fetching assigned tasks:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  exports.updateTaskStatus = async (req, res) => {
    try {
      const { taskId } = req.params;
      const { status, feedback, deadline } = req.body;
  
      const task = await Task.findById(taskId);
      if (!task) return res.status(404).json({ message: 'Task not found' });
  
      // Update status and feedback
      task.status = status || task.status;
      task.feedback = feedback || task.feedback;
      task.deadline = deadline || task.deadline;
      await task.save();
  
      res.status(200).json({ message: 'Task updated successfully', task });
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  const logAudit = async (incidentId, userId, role, action, details = "") => {
  try {
    if (!incidentId) {
      console.error("Audit logging failed: Missing incidentId");
      return;
    }
    const incident = await Incident.findById(incidentId);
    if (!incident) return; // Ensure incident exists
    // Handle anonymous users (no userId)
    const performedBy = userId ? new mongoose.Types.ObjectId(userId) : null;
    const performedByRole = role || "Anonymous";

    const auditEntry = new AuditLog({
      incidentId,
      caseReference: incident.caseReference, // Store case reference
      performedBy, // Can be null for anonymous users
      performedByRole: performedByRole,
      action,
      details,
      timestamp: new Date(),
    });

    await auditEntry.save();
  } catch (error) {
    console.error("Error logging audit:", error);
  }
};

exports.getIncidentAuditLogs = async (req, res) => {
  try {
    const { incidentId } = req.params;
    const logs = await AuditLog.find({ incidentId })
      .populate("performedBy", "username") // Populate username
      .sort({ timestamp: -1 }); // Sort by newest first

    res.status(200).json(logs);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ message: "Server error" });
  }
};


  
  
  
  
