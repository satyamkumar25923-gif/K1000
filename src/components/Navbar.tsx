import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Briefcase, User, LogOut, LayoutDashboard, Search } from "lucide-react";
import { motion } from "motion/react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 gold-gradient rounded-xl flex items-center justify-center shadow-lg shadow-gold-500/20 group-hover:scale-110 transition-transform">
            <Briefcase className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold gold-text-gradient hidden sm:block">COM Platform</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/jobs" className="text-gray-400 hover:text-gold-400 transition-colors flex items-center gap-2">
            <Search className="w-4 h-4" />
            <span className="hidden md:block">Browse Jobs</span>
          </Link>

          {user ? (
            <>
              <Link 
                to={user.role === "admin" ? "/admin" : "/dashboard"} 
                className="text-gray-400 hover:text-gold-400 transition-colors flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden md:block">Dashboard</span>
              </Link>
              <Link to="/profile" className="text-gray-400 hover:text-gold-400 transition-colors flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="hidden md:block">Profile</span>
              </Link>
              <button 
                onClick={() => { logout(); navigate("/"); }}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:block">Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link>
              <Link 
                to="/signup" 
                className="gold-gradient px-5 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-gold-500/20"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
