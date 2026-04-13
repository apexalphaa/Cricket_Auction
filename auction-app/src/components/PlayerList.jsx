import React, { useState } from 'react';

export default function PlayerList({ players, teams, onSelectPlayer, selectedPlayerId, className = "", columns = 1 }) {
    const [searchTerm, setSearchTerm] = useState("");

    const getTeamForPlayer = (playerId) => {
        if (!teams) return null;
        return Object.values(teams).find(t => t.squad && t.squad.includes(playerId));
    };

    // Tailwind JIT safe class lookup
    const gridColsClass = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-4',
    }[columns] || 'grid-cols-1';

    return (
        <div className={`bg-auction-surface rounded-xl border border-white/10 flex flex-col overflow-hidden ${className}`}>
            <div className="p-4 border-b border-white/10">
                <h3 className="font-bold text-auction-gold mb-2 uppercase tracking-wide">All Players</h3>
                <input
                    type="text"
                    placeholder="Search Player..."
                    className="w-full bg-black/40 border border-white/10 text-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-auction-gold transition"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    value={searchTerm}
                />
            </div>

            <div className={`flex-1 overflow-y-auto custom-scrollbar p-4 grid gap-6 content-start ${gridColsClass}`}>
                {['BATSMAN', 'BOWLER', 'ALL-ROUNDER'].map(category => {
                    const categoryPlayers = players.filter(p =>
                        p.role === category &&
                        p.name.toLowerCase().includes(searchTerm.toLowerCase())
                    );

                    // If we are in multi-column mode, we always show the column even if empty to maintain layout
                    if (columns === 1 && categoryPlayers.length === 0) return null;

                    return (
                        <div key={category} className="space-y-3 h-full">
                            <div className="sticky top-0 bg-auction-surface/95 backdrop-blur z-10 border-b border-white/5 pb-2">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{category}</h4>
                                <span className="text-[10px] text-gray-600 font-mono">{categoryPlayers.length} Players</span>
                            </div>

                            <div className="space-y-2">
                                {categoryPlayers.map(player => {
                                    const assignedTeam = getTeamForPlayer(player.id);

                                    return (
                                        <div
                                            key={player.id}
                                            onClick={() => {
                                                // Only block SOLD players. UNSOLD can be re-auctioned.
                                                if (player.status !== 'SOLD' && onSelectPlayer) {
                                                    onSelectPlayer(player.id);
                                                }
                                            }}
                                            className={`
                                                relative p-3 rounded-lg border flex items-center justify-between gap-3 group transition-all duration-200
                                                ${selectedPlayerId === player.id
                                                    ? 'bg-auction-gold text-black border-auction-gold shadow-[0_0_15px_rgba(255,215,0,0.3)] scale-[1.02] z-10'
                                                    : player.status === 'SOLD'
                                                        ? 'bg-black/20 border-white/5 opacity-75 cursor-not-allowed' // Removed grayscale, increased opacity for visibility
                                                        : 'bg-black/40 border-white/5 hover:bg-white/5 hover:border-white/20 text-gray-200 cursor-pointer hover:pl-4'}
                                            `}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                {/* Status Indicator */}
                                                <div className={`
                                                    w-2 h-2 rounded-full shrink-0
                                                    ${player.status === 'SOLD' ? 'bg-green-500 shadow-[0_0_8px_rgba(0,255,0,0.6)]' :
                                                        player.status === 'UNSOLD' ? 'bg-red-500' : 'bg-gray-500'}
                                                `}></div>

                                                <div className="truncate">
                                                    <span className="font-medium block truncate">{player.name}</span>
                                                </div>
                                            </div>

                                            {/* Sold Badge with Team Details */}
                                            {player.status === 'SOLD' && assignedTeam && (
                                                <div className="flex items-center gap-2 px-2 py-1 rounded max-w-[50%] border border-green-500/50 shrink-0 shadow-[0_0_10px_rgba(0,255,0,0.2)]" style={{ backgroundColor: '#16a34a' }}>
                                                    <img src={assignedTeam.icon} className="w-5 h-5 rounded-full bg-white p-0.5" alt={assignedTeam.name} />
                                                    <span className="text-[10px] text-white font-bold truncate hidden sm:inline-block">{assignedTeam.name}</span>
                                                    <span className="text-[10px] text-white font-mono font-bold">{(player.sold_price || 0) / 1000}k</span>
                                                </div>
                                            )}

                                            {/* Unsold Badge */}
                                            {player.status === 'UNSOLD' && (
                                                <span className="text-[10px] bg-red-900/30 text-red-400 border border-red-500/30 px-2 py-1 rounded uppercase font-bold shrink-0">
                                                    UNSOLD
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
