import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import JobListingPage from "./pages/JobListingPage";
import JobDetailPage from "./pages/JobDetailPage";
import ProfilePage from "./pages/ProfilePage";
import AddEditJobPage from "./pages/AddEditJobPage";
import Navbar from "./components/Navbar";
import BackgroundParticles from "./components/BackgroundParticles";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ children, role }: { children: React.ReactNode, role?: string }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-black">
      <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
    </div>
  );

  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;

  return <>{children}</>;
}

function AppContent() {
  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-hidden">
      <BackgroundParticles />
      <div className="relative z-10">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Student Routes */}
          <Route path="/jobs" element={<ProtectedRoute><JobListingPage /></ProtectedRoute>} />
          <Route path="/jobs/:id" element={<ProtectedRoute><JobDetailPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/jobs/add" element={<ProtectedRoute role="admin"><AddEditJobPage /></ProtectedRoute>} />
          <Route path="/admin/jobs/edit/:id" element={<ProtectedRoute role="admin"><AddEditJobPage /></ProtectedRoute>} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
