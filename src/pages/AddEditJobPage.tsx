import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Loader2, Save, Plus, X } from "lucide-react";
import { motion } from "motion/react";

export default function AddEditJobPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "Internship",
    workMode: "Onsite",
    salary: "",
    description: "",
    skillsRequired: [] as string[],
    deadline: ""
  });

  useEffect(() => {
    if (id) {
      fetchJob();
    }
  }, [id]);

  const fetchJob = async () => {
    setFetching(true);
    try {
      const res = await axios.get(`/api/jobs/${id}`);
      const job = res.data;
      setFormData({
        ...job,
        deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : ""
      });
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await axios.put(`/api/jobs/${id}`, formData);
      } else {
        await axios.post("/api/jobs", formData);
      }
      navigate("/admin");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (skillInput && !formData.skillsRequired.includes(skillInput)) {
      setFormData({ ...formData, skillsRequired: [...formData.skillsRequired, skillInput] });
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skillsRequired: formData.skillsRequired.filter(s => s !== skill) });
  };

  if (fetching) return (
    <div className="flex items-center justify-center py-40">
      <Loader2 className="w-10 h-10 text-gold-500 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="glass p-8 md:p-12 rounded-3xl">
        <h1 className="text-3xl font-bold mb-8">{id ? "Edit Opportunity" : "Post New Opportunity"}</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Job Title</label>
              <input 
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-gold-500/50 focus:outline-none"
                placeholder="Software Engineer Intern"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Company Name</label>
              <input 
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-gold-500/50 focus:outline-none"
                placeholder="Google"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Location</label>
              <input 
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-gold-500/50 focus:outline-none"
                placeholder="Bangalore, India"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Salary / Stipend</label>
              <input 
                type="text"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-gold-500/50 focus:outline-none"
                placeholder="₹50,000 / month"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Job Type</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-gold-500/50 focus:outline-none appearance-none"
              >
                <option value="Internship" className="bg-black">Internship</option>
                <option value="Full-time" className="bg-black">Full-time</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Work Mode</label>
              <select 
                value={formData.workMode}
                onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-gold-500/50 focus:outline-none appearance-none"
              >
                <option value="Onsite" className="bg-black">Onsite</option>
                <option value="Remote" className="bg-black">Remote</option>
                <option value="Hybrid" className="bg-black">Hybrid</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Application Deadline</label>
              <input 
                type="date"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-gold-500/50 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Job Description</label>
            <textarea 
              required
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-gold-500/50 focus:outline-none resize-none"
              placeholder="Describe the role, responsibilities, and requirements..."
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-400">Required Skills</label>
            <div className="flex gap-2">
              <input 
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-gold-500/50 focus:outline-none"
                placeholder="e.g. React, Python, AWS"
              />
              <button 
                type="button"
                onClick={addSkill}
                className="bg-white/10 hover:bg-white/20 px-6 rounded-xl transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skillsRequired.map((skill, i) => (
                <span key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass border-gold-500/20 text-gold-400 text-sm">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="hover:text-white"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-white/5">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full gold-gradient py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:scale-[1.01] transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> {id ? "Update Job" : "Post Job"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
