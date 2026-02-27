import { useState, useEffect } from "react";
import axios from "axios";
import JobCard from "../components/JobCard";
import { Search, Filter, Loader2, SlidersHorizontal } from "lucide-react";
import { motion } from "motion/react";

export default function JobListingPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    workMode: "",
    location: ""
  });

  useEffect(() => {
    fetchJobs();
  }, [search, filters]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        ...filters
      });
      const res = await axios.get(`/api/jobs?${params}`);
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold mb-2">Explore <span className="gold-text-gradient">Opportunities</span></h1>
          <p className="text-gray-400">Find the perfect internship or full-time role for your career.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="text"
              placeholder="Search jobs or companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 w-full sm:w-80 focus:border-gold-500/50 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1 space-y-8">
          <div className="glass p-6 rounded-3xl">
            <div className="flex items-center gap-2 mb-6 text-gold-400 font-bold">
              <SlidersHorizontal className="w-5 h-5" />
              <span>Filters</span>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">Job Type</label>
                <select 
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-gold-500/50"
                >
                  <option value="" className="bg-black">All Types</option>
                  <option value="Internship" className="bg-black">Internship</option>
                  <option value="Full-time" className="bg-black">Full-time</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">Work Mode</label>
                <select 
                  value={filters.workMode}
                  onChange={(e) => setFilters({ ...filters, workMode: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-gold-500/50"
                >
                  <option value="" className="bg-black">All Modes</option>
                  <option value="Remote" className="bg-black">Remote</option>
                  <option value="Onsite" className="bg-black">Onsite</option>
                  <option value="Hybrid" className="bg-black">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">Location</label>
                <input 
                  type="text"
                  placeholder="City or Country"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-gold-500/50"
                />
              </div>

              <button 
                onClick={() => { setSearch(""); setFilters({ type: "", workMode: "", location: "" }); }}
                className="w-full py-2 text-sm text-gray-500 hover:text-white transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        </aside>

        {/* Job Grid */}
        <main className="lg:col-span-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-gold-500 animate-spin mb-4" />
              <p className="text-gray-500">Fetching latest opportunities...</p>
            </div>
          ) : jobs.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {jobs.map((job: any) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          ) : (
            <div className="glass p-12 rounded-3xl text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">No jobs found</h3>
              <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
