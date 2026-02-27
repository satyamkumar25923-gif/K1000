import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { MapPin, Briefcase, Clock, DollarSign, ArrowLeft, CheckCircle, Loader2, AlertCircle, Star } from "lucide-react";
import { motion } from "motion/react";

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchJob();
    checkIfApplied();
  }, [id]);

  const fetchJob = async () => {
    try {
      const res = await axios.get(`/api/jobs/${id}`);
      setJob(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkIfApplied = async () => {
    try {
      const res = await axios.get("/api/applications/student");
      const hasApplied = res.data.some((app: any) => app.jobId._id === id);
      setApplied(hasApplied);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    setError("");
    try {
      await axios.post("/api/applications", { jobId: id });
      setApplied(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Application failed");
    } finally {
      setApplying(false);
    }
  };

  const calculateMatch = () => {
    if (!user || !job || user.role !== "student") return null;
    // We need to fetch the full user profile to get skills
    // For now, let's assume we have them or fetch them
    return null; // I'll implement a more robust version below
  };

  // Improved match calculation
  const [matchScore, setMatchScore] = useState<number | null>(null);
  useEffect(() => {
    if (user && job && user.role === "student") {
      axios.get("/api/users/profile").then(res => {
        const studentSkills = res.data.skills || [];
        const jobSkills = job.skillsRequired || [];
        if (jobSkills.length === 0) {
          setMatchScore(100);
          return;
        }
        const matches = jobSkills.filter((s: string) => 
          studentSkills.some((ss: string) => ss.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(ss.toLowerCase()))
        );
        setMatchScore(Math.round((matches.length / jobSkills.length) * 100));
      });
    }
  }, [user, job]);

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <Loader2 className="w-10 h-10 text-gold-500 animate-spin" />
    </div>
  );

  if (!job) return (
    <div className="max-w-7xl mx-auto px-6 py-20 text-center">
      <h2 className="text-2xl font-bold">Job not found</h2>
      <button onClick={() => navigate("/jobs")} className="mt-4 text-gold-400">Back to listings</button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-12">
          {/* Header */}
          <div className="glass p-8 rounded-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-gold-500/10 rounded-2xl flex items-center justify-center border border-gold-500/20">
                  <Briefcase className="w-10 h-10 text-gold-500" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                  <p className="text-xl text-gray-400 font-medium">{job.company}</p>
                </div>
              </div>
              <div className="px-4 py-2 rounded-full bg-gold-500/10 text-gold-400 text-sm font-bold border border-gold-500/20 self-start sm:self-center">
                {job.type}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-10 pt-10 border-t border-white/5">
              <div className="space-y-1">
                <div className="text-gray-500 text-xs uppercase font-bold tracking-wider">Location</div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="w-4 h-4 text-gold-500" /> {job.location}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-500 text-xs uppercase font-bold tracking-wider">Work Mode</div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Briefcase className="w-4 h-4 text-gold-500" /> {job.workMode}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-500 text-xs uppercase font-bold tracking-wider">Salary</div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <DollarSign className="w-4 h-4 text-gold-500" /> {job.salary || "Not Disclosed"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-500 text-xs uppercase font-bold tracking-wider">Deadline</div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="w-4 h-4 text-gold-500" /> {new Date(job.deadline).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Job Description</h2>
            <div className="text-gray-400 leading-relaxed whitespace-pre-wrap">
              {job.description}
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Skills Required</h2>
            <div className="flex flex-wrap gap-3">
              {job.skillsRequired.map((skill: string, i: number) => (
                <span key={i} className="px-4 py-2 rounded-xl glass border-white/10 text-gray-300 font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Sidebar */}
        <aside className="md:col-span-1">
          <div className="glass p-8 rounded-3xl sticky top-32">
            {matchScore !== null && (
              <div className="mb-8 p-6 rounded-3xl bg-gold-500/5 border border-gold-500/20 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gold-400 mb-1 flex items-center gap-2">
                    <Star className="w-4 h-4 fill-gold-400" /> AI Resume Match
                  </div>
                  <div className="text-2xl font-bold">Your skills match {matchScore}% of requirements</div>
                </div>
                <div className="relative w-16 h-16">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      className="text-white/10 stroke-current"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-gold-500 stroke-current"
                      strokeWidth="3"
                      strokeDasharray={`${matchScore}, 100`}
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                    {matchScore}%
                  </div>
                </div>
              </div>
            )}

            <h3 className="text-xl font-bold mb-6">Ready to apply??</h3>
            <p className="text-gray-400 text-sm mb-8">
              Make sure your profile is up to date with your latest resume and skills before applying.
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            {applied ? (
              <div className="w-full bg-green-500/10 border border-green-500/20 text-green-400 py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" /> Applied Successfully
              </div>
            ) : (
              <button 
                onClick={handleApply}
                disabled={applying || user?.role === "admin"}
                className="w-full gold-gradient py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {applying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Apply Now"}
              </button>
            )}

            {user?.role === "admin" && (
              <p className="text-center mt-4 text-xs text-gray-500 italic">
                Admins cannot apply to jobs.
              </p>
            )}
            
            <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Posted On</span>
                <span className="text-gray-300">{new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Applications</span>
                <span className="text-gray-300">24 Applied</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
