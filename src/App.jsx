import { createContext, useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAppState } from "./hooks/useAppState";

import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Careers from "./pages/Careers";
import Assessment from "./pages/Assessment";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SkillProfile from "./pages/SkillProfile";
import Learning from "./pages/Learning";
import Quiz from "./pages/Quiz";
import RealWorldTask from "./pages/RealWorldTask";
import CareerReadiness from "./pages/CareerReadiness";
import Dashboard from "./pages/Dashboard";
import AdaptiveRoadmap from "./pages/AdaptiveRoadmap";
import LearningHistory from "./pages/LearningHistory";
import LearningInsights from "./pages/LearningInsights";
import KnowledgeRefresh from "./pages/KnowledgeRefresh";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

/**
 * RootRedirect — if already logged in, send straight to /dashboard;
 * otherwise show the landing home page.
 */
function RootRedirect() {
  const { state } = useApp();
  return state.user || state.authToken ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Home />
  );
}

export default function App() {
  const appState = useAppState();

  return (
    <AppContext.Provider value={appState}>
      <Routes>
        {/* Public auth pages — standalone, no Layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Landing — redirects to dashboard if already logged in */}
        <Route path="/" element={<RootRedirect />} />

        {/* Protected routes — require login */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/careers" element={<ProtectedRoute><Careers /></ProtectedRoute>} />
        <Route path="/learning-history" element={<ProtectedRoute><LearningHistory /></ProtectedRoute>} />
        <Route path="/assessment" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
        <Route path="/skill-gaps" element={<Navigate to="/skill-profile" replace />} />
        <Route path="/skill-profile" element={<ProtectedRoute><SkillProfile /></ProtectedRoute>} />
        <Route path="/roadmap" element={<Navigate to="/adaptive-roadmap" replace />} />
        <Route path="/learning" element={<ProtectedRoute><Learning /></ProtectedRoute>} />
        <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
        <Route path="/real-world-task" element={<ProtectedRoute><RealWorldTask /></ProtectedRoute>} />
        <Route path="/career-readiness" element={<ProtectedRoute><CareerReadiness /></ProtectedRoute>} />
        <Route path="/adaptive-roadmap" element={<ProtectedRoute><AdaptiveRoadmap /></ProtectedRoute>} />
        <Route path="/learning-insights" element={<ProtectedRoute><LearningInsights /></ProtectedRoute>} />
        <Route path="/knowledge-refresh" element={<ProtectedRoute><KnowledgeRefresh /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppContext.Provider>
  );
}
