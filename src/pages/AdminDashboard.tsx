import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, Users, Briefcase, TrendingUp, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { motion } from "motion/react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, jobsRes] = await Promise.all([
        axios.get("/api/stats"),
        axios.get("/api/jobs")
      ]);
      setStats(statsRes.data);
      setJobs(jobsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicants = async (jobId: string) => {
    setLoadingApplicants(true);
    try {
      const res = await axios.get(`/api/applications/job/${jobId}`);
      setApplicants(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleStatusChange = async (appId: string, status: string) => {
    try {
      await axios.patch(`/api/applications/${appId}/status`, { status });
      setApplicants(applicants.map((app: any) => app._id === appId ? { ...app, status } : app));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      await axios.delete(`/api/jobs/${id}`);
      setJobs(jobs.filter((j: any) => j._id !== id));
      if (selectedJob?._id === id) setSelectedJob(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <Loader2 className="w-10 h-10 text-gold-500 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold mb-2">Admin <span className="gold-text-gradient">Dashboard</span></h1>
          <p className="text-gray-400">Manage opportunities and track student applications.</p>
        </div>
        <Link 
          to="/admin/jobs/add" 
          className="gold-gradient px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-gold-500/20"
        >
          <Plus className="w-5 h-5" /> Post New Job
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {[
          { label: "Total Jobs", value: stats?.totalJobs || 0, icon: <Briefcase className="w-6 h-6" />, color: "text-gold-500 bg-gold-500/10" },
          { label: "Total Applications", value: stats?.totalApplications || 0, icon: <Users className="w-6 h-6" />, color: "text-blue-500 bg-blue-500/10" },
          { label: "Recent Activity", value: stats?.recentApplications?.length || 0, icon: <TrendingUp className="w-6 h-6" />, color: "text-green-500 bg-green-500/10" }
        ].map((stat, i) => (
          <div key={i} className="glass p-8 rounded-3xl flex items-center gap-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-gray-500 text-sm font-medium">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Jobs List */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h3 className="text-xl font-bold">Active Jobs</h3>
            </div>
            <div className="max-h-[600px] overflow-y-auto divide-y divide-white/5">
              {jobs.map((job: any) => (
                <div 
                  key={job._id}
                  onClick={() => { setSelectedJob(job); fetchApplicants(job._id); }}
                  className={`p-6 cursor-pointer hover:bg-white/5 transition-colors ${selectedJob?._id === job._id ? 'bg-white/5 border-l-4 border-gold-500' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold">{job.title}</h4>
                    <div className="flex gap-2">
                      <Link to={`/admin/jobs/edit/${job._id}`} className="p-1 hover:text-gold-400"><Edit className="w-4 h-4" /></Link>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteJob(job._id); }} className="p-1 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm">{job.company}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Applicants List */}
        <div className="lg:col-span-2">
          {selectedJob ? (
            <div className="glass rounded-3xl overflow-hidden min-h-[600px]">
              <div className="p-8 border-b border-white/5 bg-white/5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">Applicants for {selectedJob.title}</h3>
                    <p className="text-gray-400">{selectedJob.company} • {selectedJob.location}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gold-400">{applicants.length}</div>
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-widest">Total Applied</div>
                  </div>
                </div>
              </div>

              {loadingApplicants ? (
                <div className="p-20 flex justify-center">
                  <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
                </div>
              ) : applicants.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5 text-gray-500 text-sm">
                        <th className="px-8 py-4 font-medium">Student</th>
                        <th className="px-8 py-4 font-medium">Branch/Year</th>
                        <th className="px-8 py-4 font-medium">Status</th>
                        <th className="px-8 py-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {applicants.map((app: any) => (
                        <tr key={app._id} className="hover:bg-white/5 transition-colors">
                          <td className="px-8 py-6">
                            <div className="font-bold">{app.studentId.name}</div>
                            <div className="text-xs text-gray-500">{app.studentId.email}</div>
                          </td>
                          <td className="px-8 py-6 text-sm text-gray-400">
                            {app.studentId.branch} • {app.studentId.year}
                          </td>
                          <td className="px-8 py-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                              app.status === 'Shortlisted' ? 'text-green-400 border-green-400/20 bg-green-400/10' :
                              app.status === 'Rejected' ? 'text-red-400 border-red-400/20 bg-red-400/10' :
                              'text-gold-400 border-gold-400/20 bg-gold-400/10'
                            }`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleStatusChange(app._id, "Shortlisted")}
                                className="p-2 hover:bg-green-500/20 text-green-500 rounded-lg transition-colors"
                                title="Shortlist"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleStatusChange(app._id, "Rejected")}
                                className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-20 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-700" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No applicants yet</h3>
                  <p className="text-gray-500">Applications for this job will appear here once students apply.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="glass rounded-3xl min-h-[600px] flex flex-col items-center justify-center text-center p-12">
              <div className="w-20 h-20 bg-gold-500/10 rounded-3xl flex items-center justify-center mb-6">
                <Briefcase className="w-10 h-10 text-gold-500" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Select a Job</h3>
              <p className="text-gray-500 max-w-sm">Click on any job listing on the left to view and manage its applicants.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
