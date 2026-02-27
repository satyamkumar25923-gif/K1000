import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Briefcase, CheckCircle, Clock, XCircle, ChevronRight, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await axios.get("/api/applications/student");
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Shortlisted": return "text-green-400 bg-green-400/10 border-green-400/20";
      case "Rejected": return "text-red-400 bg-red-400/10 border-red-400/20";
      default: return "text-gold-400 bg-gold-400/10 border-gold-400/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Shortlisted": return <CheckCircle className="w-4 h-4" />;
      case "Rejected": return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2">Welcome, <span className="gold-text-gradient">{user?.name}</span></h1>
        <p className="text-gray-400">Track your applications and explore new opportunities.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-8 rounded-3xl">
            <h3 className="text-xl font-bold mb-6">Application Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-500">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <span className="font-medium">Total Applied</span>
                </div>
                <span className="text-2xl font-bold">{applications.length}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <span className="font-medium">Shortlisted</span>
                </div>
                <span className="text-2xl font-bold">{applications.filter((a: any) => a.status === "Shortlisted").length}</span>
              </div>
            </div>
          </div>

          <div className="glass p-8 rounded-3xl bg-gold-500/5 border-gold-500/10">
            <h3 className="text-xl font-bold mb-4">Quick Tip</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Keep your skills updated in your profile to increase your chances of being shortlisted by 40%.
            </p>
            <Link to="/profile" className="mt-6 inline-block text-gold-400 font-bold text-sm hover:underline">
              Update Profile →
            </Link>
          </div>
        </div>

        {/* Applications List */}
        <div className="lg:col-span-2">
          <div className="glass rounded-3xl overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-bold">Recent Applications</h3>
              <Link to="/jobs" className="text-sm text-gold-400 hover:underline">Browse More Jobs</Link>
            </div>

            {loading ? (
              <div className="p-20 flex justify-center">
                <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
              </div>
            ) : applications.length > 0 ? (
              <div className="divide-y divide-white/5">
                {applications.map((app: any) => (
                  <motion.div 
                    key={app._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6 hover:bg-white/5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gold-500/10 rounded-xl flex items-center justify-center border border-gold-500/20">
                        <Briefcase className="w-6 h-6 text-gold-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{app.jobId.title}</h4>
                        <p className="text-gray-500 text-sm">{app.jobId.company} • {new Date(app.appliedAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className={`px-4 py-1.5 rounded-full border text-xs font-bold flex items-center gap-2 ${getStatusColor(app.status)}`}>
                        {getStatusIcon(app.status)}
                        {app.status}
                      </div>
                      <Link to={`/jobs/${app.jobId._id}`} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-20 text-center">
                <p className="text-gray-500 mb-6">You haven't applied to any jobs yet.</p>
                <Link to="/jobs" className="gold-gradient px-6 py-3 rounded-xl font-bold inline-block">
                  Explore Jobs
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
