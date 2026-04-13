import React, { useState, useEffect } from 'react';
import { useAuction } from '../contexts/AuctionContext';
import SplashScreen from '../components/SplashScreen';
import WaitingScreen from '../components/WaitingScreen';
import SplashScreen from '../components/SplashScreen';

export default function PublicView() {
    const { auctionState, currentPlayer, teams } = useAuction();
    const [showSplash, setShowSplash] = useState(true);

    // Convert teams object to array and sort by purse or name
    const teamsList = Object.values(teams || {});

    return (
        <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
            {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
            {/* Hero Section / Live Player */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
                {/* Main Stage */}
                <div className="lg:col-span-2 bg-auction-surface rounded-lg p-6 border border-white/10 flex flex-col items-center justify-center relative shadow-2xl">
                    {currentPlayer ? (
                        <>
                            <div className="absolute top-4 right-4 text-7xl font-black text-white/5 z-0">
                                {auctionState.timer}
                            </div>

                            <div className="z-10 text-center">
                                <img
                                    src={currentPlayer.photo}
                                    alt={currentPlayer.name}
                                    className="w-56 h-56 rounded-full border-4 border-auction-gold mx-auto mb-6 shadow-[0_0_50px_rgba(255,215,0,0.2)] object-cover"
                                />
                                <h2 className="text-6xl font-black text-white mb-2 tracking-tight">{currentPlayer.name}</h2>
                                <p className="text-3xl text-auction-gold mb-8 font-light uppercase tracking-widest">{currentPlayer.role}</p>

                                <div className="inline-block bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-8 min-w-[500px]">
                                    <div className="grid grid-cols-2 gap-12 text-center">
                                        <div>
                                            <p className="text-gray-400 uppercase text-sm tracking-wider mb-2">Current Bid</p>
                                            <p className="text-5xl font-mono text-green-400 font-bold">₹ {auctionState.current_bid.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 uppercase text-sm tracking-wider mb-2">Leading Team</p>
                                            <div className="flex items-center justify-center gap-2">
                                                {auctionState.current_bidder_team_id && teams[auctionState.current_bidder_team_id] ? (
                                                    <>
                                                        <img src={teams[auctionState.current_bidder_team_id].icon} className="w-8 h-8 rounded-full bg-white p-0.5" />
                                                        <span className="text-2xl text-white font-bold">{teams[auctionState.current_bidder_team_id].name}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-2xl text-gray-500">-</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {auctionState.status === 'SOLD' && (
                                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20 backdrop-blur-sm">
                                    <div className="text-center transform rotate-[-10deg]">
                                        <div className="text-9xl font-black text-red-600 border-8 border-red-600 px-12 py-4 rounded-xl shadow-[0_0_100px_rgba(255,0,0,0.5)]">SOLD</div>
                                        <div className="text-4xl text-white mt-4 font-bold">To {teams[auctionState.current_bidder_team_id]?.name || 'Unknown'}</div>
                                    </div>
                                </div>
                            )}

                            {auctionState.status === 'UNSOLD' && (
                                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20 backdrop-blur-sm">
                                    <div className="text-8xl font-black text-gray-500 border-8 border-gray-500 px-12 py-4 rounded-xl transform rotate-[10deg]">UNSOLD</div>
                                </div>
                            )}
                        </>
                    ) : (
                        <WaitingScreen />
                    )}
                </div>

                {/* Sidebar / Feed */}
                <div className="bg-auction-surface rounded-lg p-6 border border-white/10 flex flex-col">
                    <h2 className="text-xl font-bold text-auction-gold mb-4 uppercase tracking-wider border-b border-white/10 pb-4">Tournament Status</h2>

                    <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                        {teamsList.map(team => (
                            <div key={team.name} className="bg-black/20 p-3 rounded flex items-center justify-between border-l-4 border-transparent hover:border-auction-gold transition">
                                <div className="flex items-center gap-3">
                                    <img src={team.icon} className="w-8 h-8 rounded bg-white p-0.5" alt={team.name} />
                                    <div>
                                        <p className="font-bold text-sm text-gray-200">{team.name}</p>
                                        <p className="text-xs text-gray-500">{team.squad_count || 0} Players</p>
                                    </div>
                                </div>
                                <p className="text-green-400 font-mono text-sm">₹ {team.purse.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
