import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Members } from './pages/Members';
import { MemberForm } from './pages/MemberForm';
import { MemberDetails } from './pages/MemberDetails';
import { Payments } from './pages/Payments';
import { RecordPayment } from './pages/RecordPayment';
import { InvoicePreview } from './pages/InvoicePreview';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
// import { Search } from './pages/Search';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { admin, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center text-[#6B7280]">
        Loading...
      </div>
    );
  }
  
  if (!admin) {
    return <Navigate to="/login" replace />;
  }
  
  return <DashboardLayout>{children}</DashboardLayout>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Dashboard */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />

   
      
      {/* Member Management Routes */}
      <Route 
        path="/members" 
        element={
          <ProtectedRoute>
            <Members />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/members/add" 
        element={
          <ProtectedRoute>
            <MemberForm />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/members/edit/:id" 
        element={
          <ProtectedRoute>
            <MemberForm />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/members/:id" 
        element={
          <ProtectedRoute>
            <MemberDetails />
          </ProtectedRoute>
        } 
      />
      
      {/* Payment Management Routes */}
      <Route 
        path="/payments" 
        element={
          <ProtectedRoute>
            <Payments />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/payments/record" 
        element={
          <ProtectedRoute>
            <RecordPayment />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/payments/edit/:id" 
        element={
          <ProtectedRoute>
            <RecordPayment />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/payments/invoice/:id" 
        element={
          <ProtectedRoute>
            <InvoicePreview />
          </ProtectedRoute>
        } 
      />
      
      {/* Reminders Module (Upcoming) */}
      <Route 
        path="/reminders" 
        element={
          <ProtectedRoute>
            <div className="p-8 text-[#6B7280]">Reminders Page (Coming Soon)</div>
          </ProtectedRoute>
        } 
      />

      {/* Reports & Settings */}
      <Route 
        path="/reports" 
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } 
      />

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}