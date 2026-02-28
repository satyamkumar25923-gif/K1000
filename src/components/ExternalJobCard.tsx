import { ExternalLink, Globe, Briefcase, MapPin } from "lucide-react";
import { motion } from "motion/react";

interface ExternalJob {
  title: string;
  company: string;
  location: string;
  type: string;
  workMode: string;
  source: string;
  url: string;
  description: string;
}

export default function ExternalJobCard({ job }: { job: ExternalJob }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass-gold p-6 rounded-3xl group hover:border-gold-500/50 transition-all"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-3 h-3 text-gold-400" />
            <span className="text-[10px] font-bold text-gold-400 uppercase tracking-widest">Found on {job.source}</span>
          </div>
          <h3 className="text-xl font-bold group-hover:text-gold-400 transition-colors">{job.title}</h3>
          <p className="text-gray-400 font-medium">{job.company}</p>
        </div>
        <div className="px-3 py-1 rounded-full bg-gold-500/10 text-gold-400 text-xs font-bold border border-gold-500/20">
          {job.type}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <MapPin className="w-4 h-4" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Briefcase className="w-4 h-4" />
          <span>{job.workMode}</span>
        </div>
      </div>

      <p className="text-gray-500 text-sm mb-6 line-clamp-2 italic">
        "{job.description}"
      </p>

      <a 
        href={job.url}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-3 rounded-xl gold-gradient flex items-center justify-center gap-2 font-bold hover:scale-[1.02] transition-all shadow-lg shadow-gold-500/20"
      >
        Apply on {job.source} <ExternalLink className="w-4 h-4" />
      </a>
    </motion.div>
  );
}
