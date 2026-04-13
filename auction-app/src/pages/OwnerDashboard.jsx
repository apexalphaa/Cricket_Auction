import React from 'react';
import { useAuction } from '../contexts/AuctionContext';
import { useAuth } from '../contexts/AuthContext';
import { getNextBid, canBid } from '../lib/auctionEngine';

export default function OwnerDashboard() {
    const { auctionState, currentPlayer, teams, placeBid, allPlayers } = useAuction();
    const { currentUser } = useAuth();

    // Use authenticated team ID, fallback to URL for testing/admin debug, then default to t1
    // In production, currentUser.teamId should be the primary source for owners.
    const searchParams = new URLSearchParams(window.location.search);
    const myTeamId = currentUser?.teamId || searchParams.get('team');

    const myTeam = teams[myTeamId];

    const nextBidAmount = getNextBid(auctionState.current_bid);
    const { allowed, reason } = canBid(myTeam, auctionState.current_bid, nextBidAmount);

    const isMyBid = auctionState.current_bidder_team_id === myTeamId;
    const isLive = auctionState.status === "LIVE";

    const handleBid = () => {
        if (allowed && isLive && !isMyBid) {
            placeBid(myTeamId, nextBidAmount);
        }
    };

    if (!myTeam) return <div className="text-white">Loading Team Data...</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[calc(100vh-140px)] pb-20 md:pb-0">
            {/* Main Bidding Area */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-auction-surface border border-white/10 rounded-lg p-6 min-h-[400px] flex flex-col items-center justify-center relative shadow-2xl">
                    {currentPlayer ? (
                        <>
                            <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded text-sm text-gray-400">
                                LOT: {currentPlayer.id}
                            </div>

                            <img
                                src={currentPlayer.photo}
                                alt={currentPlayer.name}
                                className="w-48 h-48 rounded-full border-4 border-auction-gold mb-6 shadow-lg object-cover"
                            />

                            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 text-center">{currentPlayer.name}</h1>
                            <p className="text-xl md:text-2xl text-auction-gold mb-8">{currentPlayer.role}</p>

                            <div className="flex gap-4 md:gap-12 mb-8 items-end">
                                <div className="text-center">
                                    <p className="text-gray-400 text-xs md:text-sm mb-1">Base Price</p>
                                    <p className="text-xl md:text-2xl font-mono text-gray-300">₹ {currentPlayer.base_price.toLocaleString()}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-400 text-xs md:text-sm mb-1">Current Bid</p>
                                    <p className="text-3xl md:text-4xl font-mono text-green-400 animate-pulse">₹ {auctionState.current_bid.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Bid Button */}
                            <div className="flex flex-col items-center gap-2 w-full px-4">
                                {isLive ? (
                                    <button
                                        onClick={handleBid}
                                        disabled={!allowed || isMyBid}
                                        className={`
                                        text-xl md:text-2xl font-bold px-8 py-4 md:px-16 md:py-5 rounded-full shadow-[0_0_30px_rgba(255,215,0,0.5)] transition transform w-full md:w-auto
                                        ${!allowed || isMyBid
                                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed grayscale'
                                                : 'bg-auction-gold text-black hover:scale-105 active:scale-95'
                                            }
                                    `}
                                    >
                                        {isMyBid ? "YOU LEAD" : `BID ₹ ${nextBidAmount.toLocaleString()}`}
                                    </button>
                                ) : (
                                    <div className="bg-red-900/50 text-red-200 px-8 py-3 rounded text-xl font-bold border border-red-500">
                                        AUCTION PAUSED / WAITING
                                    </div>
                                )}

                                {!allowed && !isMyBid && isLive && (
                                    <span className="text-red-500 text-sm font-semibold">{reason}</span>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-gray-500 text-2xl">Waiting for next player...</div>
                    )}
                </div>
            </div>

            {/* Sidebar Status */}
            <div className="space-y-6 flex flex-col">
                <div className="bg-auction-surface border border-white/10 rounded-lg p-6 shadow-lg">
                    <div className="flex items-center gap-4 mb-4">
                        <img src={myTeam.icon} alt={myTeam.name} className="w-16 h-16 rounded bg-white p-1" />
                        <div>
                            <h2 className="text-xl font-bold text-white">{myTeam.name}</h2>
                            <span className="text-green-400 font-mono text-sm">OWNER DASHBOARD</span>
                        </div>
                    </div>

                    <hr className="border-white/10 my-4" />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/30 p-3 rounded">
                            <p className="text-gray-400 text-xs uppercase">Remaining Purse</p>
                            <p className="text-2xl font-mono text-green-400">₹ {myTeam.purse.toLocaleString()}</p>
                        </div>
                        <div className="bg-black/30 p-3 rounded">
                            <p className="text-gray-400 text-xs uppercase">Squad Size</p>
                            <p className="text-2xl font-mono text-white">{myTeam.squad_count || 0} <span className="text-sm text-gray-500">/ 14</span></p>
                        </div>
                    </div>
                </div>

                <div className="bg-auction-surface border border-white/10 rounded-lg p-6 flex-1 overflow-hidden flex flex-col">
                    <h3 className="font-bold text-white mb-4">My Squad</h3>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                        {/* Ideally fetch full player objects for squad IDs */}
                        {/* Ideally fetch full player objects for squad IDs */}
                        {myTeam.squad && myTeam.squad.map((pid, idx) => {
                            const player = allPlayers && allPlayers[pid];
                            if (!player) return null;

                            return (
                                <div key={idx} className="bg-black/20 p-3 rounded flex justify-between items-center border border-white/5 hover:border-white/10 transition">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${player.role === 'BATSMAN' ? 'bg-blue-400' : player.role === 'BOWLER' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white leading-none flex items-center gap-2">
                                                #{player.id} - {player.name}
                                                {player.isIcon && (
                                                    <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shadow-sm">
                                                        Icon
                                                    </span>
                                                )}
                                            </span>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">{player.role}</span>
                                        </div>
                                    </div>
                                    <span className="font-mono text-green-400 text-sm font-bold">₹ {(player.sold_price || 0).toLocaleString()}</span>
                                </div>
                            );
                        })}
                        {!myTeam.squad && <p className="text-gray-500 text-sm italic">No players yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
