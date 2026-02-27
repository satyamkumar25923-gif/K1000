import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { User, Mail, GraduationCap, Code, FileText, Save, Loader2, CheckCircle, Plus, X } from "lucide-react";
import { motion } from "motion/react";

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    branch: "",
    year: "",
    skills: [] as string[],
    resumeURL: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get("/api/users/profile");
      setFormData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await axios.put("/api/users/profile", formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (skillInput && !formData.skills.includes(skillInput)) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput] });
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <Loader2 className="w-10 h-10 text-gold-500 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2">Your <span className="gold-text-gradient">Profile</span></h1>
        <p className="text-gray-400">Manage your personal information and professional details.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-12">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <div className="glass p-8 rounded-3xl text-center">
            <div className="w-24 h-24 gold-gradient rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-gold-500/20">
              <span className="text-4xl font-bold text-white">{formData.name.charAt(0)}</span>
            </div>
            <h3 className="text-2xl font-bold mb-1">{formData.name}</h3>
            <p className="text-gray-500 text-sm mb-6 uppercase tracking-widest font-bold">{authUser?.role}</p>
            
            <div className="space-y-4 pt-6 border-t border-white/5 text-left">
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <Mail className="w-4 h-4 text-gold-500" /> {formData.email}
              </div>
              {formData.branch && (
                <div className="flex items-center gap-3 text-gray-400 text-sm">
                  <GraduationCap className="w-4 h-4 text-gold-500" /> {formData.branch}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="glass p-8 rounded-3xl space-y-8">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Full Name</label>
                <input 
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-gold-500/50 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Email Address</label>
                <input 
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 opacity-50 cursor-not-allowed"
                />
              </div>

              {authUser?.role === "student" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Branch</label>
                    <input 
                      type="text"
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-gold-500/50 focus:outline-none"
                      placeholder="e.g. Computer Science"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Year</label>
                    <input 
                      type="text"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-gold-500/50 focus:outline-none"
                      placeholder="e.g. 3rd Year"
                    />
                  </div>
                </>
              )}
            </div>

            {authUser?.role === "student" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Resume Link (Google Drive/Dropbox)</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input 
                      type="url"
                      value={formData.resumeURL}
                      onChange={(e) => setFormData({ ...formData, resumeURL: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-gold-500/50 focus:outline-none"
                      placeholder="https://drive.google.com/..."
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-400">Skills</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-gold-500/50 focus:outline-none"
                      placeholder="Add a skill..."
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
                    {formData.skills.map((skill, i) => (
                      <span key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass border-gold-500/20 text-gold-400 text-sm">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="hover:text-white"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
              {success && (
                <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" /> Profile updated successfully!
                </div>
              )}
              <div />
              <button 
                type="submit" 
                disabled={saving}
                className="gold-gradient px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
