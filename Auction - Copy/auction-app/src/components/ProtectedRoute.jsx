import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ role }) {
    const { currentUser, userRole, loading } = useAuth();

    if (loading) return <div className="text-white">Loading...</div>;

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    // Admin has access to everywhere, technically? Or stricter?
    // If role is required, check it.
    if (role && userRole !== role && userRole !== 'admin') {
        // If owner tries to access admin, kick them.
        // If admin tries to access owner, allow it (for testing)? Or maybe not.
        // Let's be strict for now.
        if (role === 'owner' && userRole === 'admin') return <Outlet />; // Admin can view owner view?
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
