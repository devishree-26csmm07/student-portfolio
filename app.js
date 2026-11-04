require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Create a folder for uploaded profile pictures
const uploadPath = path.join(__dirname, "public", "uploads");
fs.mkdirSync(uploadPath, { recursive: true });

// Profile picture upload settings
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const extension = path.extname(file.originalname).toLowerCase();
        cb(null, Date.now() + extension);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Please upload a JPG, PNG, GIF or WEBP image."));
        }
    }
});

// Open login page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log("MongoDB Error:", err));

// User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    phone: String,
    password: String
});

const User = mongoose.model("User", userSchema);

// Registration
app.post("/register", async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.json({ message: "Account created successfully" });
    } catch (err) {
        res.status(400).json({ message: "Registration failed. Email may already exist." });
    }
});

// Login
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email, password: password });

        if (user) {
            res.json({ message: "Login successful" });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (err) {
        res.status(500).json({ message: "Login failed" });
    }
});

// Student Schema
const studentSchema = new mongoose.Schema({
    name: String,
    course: String,
    skills: String,
    achievement: String,
    photo: String
});

const Student = mongoose.model("Student", studentSchema);

// Add student details with profile picture
app.post("/addStudent", upload.single("photo"), async (req, res) => {
    try {
        const student = new Student({
            name: req.body.name,
            course: req.body.course,
            skills: req.body.skills,
            achievement: req.body.achievement,
            photo: req.file ? "/uploads/" + req.file.filename : ""
        });

        await student.save();
        res.json({ message: "Student details added successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message || "Unable to add student details" });
    }
});

// View student details
app.get("/students", async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: "Unable to view student details" });
    }
});

// Update student details (profile picture is optional)
app.put("/updateStudent/:id", upload.single("photo"), async (req, res) => {
    try {
        const updates = {
            name: req.body.name,
            course: req.body.course,
            skills: req.body.skills,
            achievement: req.body.achievement
        };

        if (req.file) {
            updates.photo = "/uploads/" + req.file.filename;
        }

        const student = await Student.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.json({ message: "Student details updated successfully" });
    } catch (err) {
        res.status(400).json({ message: err.message || "Unable to update student details" });
    }
});

// Delete student details
app.delete("/deleteStudent/:id", async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.json({ message: "Student details deleted successfully" });
    } catch (err) {
        res.status(400).json({ message: "Unable to delete student details" });
    }
});

// Handle profile upload errors
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError || err) {
        return res.status(400).json({ message: err.message });
    }
    next();
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
