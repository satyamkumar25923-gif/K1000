import { useState, useEffect } from "react";
import axios from "axios";
import JobCard from "../components/JobCard";
import ExternalJobCard from "../components/ExternalJobCard";
import { Search, Filter, Loader2, SlidersHorizontal, Globe, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { searchExternalJobs } from "../services/geminiService";

export default function JobListingPage() {
  const [jobs, setJobs] = useState([]);
  const [externalJobs, setExternalJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchingExternal, setSearchingExternal] = useState(false);
  const [activeTab, setActiveTab] = useState<"internal" | "external">("internal");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    workMode: "",
    location: ""
  });

  useEffect(() => {
    if (activeTab === "internal") {
      fetchJobs();
    }
  }, [search, filters, activeTab]);

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

  const handleExternalSearch = async () => {
    setSearchingExternal(true);
    try {
      const query = search || "latest internships for college students";
      const results = await searchExternalJobs(query);
      setExternalJobs(results);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingExternal(false);
    }
  };

  useEffect(() => {
    if (activeTab === "external" && externalJobs.length === 0) {
      handleExternalSearch();
    }
  }, [activeTab]);

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
              placeholder={activeTab === "internal" ? "Search jobs or companies..." : "Search web for specific roles..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && activeTab === 'external' && handleExternalSearch()}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 w-full sm:w-80 focus:border-gold-500/50 focus:outline-none transition-colors"
            />
          </div>
          {activeTab === "external" && (
            <button 
              onClick={handleExternalSearch}
              disabled={searchingExternal}
              className="gold-gradient px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {searchingExternal ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5" /> Discover</>}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 p-1 glass w-fit rounded-2xl">
        <button 
          onClick={() => setActiveTab("internal")}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "internal" ? "bg-gold-500 text-white shadow-lg" : "text-gray-500 hover:text-white"}`}
        >
          Campus Portal
        </button>
        <button 
          onClick={() => setActiveTab("external")}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "external" ? "bg-gold-500 text-white shadow-lg" : "text-gray-500 hover:text-white"}`}
        >
          <Globe className="w-4 h-4" /> Web Discovery
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Filters Sidebar - Only for Internal */}
        <aside className={`lg:col-span-1 space-y-8 ${activeTab === "external" ? "hidden lg:block opacity-50 pointer-events-none" : ""}`}>
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
          {activeTab === "internal" ? (
            loading ? (
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
            )
          ) : (
            searchingExternal ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative mb-8">
                  <div className="w-20 h-20 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin"></div>
                  <Globe className="absolute inset-0 m-auto w-8 h-8 text-gold-500 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold mb-2">Scanning the Web</h3>
                <p className="text-gray-500 text-center max-w-sm">Gemini is searching LinkedIn, Indeed, and company portals for the latest opportunities...</p>
              </div>
            ) : externalJobs.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {externalJobs.map((job: any, i: number) => (
                  <ExternalJobCard key={i} job={job} />
                ))}
              </div>
            ) : (
              <div className="glass p-12 rounded-3xl text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-gold-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Start Web Discovery</h3>
                <p className="text-gray-500 mb-6">Click the discover button to find jobs from across the internet.</p>
                <button onClick={handleExternalSearch} className="gold-gradient px-8 py-3 rounded-xl font-bold">Search Now</button>
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
}
