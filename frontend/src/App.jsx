import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import PageLoader from './components/common/PageLoader';

// Public Landing Page (Eagerly loaded for instant first render)
import PublicLanding from './pages/public/PublicLanding';

// Lazy Loaded Auth pages
const Login = lazy(() => import('./pages/auth/Login'));
const Signup = lazy(() => import('./pages/auth/Signup'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));

// Lazy Loaded User pages
const UserDashboard = lazy(() => import('./pages/user/Dashboard'));
const UserProfile = lazy(() => import('./pages/user/Profile'));
const UpcomingEvents = lazy(() => import('./pages/user/UpcomingEvents'));
const Events = lazy(() => import('./pages/user/Events'));
const MyEvents = lazy(() => import('./pages/user/MyEvents'));
const Winners = lazy(() => import('./pages/user/Winners'));
const UserSettings = lazy(() => import('./pages/user/Settings'));

// Lazy Loaded Event Member pages
const MemberDashboard = lazy(() => import('./pages/member/Dashboard'));
const Scanner = lazy(() => import('./pages/member/Scanner'));
const MemberEvents = lazy(() => import('./pages/member/Events'));
const MemberMarks = lazy(() => import('./pages/member/Marks'));
const MemberProfile = lazy(() => import('./pages/member/Profile'));

// Lazy Loaded Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminUserDetails = lazy(() => import('./pages/admin/UserDetails'));
const AdminEvents = lazy(() => import('./pages/admin/Events'));
const AdminRegistrations = lazy(() => import('./pages/admin/Registrations'));
const AdminAttendance = lazy(() => import('./pages/admin/Attendance'));
const AdminMarks = lazy(() => import('./pages/admin/Marks'));
const AdminWinners = lazy(() => import('./pages/admin/Winners'));
const AdminEventMembers = lazy(() => import('./pages/admin/EventMembers'));
const AdminECards = lazy(() => import('./pages/admin/ECards'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));

// Lazy Loaded Public & Error pages
const VerifyCertificate = lazy(() => import('./pages/public/VerifyCertificate'));
const NotFound = lazy(() => import('./pages/public/NotFound'));
const ServerError = lazy(() => import('./pages/public/ServerError'));

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Landing & Events Showcase Portal */}
                <Route path="/" element={<PublicLanding />} />

                {/* Public certificate verification */}
                <Route path="/verify-certificate/:certificateId" element={<VerifyCertificate />} />
                <Route path="/verify/:certificateId" element={<VerifyCertificate />} />

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
                <Route path="/admin/users/:userId" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminUserDetails /></ProtectedRoute>} />
                <Route path="/admin/events" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminEvents /></ProtectedRoute>} />
                <Route path="/admin/registrations" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminRegistrations /></ProtectedRoute>} />
                <Route path="/admin/attendance" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminAttendance /></ProtectedRoute>} />
                <Route path="/admin/marks" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminMarks /></ProtectedRoute>} />
                <Route path="/admin/winners" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminWinners /></ProtectedRoute>} />
                <Route path="/admin/event-members" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminEventMembers /></ProtectedRoute>} />
                <Route path="/admin/e-cards" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminECards /></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminSettings /></ProtectedRoute>} />

                {/* Explicit error routes */}
                <Route path="/500" element={<ServerError />} />
                <Route path="/error" element={<ServerError />} />
                <Route path="/404" element={<NotFound />} />

                {/* 404 Catch-All */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
