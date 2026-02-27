import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User, Job, Application } from "./server/models.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // Database Connection (SQLite is initialized in db.ts)
  console.log("Using SQLite database for zero-config environment.");

  // --- API Routes ---

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password, role, branch, year, skills } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: "User already exists" });

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashedPassword, role, branch, year, skills });

      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || "secret", { expiresIn: "1d" });
      res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "Invalid credentials" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || "secret", { expiresIn: "1d" });
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Middleware for Auth
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
    }
  };

  const isAdmin = (req: any, res: any, next: any) => {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    next();
  };

  // Job Routes
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await Job.find(req.query);
      res.json(jobs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);
      if (!job) return res.status(404).json({ message: "Job not found" });
      res.json(job);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/jobs", authenticate, isAdmin, async (req, res) => {
    try {
      const job = await Job.create({ ...req.body, postedBy: req.user.id });
      res.status(201).json(job);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/jobs/:id", authenticate, isAdmin, async (req, res) => {
    try {
      const job = await Job.update(req.params.id, req.body);
      res.json(job);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/jobs/:id", authenticate, isAdmin, async (req, res) => {
    try {
      await Job.delete(req.params.id);
      res.json({ message: "Job deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Application Routes
  app.post("/api/applications", authenticate, async (req, res) => {
    try {
      const { jobId } = req.body;
      const existing = await Application.findOne({ studentId: req.user.id, jobId });
      if (existing) return res.status(400).json({ message: "Already applied" });

      const application = await Application.create({ studentId: req.user.id, jobId });
      res.status(201).json(application);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/applications/student", authenticate, async (req, res) => {
    try {
      const applications = await Application.find({ studentId: req.user.id });
      res.json(applications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/applications/job/:jobId", authenticate, isAdmin, async (req, res) => {
    try {
      const applications = await Application.find({ jobId: req.params.jobId });
      res.json(applications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/applications/:id/status", authenticate, isAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const application = await Application.updateStatus(req.params.id, status);
      res.json(application);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // User Profile
  app.get("/api/users/profile", authenticate, async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (user) delete user.password;
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/users/profile", authenticate, async (req, res) => {
    try {
      const user = await User.update(req.user.id, req.body);
      if (user) delete user.password;
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Dashboard Stats
  app.get("/api/stats", authenticate, isAdmin, async (req, res) => {
    try {
      const totalJobs = await Job.count();
      const totalApplications = await Application.count();
      // For simplicity, just return counts
      res.json({ totalJobs, totalApplications, recentApplications: [] });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
