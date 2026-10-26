import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import FloatingHealthAssistant from './components/FloatingHealthAssistant';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import FamilyDependents from './pages/FamilyDependents';
import PatientAssessment from './pages/PatientAssessment';
import RiskResult from './pages/RiskResult';
import HospitalSearch from './pages/HospitalSearch';
import HospitalDetails from './pages/HospitalDetails';
import HospitalComparison from './pages/HospitalComparison';
import DoctorDirectory from './pages/DoctorDirectory';
import DoctorProfile from './pages/DoctorProfile';
import RecommendationResults from './pages/RecommendationResults';
import RecommendationExplanation from './pages/RecommendationExplanation';
import RecommendationHistory from './pages/RecommendationHistory';
import DoctorRegister from './pages/DoctorRegister';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import DoctorVerification from './pages/admin/DoctorVerification';
import HospitalManagement from './pages/admin/HospitalManagement';
import OperationalAnalytics from './pages/admin/OperationalAnalytics';
import WhatIfSimulation from './pages/admin/WhatIfSimulation';
import MLModelPerformance from './pages/admin/MLModelPerformance';

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/hospitals" element={<HospitalSearch />} />
          <Route path="/hospitals/compare" element={<HospitalComparison />} />
          <Route path="/hospitals/:id" element={<HospitalDetails />} />
          <Route path="/doctors" element={<DoctorDirectory />} />
          <Route path="/doctors/:id" element={<DoctorProfile />} />

          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['user']}><UserDashboard /></ProtectedRoute>} />
          <Route path="/family" element={<ProtectedRoute allowedRoles={['user']}><FamilyDependents /></ProtectedRoute>} />
          <Route path="/assessment" element={<ProtectedRoute allowedRoles={['user']}><PatientAssessment /></ProtectedRoute>} />
          <Route path="/risk-result/:id" element={<ProtectedRoute allowedRoles={['user']}><RiskResult /></ProtectedRoute>} />
          <Route path="/recommendations/:id" element={<ProtectedRoute allowedRoles={['user']}><RecommendationResults /></ProtectedRoute>} />
          <Route path="/recommendations/:id/explain" element={<ProtectedRoute allowedRoles={['user']}><RecommendationExplanation /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute allowedRoles={['user']}><RecommendationHistory /></ProtectedRoute>} />

          <Route path="/doctor/register" element={<DoctorRegister />} />
          <Route path="/doctor" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/doctors" element={<ProtectedRoute allowedRoles={['admin']}><DoctorVerification /></ProtectedRoute>} />
          <Route path="/admin/hospitals" element={<ProtectedRoute allowedRoles={['admin']}><HospitalManagement /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><OperationalAnalytics /></ProtectedRoute>} />
          <Route path="/admin/simulation" element={<ProtectedRoute allowedRoles={['admin']}><WhatIfSimulation /></ProtectedRoute>} />
          <Route path="/admin/model-performance" element={<ProtectedRoute allowedRoles={['admin']}><MLModelPerformance /></ProtectedRoute>} />
        </Routes>
        <Footer />
        <FloatingHealthAssistant />
      </div>
    </AuthProvider>
  );
}
