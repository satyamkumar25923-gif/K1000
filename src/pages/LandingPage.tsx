import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Briefcase, ShieldCheck, Zap, ArrowRight, Star } from "lucide-react";
import MagicBento from "../components/MagicBento";

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-[128px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-600/10 rounded-full blur-[128px] -z-10" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-gold-500/20 text-gold-400 text-sm font-medium mb-8">
            <Star className="w-4 h-4 fill-gold-400" />
            <span>The #1 Placement Cell Platform</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
            Centralized <br />
            <span className="gold-text-gradient">Opportunity</span> Management
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
            Stop hunting through WhatsApp groups. Access all internships and job opportunities in one premium, structured system.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              to="/signup"
              className="gold-gradient px-8 py-4 rounded-full text-lg font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-xl shadow-gold-500/20"
            >
              Join as Student <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="glass px-8 py-4 rounded-full text-lg font-bold hover:bg-white/10 transition-colors"
            >
              Admin Portal
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features with MagicBento */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Zap className="w-8 h-8 text-gold-400" />,
              title: "Real-time Updates",
              desc: "Get instant notifications for new job postings and status changes."
            },
            {
              icon: <ShieldCheck className="w-8 h-8 text-gold-400" />,
              title: "Verified Listings",
              desc: "Every opportunity is vetted by the Placement Cell for authenticity."
            },
            {
              icon: <Briefcase className="w-8 h-8 text-gold-400" />,
              title: "Direct Application",
              desc: "Apply with your pre-built profile and track status in real-time."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
            >
              <MagicBento
                className="glass p-8 rounded-3xl h-full"
                textAutoHide={true}
                enableStars
                enableSpotlight
                enableBorderGlow={true}
                enableTilt={false}
                enableMagnetism={false}
                clickEffect
                spotlightRadius={400}
                particleCount={12}
                glowColor="245, 158, 11"
                disableAnimations={false}
              >
                <div className="mb-6 group-hover:scale-110 transition-transform">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </MagicBento>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white/5 py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { label: "Active Jobs", value: "500+" },
            { label: "Students", value: "2,000+" },
            { label: "Companies", value: "150+" },
            { label: "Placements", value: "85%" }
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-4xl font-bold gold-text-gradient mb-2">{stat.value}</div>
              <div className="text-gray-500 uppercase tracking-widest text-xs font-bold">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 text-center border-t border-white/5">
        <p className="text-gray-500">© 2026 Centralized Opportunity Management. Built for Hackathons.</p>
      </footer>
    </div>
  );
}
