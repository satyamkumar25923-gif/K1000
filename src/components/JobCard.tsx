import { Link } from "react-router-dom";
import { MapPin, Briefcase, Clock, DollarSign, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  workMode: string;
  salary: string;
  description: string;
  skillsRequired: string[];
  deadline: string;
}

export default function JobCard({ job }: { job: Job }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass p-6 rounded-3xl group hover:border-gold-500/30 transition-all"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold group-hover:text-gold-400 transition-colors">{job.title}</h3>
          <p className="text-gray-400 font-medium">{job.company}</p>
        </div>
        <div className="px-3 py-1 rounded-full bg-gold-500/10 text-gold-400 text-xs font-bold border border-gold-500/20">
          {job.type}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <MapPin className="w-4 h-4" />
          <span>{job.location} ({job.workMode})</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <DollarSign className="w-4 h-4" />
          <span>{job.salary || "Not Disclosed"}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Clock className="w-4 h-4" />
          <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {job.skillsRequired.slice(0, 3).map((skill, i) => (
          <span key={i} className="px-2 py-1 rounded-lg bg-white/5 text-gray-400 text-[10px] font-medium border border-white/5">
            {skill}
          </span>
        ))}
        {job.skillsRequired.length > 3 && (
          <span className="px-2 py-1 rounded-lg bg-white/5 text-gray-400 text-[10px] font-medium border border-white/5">
            +{job.skillsRequired.length - 3} more
          </span>
        )}
      </div>

      <Link 
        to={`/jobs/${job._id}`}
        className="w-full py-3 rounded-xl border border-white/10 flex items-center justify-center gap-2 group-hover:bg-gold-500 group-hover:text-white group-hover:border-gold-500 transition-all font-bold"
      >
        View Details <ArrowRight className="w-4 h-4" />
      </Link>
    </motion.div>
  );
}
