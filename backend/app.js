require("dotenv").config();
const express = require("express");
const multer = require("multer");
// const { Storage } = require("@google-cloud/storage");
const cloudinary = require("cloudinary").v2;
// Cloudinary automatically configures itself using the CLOUDINARY_URL in your .env file.
const path = require("path");
const Document = require("./document");
const adminDoc = require("./admin");
const Contribution = require("./contrbution");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const http = require("http");
const socketIO = require("socket.io");
const axios = require("axios");
const uri = process.env.MONGO_URI;
const RequestCount = require("./requestCount");

const SAVE_USER_CNT = true;

const clientOptions = {
    serverApi: { version: "1", strict: true, deprecationErrors: true },
};
async function run() {
    try {
        // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
        await mongoose.connect(uri);
        await mongoose.connection.db.admin().command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );
    } finally {
        // Ensures that the client will close when you finish/error
    }
}
run().catch(console.dir);

// Create a new instance of the Google Cloud Storage class
// const storage = new Storage();
// const bucketName = process.env.BUCKET_NAME; // Update with your bucket name
// const bucket = storage.bucket(bucketName);

const app = express();
const port = process.env.PORT || 3333;

const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173", // Replace this with your frontend URL
        methods: ["GET", "POST", "PUT", "DELETE"],
    },
});

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173", // Replace this with your frontend URL
        methods: ["GET", "POST", "PUT", "DELETE"],
    })
);

// app.use(express.static(path.join(__dirname, "dist")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Set up Multer to handle file uploads in memory
const upload = multer({
    storage: multer.memoryStorage(), // Store file in memory before uploading
    limits: { fileSize: 50 * 1024 * 1024 },
});

// The middleware for authentication of admins
function authenticateJWT(req, res, next) {
    const token =
        req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
        return res.sendStatus(403); // Forbidden
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, username) => {
        if (err) {
            return res.sendStatus(403); // Forbidden
        }
        next();
    });
}

let requestCount = 0; // Initialize request count

// Function to reset the request count at midnight
function resetRequestCount() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0); // Set the time to midnight of the current day

    const timeToMidnight = midnight - now; // Calculate the time remaining until midnight

    setTimeout(async () => {
        // Before resetting, save the current request count to MongoDB
        if (SAVE_USER_CNT)
            try {
                const newRequestCount = new RequestCount({
                    date: new Date(), // Save the current date
                    count: requestCount, // Save the request count
                });
                await newRequestCount.save(); // Save the document to MongoDB
                console.log("Request count saved to MongoDB:", requestCount);
            } catch (error) {
                console.error("Error saving request count to MongoDB:", error);
            }

        requestCount = 0; // Reset the request count after saving
        console.log("Request count reset to 0 at midnight");

        // Set an interval to reset the request count every 24 hours
        setInterval(async () => {
            if (SAVE_USER_CNT)
                try {
                    const newRequestCount = new RequestCount({
                        date: new Date(), // Save the current date
                        count: requestCount, // Save the request count
                    });
                    await newRequestCount.save(); // Save the document to MongoDB
                    console.log(
                        "Request count saved to MongoDB:",
                        requestCount
                    );
                } catch (error) {
                    console.error(
                        "Error saving request count to MongoDB:",
                        error
                    );
                }

            requestCount = 0; // Reset the request count
            console.log("Request count reset to 0 every day at midnight");
        }, 24 * 60 * 60 * 1000); // Every 24 hours
    }, timeToMidnight);
}

resetRequestCount();

// GET endpoint to retrieve the request count
app.get("/server/request-count", async (req, res) => {
    const { date } = req.query;

    // If no date is provided, return the current request count
    if (!date) {
        return res.json({
            message: "Current request count",
            count: requestCount,
        });
    }

    try {
        // If date is provided, fetch the request count from MongoDB
        const requestedDate = new Date(date);
        const nextDay = new Date(requestedDate);
        nextDay.setDate(nextDay.getDate() + 1);

        // Query for the request count on the provided date
        const requestCountDoc = await RequestCount.findOne({
            date: {
                $gte: requestedDate, // Start of the day
                $lt: nextDay, // Before the next day starts
            },
        });

        // If no record is found for the date, return 0
        if (!requestCountDoc) {
            return res.json({
                message: `No request count found for the date: ${date}`,
                count: 0,
            });
        }

        // Return the request count for the provided date
        return res.json({
            message: `Request count for ${date}`,
            count: requestCountDoc.count,
        });
    } catch (error) {
        console.error("Error fetching request count from MongoDB:", error);
        return res.status(500).json({ error: "Server error" });
    }
});

app.get("/server/validate-token", (req, res) => {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
        return res.status(401).send("No token provided");
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send("Invalid token");
        }
        res.send("Token is valid");
    });
});

app.get("/server/files", async (req, res) => {
    const { branch, sem, subject, unit } = req.query;
    if (!branch || !sem) {
        return res.status(400).send("Please provide both branch and sem.");
    }

    requestCount++;
    try {
        // Check if 'branch' is an array (multiple branches) or a single branch
        const branches = Array.isArray(branch) ? branch : [branch];

        // Create the base search parameters for semester, subject, and unit
        const searchPara = { sem };
        if (subject) searchPara.subject = subject;
        if (unit) searchPara.unit = unit;
        console.log(branches);
        let files;

        // If multiple branches are provided, find files common across the branches
        if (branches.length > 1) {
            // Fetch files that are common to the provided branches
            const documents = await Document.find({
                branch: { $in: branches },
                ...searchPara,
            });
            console.log(documents);

            // Create a map to track file occurrences across branches
            const fileMap = new Map();

            documents.forEach((doc) => {
                if (fileMap.has(doc.fileUrl)) {
                    const fileData = fileMap.get(doc.fileUrl);
                    fileData.count += 1;
                    fileMap.set(doc.fileUrl, fileData);
                } else {
                    fileMap.set(doc.fileUrl, {
                        fileUrl: doc.fileUrl,
                        fileName: doc.fileName,
                        branch: doc.branch,
                        sem: doc.sem,
                        subject: doc.subject,
                        uploadedAt: doc.uploadedAt,
                        unit: doc.unit,
                        count: 1, // Initialize count to 1
                    });
                }
            });

            // Only keep files that are common to all branches
            files = Array.from(fileMap.values()).filter(
                (file) => file.count === branches.length
            );
        } else {
            // If only one branch is provided, use the current functionality
            files = await Document.find({ branch: branches[0], ...searchPara });
        }

        // Send the response
        res.status(200).json({
            message: `Files for branch(es): ${branches.join(
                ", "
            )}, sem: ${sem}`,
            files,
        });
    } catch (error) {
        console.error("Error fetching files from MongoDB:", error);
        res.status(500).send("Error retrieving files.");
    }
});

app.delete("/server/delete", authenticateJWT, async (req, res) => {
    const { fileUrl, branch } = req.body; // Accept both fileUrl and branch from the body

    if (!fileUrl || !branch) {
        return res
            .status(400)
            .json({ error: "File URL and branch are required" });
    }

    try {
        // Check if branch is an array or not
        const branches = Array.isArray(branch) ? branch : [branch];

        // Find all documents that reference this file URL
        const documents = await Document.find({ fileUrl });

        if (!documents.length) {
            return res.status(404).json({ error: "File not found" });
        }

        // Filter documents that match the branches to be deleted
        const documentsToDelete = documents.filter((doc) =>
            branches.includes(doc.branch)
        );

        if (!documentsToDelete.length) {
            return res.status(404).json({
                error: "No documents found for the specified branches",
            });
        }

        // Delete documents for the specified branches
        await Document.deleteMany({
            fileUrl,
            branch: { $in: branches },
        });
        console.log("Documents deleted from MongoDB for branches:", branches);

        // Check if there are any remaining documents that still reference the file
        const remainingDocuments = await Document.find({ fileUrl });

        // Only delete the file from GCP if no other branches reference it
        // Only delete the file from GCP/Cloudinary if no other branches reference it
        if (!remainingDocuments.length) {
            // Extract the filename with the extension (e.g., "my_notes.pdf")
            const fileNameWithExt = fileUrl.split("/").pop(); 
            // Extract the filename without the extension (e.g., "my_notes")
            const publicIdNoExt = fileNameWithExt.split(".")[0]; 

            // 1. Try to delete it as a raw document (REQUIRES the extension)
            await cloudinary.uploader.destroy(fileNameWithExt, { resource_type: "raw" });
            
            // 2. Try to delete it as an image (REQUIRES stripping the extension)
            await cloudinary.uploader.destroy(publicIdNoExt, { resource_type: "image" });
            
            console.log("File completely removed from Cloudinary");
        } else {
            console.log("File retained because other branches reference it.");
        }

        return res.status(200).json({
            message: "File deleted successfully for the specified branches",
        });
    } catch (error) {
        console.error("Error deleting file:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/server/subjects", async (req, res) => {
    const { branch, sem } = req.query;
    if (!branch || !sem) {
        return res.status(400).send("Please provide both branch and sem.");
    }

    try {
        const subjects = await Document.distinct("subject", { branch, sem });
        res.json({ subjects });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error" });
    }
});

app.post(
    "/server/admin_login",
    express.urlencoded({ extended: false }),
    async (req, res) => {
        const { username, password } = req.body;
        if (!username || !password) {
            res.sendStatus(400);
            return;
        }

        try {
            const user = await adminDoc.findOne({ username });
            if (!user) return res.status(401).send("Invalid credentials");
            if (!(await bcrypt.compare(password, user.password)))
                return res.status(401).send("Invalid credentials");

            console.log("validated");
            const token = jwt.sign({ username }, process.env.JWT_SECRET, {
                expiresIn: "1h",
            });
            res.json({ token });
        } catch {
            res.sendStatus(500);
        }
    }
);

app.get("/server/download", async (req, res) => {
    const { fileUrl, fileName } = req.query;
    try {
        // Use axios or any HTTP client to fetch the file
        const response = await axios({
            url: fileUrl,
            method: "GET",
            responseType: "stream", // Stream the file to the client
        });

        // Set the headers to force the download with the desired file name
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${fileName}"`
        );
        res.setHeader("Content-Type", response.headers["content-type"]);

        // Pipe the file stream to the response
        response.data.pipe(res);
    } catch (error) {
        console.error("Error fetching file:", error);
        res.status(500).send("Error downloading the file.");
    }
});

app.post("/server/addAdmin", async (req, res) => {
    const { admin_password: ADMIN_PASS, username, password } = req.body;
    if (!ADMIN_PASS) {
        res.status(403).send("Forbidden");
        return;
    }
    bcrypt
        .compare(ADMIN_PASS, process.env.PASSWORD)
        .then(async () => {
            if (!username || !password) {
                res.sendStatus(400);
                return;
            }
            try {
                const hashed = await bcrypt.hash(password, 10);
                const admin = new adminDoc({ username, password: hashed });
                await admin.save();
                return res.sendStatus(201);
            } catch {
                return res.sendStatus(500);
            }
        })
        .catch((err) => {
            return res.status(403).send("Forbidden");
        });
});

app.get("/server/pending-requests", authenticateJWT, async (req, res) => {
    try {
        const pendingRequests = await Contribution.find({ status: "pending" });
        res.status(200).json(pendingRequests);
    } catch (error) {
        console.error("Error fetching pending requests:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/server/approve", authenticateJWT, async (req, res) => {
    const { contributionId } = req.body; 

    if (!contributionId) {
        return res.status(400).json({ error: "Contribution ID is required" });
    }

    try {
        const pendingRequest = await Contribution.findById(contributionId);

        if (!pendingRequest) {
            return res.status(404).json({ error: "Pending request not found" });
        }

        const newDocument = new Document({
            fileUrl: pendingRequest.fileUrl,
            branch: pendingRequest.branch,
            sem: pendingRequest.sem,
            fileName: pendingRequest.filename, 
            subject: pendingRequest.subject,
            unit: pendingRequest.unit
        });

        await newDocument.save();
        await Contribution.findByIdAndDelete(contributionId);

        return res.status(200).json({ message: "File approved and moved to public documents!" });
    } catch (error) {
        console.error("Error approving request:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.delete("/server/reject", authenticateJWT, async (req, res) => {
    // We use the same contributionId payload as the approve route
    const { contributionId } = req.body; 

    if (!contributionId) {
        return res.status(400).json({ error: "Contribution ID is required" });
    }

    try {
        // 1. Find the pending request to get the file URL
        const pendingRequest = await Contribution.findById(contributionId);

        if (!pendingRequest) {
            return res.status(404).json({ error: "Pending request not found" });
        }

        // 2. Extract the Cloudinary Public ID from the URL
        const fileUrl = pendingRequest.fileUrl;
        const fileNameWithExt = fileUrl.split("/").pop(); 
        const publicId = fileNameWithExt.split(".")[0]; 

        // 3. Tell Cloudinary to delete the physical file to save your storage space
        await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
        console.log(`Cloudinary file ${publicId} deleted successfully.`);

        // 4. Delete the request from the MongoDB Contribution database
        await Contribution.findByIdAndDelete(contributionId);

        return res.status(200).json({ message: "Request rejected and file deleted permanently." });
    } catch (error) {
        console.error("Error rejecting request:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

io.use((socket, next) => {
    const token = socket.handshake.auth.token; // Get token from handshake
    if (!token) {
        return next(); // Proceed without setting `socket.username`
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return next(new Error("Authentication error")); // Invalid token
        }
        socket.username = decoded.username; // Attach username to socket
        next(); // Proceed if token is valid
    });
});

const activeUploads = {}; // To keep track of active upload streams

io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("uploadFileChunk", async (data) => {
        const {
            fileBuffer,
            branch,
            sem,
            subject,
            unit,
            fileName,
            offset,
            fileSize,
            id,
            type,
        } = data;

        if (
            !fileBuffer ||
            !branch ||
            !sem ||
            !subject ||
            !unit ||
            !fileName ||
            offset === undefined ||
            !fileSize ||
            !id ||
            !type
        ) {
            socket.emit("error", "Missing required metadata or file.");
            return;
        }

        if (type == "contribute" && !data.email) {
            socket.emit("error", "Missing email");
        }

        // Admin uploads: Require valid JWT authentication
        if (type === "upload" && !socket.username) {
            socket.emit("error", "Unauthorized admin upload.");
            return;
        }

       // If this is the first chunk, create the write stream
        if (!activeUploads[id]) {
            activeUploads[id] = {};
            
            // Create a Cloudinary upload stream
            const blobStream = cloudinary.uploader.upload_stream(
                { 
                    public_id: id,
                    resource_type: "auto", // Automatically detects if it's an image, PDF, or raw document
                    use_filename: true
                },
                async (error, result) => {
                    if (error) {
                        console.error("Cloudinary upload failed:", error);
                        // Make sure to emit error to the specific socket
                        io.to(activeUploads[id]?.socketId).emit("error", "Error finalizing upload to Cloudinary.");
                        return;
                    }

                    // Cloudinary success callback - THIS replaces your old `if (offset + buffer.length >= fileSize)` block
                    const publicUrl = result.secure_url;
                    let fileRecords = [];

                    if (type == "upload") {
                        const branches = Array.isArray(branch) ? branch : [branch];
                        for (let br of branches) {
                            fileRecords.push(
                                new Document({
                                    fileUrl: publicUrl, branch: br, sem, fileName, subject, unit,
                                })
                            );
                        }
                    } else {
                        const branches = Array.isArray(branch) ? branch : [branch];
                        for (let br of branches) {
                            fileRecords.push(
                                new Contribution({
                                    fileUrl: publicUrl, branch: br, sem, filename: fileName, subject, unit, email: data.email,
                                })
                            );
                        }
                    }

                    try {
                        for (let fr of fileRecords) {
                            await fr.save();
                        }
                        
                        io.to(activeUploads[id]?.socketId).emit("uploadSuccess", {
                            message: "File uploaded successfully!",
                            fileUrl: publicUrl,
                        });
                    } catch (err) {
                        console.error("Error saving file record:", err);
                        io.to(activeUploads[id]?.socketId).emit("error", "Error saving file metadata.");
                    } finally {
                        delete activeUploads[id];
                    }
                }
            );

            activeUploads[id].blobStream = blobStream;
            activeUploads[id].socketId = socket.id;
            activeUploads[id].offset = 0;
            activeUploads[id].fileName = fileName;
            activeUploads[id].fileSize = fileSize;
        }

        const buffer = Buffer.from(new Uint8Array(fileBuffer));
        activeUploads[id].offset = offset;
        activeUploads[id].blobStream.write(buffer, (err) => {
        if (err) {
            console.error("Error writing chunk:", err);
            socket.emit("error", "Error writing chunk.");
            return;
        }

        const uploadProgress = ((offset + buffer.length) / fileSize) * 100;
        socket.emit("uploadProgress", uploadProgress);

        if (offset + buffer.length >= fileSize) {
            // Just end the stream. 
            // Cloudinary's callback (at the top) will automatically handle the DB saving!
            try {
                activeUploads[id].blobStream.end(); 
            } catch (err) {
                socket.emit("error", err);
            }
        } else {
            socket.emit("chunkUploaded");
        }
    });
});
    // Handle client disconnection
    socket.on("disconnect", async () => {
        console.log("Client disconnected");
        const clientUploads = Object.keys(activeUploads).filter(
            (id) => activeUploads[id].socketId === socket.id
        );
        for (const id of clientUploads) {
            if (!activeUploads[id]) continue;

            try {
                await new Promise((resolve, reject) => {
                    activeUploads[id].blobStream.end((err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            } catch (err) {
                console.log(
                    `Failed to close the writestream for ${id}: ${err}`
                );
            }

            if (activeUploads[id].offset < activeUploads[id].fileSize) {
                try {
                    console.log(`Upload for file with id ${id} failed`);
                    // Use Cloudinary to destroy the incomplete file
                    await cloudinary.uploader.destroy(id, { resource_type: "raw" });
                    await cloudinary.uploader.destroy(id, { resource_type: "image" });
                    console.log("Incomplete file deleted from Cloudinary");
                } catch (err) {
                    console.log(
                        `Failed to delete the incomplete file with id ${id}: ${err}`
                    );
                }
            }

            delete activeUploads[id];
        }
    });
});

//serve static files if other routes does not match
// app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname, "dist", "index.html"));
// });

// Start the server with Socket.IO
server.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
