import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps a route so it's only reachable when logged in, and optionally
 * only for a specific role.
 *
 * Usage:
 *   <ProtectedRoute><Dashboard /></ProtectedRoute>
 *   <ProtectedRoute role="admin"><AdminPanel /></ProtectedRoute>
 */
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) return null; // could show a spinner here

  if (!user) return <Navigate to="/login" replace />;

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
