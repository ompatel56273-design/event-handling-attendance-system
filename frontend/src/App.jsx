import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// User pages
import UserDashboard from './pages/user/Dashboard';
import UserProfile from './pages/user/Profile';
import UpcomingEvents from './pages/user/UpcomingEvents';
import Events from './pages/user/Events';
import MyEvents from './pages/user/MyEvents';
import Winners from './pages/user/Winners';
import UserSettings from './pages/user/Settings';

// Event Member pages
import MemberDashboard from './pages/member/Dashboard';
import Scanner from './pages/member/Scanner';
import MemberEvents from './pages/member/Events';
import MemberMarks from './pages/member/Marks';
import MemberProfile from './pages/member/Profile';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminEvents from './pages/admin/Events';
import AdminRegistrations from './pages/admin/Registrations';
import AdminAttendance from './pages/admin/Attendance';
import AdminMarks from './pages/admin/Marks';
import AdminWinners from './pages/admin/Winners';
import AdminEventMembers from './pages/admin/EventMembers';
import AdminECards from './pages/admin/ECards';
import AdminSettings from './pages/admin/Settings';

const RootRedirect = () => {
  const { isAuthenticated, role, getDashboardPath } = useAuth();
  if (isAuthenticated) return <Navigate to={getDashboardPath(role)} replace />;
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* User routes */}
          <Route path="/user/dashboard" element={<ProtectedRoute allowedRoles={['USER']}><UserDashboard /></ProtectedRoute>} />
          <Route path="/user/profile" element={<ProtectedRoute allowedRoles={['USER']}><UserProfile /></ProtectedRoute>} />
          <Route path="/user/upcoming-events" element={<ProtectedRoute allowedRoles={['USER']}><UpcomingEvents /></ProtectedRoute>} />
          <Route path="/user/events" element={<ProtectedRoute allowedRoles={['USER']}><Events /></ProtectedRoute>} />
          <Route path="/user/my-events" element={<ProtectedRoute allowedRoles={['USER']}><MyEvents /></ProtectedRoute>} />
          <Route path="/user/winners" element={<ProtectedRoute allowedRoles={['USER']}><Winners /></ProtectedRoute>} />
          <Route path="/user/settings" element={<ProtectedRoute allowedRoles={['USER']}><UserSettings /></ProtectedRoute>} />

          {/* Event Member routes */}
          <Route path="/member/dashboard" element={<ProtectedRoute allowedRoles={['EVENT_MEMBER']}><MemberDashboard /></ProtectedRoute>} />
          <Route path="/member/scanner" element={<ProtectedRoute allowedRoles={['EVENT_MEMBER']}><Scanner /></ProtectedRoute>} />
          <Route path="/member/events" element={<ProtectedRoute allowedRoles={['EVENT_MEMBER']}><MemberEvents /></ProtectedRoute>} />
          <Route path="/member/marks" element={<ProtectedRoute allowedRoles={['EVENT_MEMBER']}><MemberMarks /></ProtectedRoute>} />
          <Route path="/member/profile" element={<ProtectedRoute allowedRoles={['EVENT_MEMBER']}><MemberProfile /></ProtectedRoute>} />

          {/* SuperAdmin routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/events" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminEvents /></ProtectedRoute>} />
          <Route path="/admin/registrations" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminRegistrations /></ProtectedRoute>} />
          <Route path="/admin/attendance" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminAttendance /></ProtectedRoute>} />
          <Route path="/admin/marks" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminMarks /></ProtectedRoute>} />
          <Route path="/admin/winners" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminWinners /></ProtectedRoute>} />
          <Route path="/admin/event-members" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminEventMembers /></ProtectedRoute>} />
          <Route path="/admin/e-cards" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminECards /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminSettings /></ProtectedRoute>} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
