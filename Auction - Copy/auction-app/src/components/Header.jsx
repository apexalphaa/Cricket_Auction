import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Trophy } from 'lucide-react';

export default function Header() {
    const { currentUser, logout, userRole } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    return (
        <header className="bg-gradient-to-r from-auction-red to-red-900 border-b-2 border-auction-gold shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* Logo / Title */}
                    <Link to="/" className="flex items-center space-x-3">
                        <div className="relative group">
                            <img src="/src/assets/logo.jpg" alt="SPL Logo" className="h-12 w-12 rounded-full border-2 border-auction-gold shadow-[0_0_10px_rgba(255,215,0,0.5)] group-hover:scale-110 transition duration-300 object-cover" />
                            <div className="absolute inset-0 rounded-full bg-auction-gold opacity-0 group-hover:opacity-20 animate-ping"></div>
                        </div>
                        <span className="text-xl font-bold text-white tracking-widest uppercase italic hidden md:block">
                            Sambalpur<span className="text-auction-gold">PremierLeague</span>
                        </span>
                    </Link>

                    {/* Navigation / User Info */}
                    <div className="flex items-center space-x-4">
                        {currentUser ? (
                            <>
                                <div className="hidden md:flex flex-col text-right mr-4">
                                    <span className="text-sm text-auction-gold font-semibold uppercase">{userRole} MODE</span>
                                    <span className="text-xs text-gray-300 truncate max-w-[150px]">{currentUser.email}</span>
                                </div>

                                {userRole === 'admin' && (
                                    <Link to="/admin" className="px-3 py-1 bg-black/30 rounded hover:bg-black/50 text-sm text-white transition">
                                        Admin
                                    </Link>
                                )}
                                {userRole === 'owner' && (
                                    <Link to="/owner" className="px-3 py-1 bg-black/30 rounded hover:bg-black/50 text-sm text-white transition">
                                        Dashboard
                                    </Link>
                                )}

                                <button
                                    onClick={handleLogout}
                                    className="p-2 rounded-full hover:bg-white/10 text-white transition"
                                    title="Logout"
                                >
                                    <LogOut size={20} />
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="text-white hover:text-auction-gold font-medium">
                                Owner Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
