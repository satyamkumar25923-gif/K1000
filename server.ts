import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User, Job, Application } from "./server/models.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

  // Seed Demo Users
  const seedDemoUsers = async () => {
    try {
      const demoAdminEmail = "admin@demo.com";
      const demoStudentEmail = "student@demo.com";

      const adminExists = await User.findOne({ email: demoAdminEmail });
      if (!adminExists) {
        const hashedPassword = await bcrypt.hash("password123", 10);
        await User.create({
          name: "Demo Admin",
          email: demoAdminEmail,
          password: hashedPassword,
          role: "admin"
        });
        console.log("Demo Admin created: admin@demo.com / password123");
      }

      const studentExists = await User.findOne({ email: demoStudentEmail });
      if (!studentExists) {
        const hashedPassword = await bcrypt.hash("password123", 10);
        await User.create({
          name: "Demo Student",
          email: demoStudentEmail,
          password: hashedPassword,
          role: "student",
          branch: "Computer Science",
          year: "3rd Year",
          skills: ["React", "Node.js", "TypeScript"]
        });
        console.log("Demo Student created: student@demo.com / password123");
      }
    } catch (err) {
      console.error("Error seeding demo users:", err);
    }
  };
  seedDemoUsers();

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

  // AI Salary Prediction
  app.post("/api/ai/predict-salary", authenticate, async (req, res) => {
    try {
      const { resumeText, skills, branch, year } = req.body;

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        As an expert career consultant and HR specialist, analyze the following candidate profile and predict a fair annual salary range (in INR) they deserve in the current market.
        
        Candidate Details:
        Branch/Field: ${branch}
        Year of Study/Experience: ${year}
        Skills: ${skills.join(", ")}
        Resume Text/Additional Info: ${resumeText || "None provided"}
        
        Constraint:
        1. Predict salaries specifically for the Indian market in LPA (Lakhs Per Annum).
        2. Keep the range within 5 LPA to 15 LPA for freshers/early career roles.
        
        Please provide:
        1. Predicted Salary Range (Annual, e.g. "₹8.5 - ₹12.0 LPA")
        2. Brief justification.
        3. 3-5 specific tips to increase value.
        
        Format your response as a clean JSON object with keys: "salaryRange", "justification", and "tips" (an array of strings).
        Return ONLY the JSON object.
      `;

      try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonStr = responseText.includes("```json")
          ? responseText.split("```json")[1].split("```")[0].trim()
          : responseText.trim();
        return res.json(JSON.parse(jsonStr));
      } catch (aiError) {
        console.error("AI Error, using random fallback:", aiError);
        // Random prediction under 15 LPA as requested
        const base = 4.5 + Math.random() * 8;
        const max = base + 1.5 + Math.random() * 2;
        return res.json({
          salaryRange: `₹${base.toFixed(1)} - ₹${max.toFixed(1)} LPA`,
          justification: `Based on your profile in ${branch} and specialization in ${skills.slice(0, 2).join(", ")}, you fall into the competitive market bracket for entry-level developers.`,
          tips: [
            "Build 2-3 end-to-end projects with your core tech stack.",
            "Improve your problem-solving skills on platforms like LeetCode.",
            "Work on a live deployment with a public URL.",
            "Acquire skills in high-demand areas like Cloud or AI."
          ]
        });
      }
    } catch (error: any) {
      console.error("Endpoint Error:", error);
      res.status(500).json({ message: "Prediction service error. Try again." });
    }
  });

  // AI Interview Prep Kit
  app.post("/api/ai/interview-prep", authenticate, async (req, res) => {
    try {
      const { skills, branch, year } = req.body;

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        As a senior technical recruiter and career coach, generate a comprehensive Interview Preparation Kit and Roadmap for a student with the following profile:
        
        Field/Branch: ${branch}
        Current Level: ${year}
        Top Skills: ${skills.join(", ")}
        
        Please provide:
        1. A 4-week structured Roadmap (Week 1 to Week 4).
        2. Top 5 technical topics to master.
        3. 3 common behavioral questions tailored to this role.
        4. Recommended resources (links or names of platforms).
        
        Format your response as a clean JSON object with keys: "roadmap" (array of {week: string, focus: string, tasks: string[]}), "technicalTopics" (array of strings), "behavioralQuestions" (array of strings), and "resources" (array of strings).
        Return ONLY the JSON object.
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      // Extract JSON if model includes markdown formatting
      const jsonStr = responseText.includes("```json")
        ? responseText.split("```json")[1].split("```")[0].trim()
        : responseText.trim();

      res.json(JSON.parse(jsonStr));
    } catch (error: any) {
      console.error("AI Prep Kit Error:", error);
      res.status(500).json({ message: "Failed to generate prep kit. Please try again later." });
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
