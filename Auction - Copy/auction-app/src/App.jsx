import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AuctionProvider } from './contexts/AuctionContext';

// Pages (Placeholders for now)
const Login = () => <div className="p-10 text-white">Login Page</div>;
const PublicView = () => <div className="p-10 text-white">Public View</div>;
const OwnerDashboard = () => <div className="p-10 text-white">Owner Dashboard</div>;
const AdminDashboard = () => <div className="p-10 text-white">Admin Dashboard</div>;

// Layout
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AuctionProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={<Layout />}>
              <Route index element={<PublicView />} />

              <Route element={<ProtectedRoute role="owner" />}>
                <Route path="/owner" element={<OwnerDashboard />} />
              </Route>

              <Route element={<ProtectedRoute role="admin" />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AuctionProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
