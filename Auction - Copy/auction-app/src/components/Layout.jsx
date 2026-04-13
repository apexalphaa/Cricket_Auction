import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function Layout() {
    return (
        <div className="min-h-screen bg-auction-dark flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-6">
                <Outlet />
            </main>
            <footer className="bg-black/50 border-t border-white/10 py-4 text-center text-gray-400 text-sm">
                <p>&copy; {new Date().getFullYear()} Premier League Auction. All rights reserved.</p>
            </footer>
        </div>
    );
}
