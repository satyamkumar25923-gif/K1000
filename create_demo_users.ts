import bcrypt from "bcryptjs";
import { User } from "./server/models.js";

async function createDemoUsers() {
  try {
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    // Check if student exists
    const existingStudent = User.findOne({ email: "demo@student.com" });
    if (!existingStudent) {
      User.create({
        name: "Demo Student",
        email: "demo@student.com",
        password: hashedPassword,
        role: "student",
        branch: "Computer Science",
        year: "3rd Year",
        skills: ["React", "TypeScript", "Node.js"]
      });
      console.log("Demo Student created: demo@student.com / password123");
    } else {
      console.log("Demo Student already exists.");
    }

    // Check if admin exists
    const existingAdmin = User.findOne({ email: "demo@admin.com" });
    if (!existingAdmin) {
      User.create({
        name: "Demo Admin",
        email: "demo@admin.com",
        password: hashedPassword,
        role: "admin"
      });
      console.log("Demo Admin created: demo@admin.com / password123");
    } else {
      console.log("Demo Admin already exists.");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Error creating demo users:", error);
    process.exit(1);
  }
}

createDemoUsers();
