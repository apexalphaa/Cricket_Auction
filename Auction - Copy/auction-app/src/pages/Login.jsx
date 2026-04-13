import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/'); // Redirect to home/dashboard
        } catch (e) {
            setError('Failed to sign in: ' + e.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-auction-dark flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-auction-surface border border-white/10 p-8 rounded-lg shadow-2xl">
                <h2 className="text-3xl font-bold text-center text-white mb-6">
                    <span className="text-auction-gold">Owner</span> Login
                </h2>

                {error && (
                    <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded mb-4 flex items-center">
                        <AlertCircle size={18} className="mr-2" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-black/30 border border-white/20 rounded px-4 py-2 text-white focus:ring-2 focus:ring-auction-gold focus:outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-black/30 border border-white/20 rounded px-4 py-2 text-white focus:ring-2 focus:ring-auction-gold focus:outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-auction-gold to-yellow-600 text-black font-bold py-3 rounded hover:opacity-90 transition disabled:opacity-50"
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
