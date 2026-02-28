import db from "./db.js";
import { v4 as uuidv4 } from "uuid";

// Helper to parse JSON fields
const parseJSON = (str: string | null) => {
  try {
    return str ? JSON.parse(str) : [];
  } catch {
    return [];
  }
};

export const User = {
  findOne: (query: any) => {
    const key = Object.keys(query)[0];
    const stmt = db.prepare(`SELECT * FROM users WHERE ${key} = ?`);
    const user = stmt.get(query[key]) as any;
    if (user) user.skills = parseJSON(user.skills);
    return user;
  },
  findById: (id: string) => {
    const stmt = db.prepare(`SELECT * FROM users WHERE id = ?`);
    const user = stmt.get(id) as any;
    if (user) user.skills = parseJSON(user.skills);
    return user;
  },
  create: (data: any) => {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO users (id, name, email, password, role, branch, year, skills)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, data.name, data.email, data.password, data.role || 'student', data.branch || null, data.year || null, JSON.stringify(data.skills || []));
    return { id, ...data };
  },
  update: (id: string, data: any) => {
    const fields = Object.keys(data).map(k => `${k} = ?`).join(", ");
    const values = Object.values(data).map(v => Array.isArray(v) ? JSON.stringify(v) : v);
    const stmt = db.prepare(`UPDATE users SET ${fields} WHERE id = ?`);
    stmt.run(...values, id);
    return User.findById(id);
  }
};

export const Job = {
  find: (query: any = {}) => {
    let sql = "SELECT * FROM jobs WHERE 1=1";
    const params: any[] = [];
    
    if (query.type) { sql += " AND type = ?"; params.push(query.type); }
    if (query.workMode) { sql += " AND workMode = ?"; params.push(query.workMode); }
    if (query.search) { 
      sql += " AND (title LIKE ? OR company LIKE ?)"; 
      params.push(`%${query.search}%`, `%${query.search}%`); 
    }
    if (query.location) { sql += " AND location LIKE ?"; params.push(`%${query.location}%`); }
    
    sql += " ORDER BY createdAt DESC";
    const stmt = db.prepare(sql);
    return stmt.all(...params).map((j: any) => ({ ...j, skillsRequired: parseJSON(j.skillsRequired) }));
  },
  findById: (id: string) => {
    const stmt = db.prepare(`SELECT * FROM jobs WHERE id = ?`);
    const job = stmt.get(id) as any;
    if (job) job.skillsRequired = parseJSON(job.skillsRequired);
    return job;
  },
  create: (data: any) => {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO jobs (id, title, company, location, type, workMode, salary, description, skillsRequired, deadline, postedBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, data.title, data.company, data.location, data.type, data.workMode, data.salary, data.description, JSON.stringify(data.skillsRequired || []), data.deadline, data.postedBy);
    return { id, ...data };
  },
  update: (id: string, data: any) => {
    const { id: _, ...rest } = data;
    const fields = Object.keys(rest).map(k => `${k} = ?`).join(", ");
    const values = Object.values(rest).map(v => Array.isArray(v) ? JSON.stringify(v) : v);
    const stmt = db.prepare(`UPDATE jobs SET ${fields} WHERE id = ?`);
    stmt.run(...values, id);
    return Job.findById(id);
  },
  delete: (id: string) => {
    db.prepare("DELETE FROM jobs WHERE id = ?").run(id);
  },
  count: () => {
    return (db.prepare("SELECT COUNT(*) as count FROM jobs").get() as any).count;
  }
};

export const Application = {
  create: (data: any) => {
    const id = uuidv4();
    const stmt = db.prepare(`INSERT INTO applications (id, studentId, jobId) VALUES (?, ?, ?)`);
    stmt.run(id, data.studentId, data.jobId);
    return { id, ...data, status: 'Applied' };
  },
  findOne: (query: any) => {
    const keys = Object.keys(query);
    const sql = `SELECT * FROM applications WHERE ${keys.map(k => `${k} = ?`).join(" AND ")}`;
    return db.prepare(sql).get(...Object.values(query));
  },
  find: (query: any) => {
    const keys = Object.keys(query);
    const sql = `SELECT * FROM applications WHERE ${keys.map(k => `${k} = ?`).join(" AND ")} ORDER BY appliedAt DESC`;
    const apps = db.prepare(sql).all(...Object.values(query)) as any[];
    
    // Manual Population
    return apps.map(app => {
      const job = Job.findById(app.jobId);
      const student = User.findById(app.studentId);
      return { ...app, jobId: job, studentId: student };
    });
  },
  updateStatus: (id: string, status: string) => {
    db.prepare("UPDATE applications SET status = ? WHERE id = ?").run(status, id);
    return { id, status };
  },
  count: () => {
    return (db.prepare("SELECT COUNT(*) as count FROM applications").get() as any).count;
  }
};
