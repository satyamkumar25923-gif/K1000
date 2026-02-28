import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, "../../data.db"));
db.pragma("journal_mode = WAL");

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    branch TEXT,
    year TEXT,
    skills TEXT, -- JSON string
    resumeURL TEXT,
    role TEXT DEFAULT 'student',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT NOT NULL,
    workMode TEXT NOT NULL,
    salary TEXT,
    description TEXT NOT NULL,
    skillsRequired TEXT, -- JSON string
    deadline DATETIME,
    postedBy TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    studentId TEXT NOT NULL,
    jobId TEXT NOT NULL,
    status TEXT DEFAULT 'Applied',
    appliedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(studentId) REFERENCES users(id),
    FOREIGN KEY(jobId) REFERENCES jobs(id)
  );
`);

export default db;
