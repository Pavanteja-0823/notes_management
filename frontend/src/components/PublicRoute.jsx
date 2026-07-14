import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Public Route - redirects to dashboard if already authenticated
 */
export default function PublicRoute({ children }) {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
