import React, { useState } from 'react';
import { useAuction } from '../contexts/AuctionContext';
import SplashScreen from '../components/SplashScreen';
import WaitingScreen from '../components/WaitingScreen';
import PlayerList from '../components/PlayerList';
import StatsBoard from '../components/StatsBoard';
import { initialPlayers } from '../data/initialData';

export default function PublicView() {
    const { auctionState, currentPlayer, teams, allPlayers } = useAuction();
    const [showSplash, setShowSplash] = useState(true);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [activeTab, setActiveTab] = useState('teams');

    // Convert teams object to array and sort by purse or name
    const teamsList = Object.values(teams || {});

    // Helper to get player details
    const getSquadDetails = (team) => {
        if (!team.squad) return [];
        const players = team.squad.map(playerId => allPlayers && allPlayers[playerId]).filter(Boolean);
        // Sort: Icons first, then by ID or name if needed (optional stable sort)
        return players.sort((a, b) => (b.isIcon ? 1 : 0) - (a.isIcon ? 1 : 0));
    };

    const mergedPlayers = React.useMemo(() => {
        return initialPlayers.map(p => {
            const liveData = allPlayers && allPlayers[p.id] ? allPlayers[p.id] : {};
            return { ...p, ...liveData };
        });
    }, [allPlayers]);

    return (
        <div className="space-y-6 min-h-[calc(100vh-100px)] flex flex-col relative w-full overflow-x-hidden pb-20 md:pb-0">
            {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

            {/* Team Details Modal */}
            {selectedTeam && (
                <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedTeam(null)}>
                    <div className="bg-auction-surface border border-white/20 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
                            <div className="flex items-center gap-4">
                                <img src={selectedTeam.icon} className="w-16 h-16 rounded-full bg-white p-1" />
                                <div>
                                    <h2 className="text-3xl font-bold text-white uppercase tracking-wide">{selectedTeam.name}</h2>
                                    <p className="text-auction-gold font-mono text-xl">Purse: ₹ {selectedTeam.purse.toLocaleString()}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedTeam(null)} className="text-gray-400 hover:text-white transition">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content - Player List */}
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gradient-to-br from-gray-900 to-black">
                            {getSquadDetails(selectedTeam).length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {getSquadDetails(selectedTeam).map((player) => (
                                        <div key={player.id} className="bg-white/5 p-4 rounded-lg flex items-center gap-4 border border-white/5 hover:bg-white/10 transition">
                                            <img src={player.photo} className="w-16 h-16 rounded-full object-cover border-2 border-gray-600" />
                                            <div className="flex-1">
                                                <h3 className="text-white font-bold text-lg">{player.name}</h3>
                                                <p className="text-xs text-gray-400 uppercase">{player.role}</p>
                                            </div>
                                            <div className="text-right">
                                                {player.isIcon ? (
                                                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-black px-3 py-1 rounded font-bold uppercase text-xs tracking-wider shadow-lg">
                                                        ICON PLAYER
                                                    </div>
                                                ) : (
                                                    <>
                                                        <p className="text-xs text-green-500 uppercase tracking-wider">Sold For</p>
                                                        <p className="text-xl font-mono text-green-400 font-bold">₹ {player.sold_price?.toLocaleString() || "-"}</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 py-12 text-xl">
                                    No players bought yet.
                                </div>
                            )}
                        </div>

                        {/* Footer Stats */}
                        <div className="p-4 bg-black/40 border-t border-white/10 flex justify-between px-8">
                            <div className="text-center">
                                <span className="block text-xs text-gray-400 uppercase">Squad Size</span>
                                <span className="text-2xl font-bold text-white">{selectedTeam.squad_count || 0} / 14</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-xs text-gray-400 uppercase">Remaining Purse</span>
                                <span className="text-2xl font-bold text-green-400">₹ {selectedTeam.purse.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* Hero Section / Live Player */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow min-h-0">
                {/* Main Stage */}
                <div className="lg:col-span-2 bg-auction-surface rounded-lg p-6 border border-white/10 flex flex-col items-center justify-center relative shadow-2xl overflow-hidden h-full max-h-full">
                    {currentPlayer && currentPlayer.id && (auctionState.status === 'LIVE' || auctionState.status === 'PAUSED' || auctionState.status === 'WAITING') ? (
                        <>
                            <div className="absolute top-4 right-4 text-7xl font-black text-white/5 z-0">
                                {auctionState.timer}
                            </div>
                            {/* ... (rest of live player code) ... */}
                            <div className="z-10 text-center">
                                <img
                                    src={currentPlayer.photo}
                                    alt={currentPlayer.name}
                                    className="w-56 h-56 rounded-full border-4 border-auction-gold mx-auto mb-6 shadow-[0_0_50px_rgba(255,215,0,0.2)] object-cover"
                                />
                                <h2 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tight">{currentPlayer.name}</h2>
                                <p className="text-xl md:text-3xl text-auction-gold mb-8 font-light uppercase tracking-widest">{currentPlayer.role}</p>

                                <div className="inline-block bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 md:p-8 w-full max-w-[500px]">
                                    <div className="grid grid-cols-2 gap-4 md:gap-12 text-center items-start">
                                        <div>
                                            <p className="text-gray-400 uppercase text-xs md:text-sm tracking-wider mb-2">Current Bid</p>
                                            <p className="text-3xl md:text-5xl font-mono text-green-400 font-bold">₹ {auctionState.current_bid.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 uppercase text-xs md:text-sm tracking-wider mb-2">Leading Team</p>
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                {auctionState.current_bidder_team_id && teams[auctionState.current_bidder_team_id] ? (
                                                    <>
                                                        <div className="flex items-center gap-2 md:gap-3">
                                                            <img src={teams[auctionState.current_bidder_team_id].icon} className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-white p-1" />
                                                            <span className="text-xl md:text-3xl text-white font-bold">{teams[auctionState.current_bidder_team_id].name}</span>
                                                        </div>
                                                        {/* Squad Preview for Leading Team */}
                                                        <div className="mt-4 bg-white/5 rounded p-3 w-full max-w-[250px] text-left">
                                                            <p className="text-xs text-gray-400 mb-1 uppercase">Current Squad ({teams[auctionState.current_bidder_team_id].squad_count || 0})</p>
                                                            <div className="text-xs text-gray-300 max-h-[100px] overflow-y-auto flex flex-wrap gap-1">
                                                                {(teams[auctionState.current_bidder_team_id].squad || []).map((pid, idx) => (
                                                                    <span key={idx} className="bg-white/10 px-1 rounded">#{pid}</span>
                                                                ))}
                                                            </div>
                                                        </div>
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
                                <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50 backdrop-blur-md animate-in fade-in duration-300">
                                    <div className="text-center">
                                        <div className="text-6xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600 mb-8 tracking-tighter drop-shadow-2xl animate-pulse">
                                            SOLD
                                        </div>

                                        {auctionState.current_bidder_team_id && teams[auctionState.current_bidder_team_id] && (
                                            <div className="flex flex-col items-center bg-white/5 p-12 rounded-3xl border border-white/10 shadow-2xl transform scale-110 transition-all">
                                                <img
                                                    src={teams[auctionState.current_bidder_team_id].icon}
                                                    className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-white p-2 mb-6 shadow-[0_0_50px_rgba(255,255,255,0.2)]"
                                                />
                                                <h3 className="text-2xl md:text-4xl text-gray-400 font-light uppercase tracking-widest mb-2">Sold To</h3>
                                                <h2 className="text-4xl md:text-6xl text-white font-black mb-6">{teams[auctionState.current_bidder_team_id].name}</h2>
                                                <div className="bg-green-600 text-black font-mono font-bold text-3xl md:text-5xl px-8 py-3 rounded-full shadow-lg">
                                                    ₹ {auctionState.current_bid.toLocaleString()}
                                                </div>
                                            </div>
                                        )}
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
                        <StatsBoard
                            allPlayers={mergedPlayers}
                            teams={teams}
                            auctionState={auctionState}
                            className="h-full w-full bg-black/50 border-none"
                        />
                    )}
                </div>

                {/* Sidebar / Feed */}
                {/* Sidebar - Teams & Players */}
                {/* Sidebar / Feed */}
                {/* Sidebar - Teams & Players */}
                <div className="bg-black/20 backdrop-blur-sm border-l border-white/10 flex flex-col h-full max-h-full min-h-0 overflow-hidden">
                    <div className="p-4 border-b border-white/10 flex gap-2 shrink-0">
                        <button
                            onClick={() => setActiveTab('teams')}
                            className={`flex-1 py-2 font-bold uppercase text-xs tracking-wider rounded transition-colors ${activeTab === 'teams' ? 'bg-auction-gold text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                        >
                            Teams
                        </button>
                        <button
                            onClick={() => setActiveTab('players')}
                            className={`flex-1 py-2 font-bold uppercase text-xs tracking-wider rounded transition-colors ${activeTab === 'players' ? 'bg-auction-gold text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                        >
                            Players
                        </button>
                    </div>

                    {activeTab === 'teams' ? (
                        <div className="space-y-4 overflow-y-auto p-4 custom-scrollbar flex-1 min-h-0">
                            {teamsList.map(team => (
                                <div
                                    key={team.name}
                                    onClick={() => setSelectedTeam(team)}
                                    className="bg-black/40 p-4 rounded-xl flex flex-col gap-2 border border-white/5 hover:border-auction-gold/50 transition duration-300 cursor-pointer hover:bg-white/5 active:scale-95"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <img src={team.icon} className="w-10 h-10 rounded bg-white p-0.5 shadow" alt={team.name} />
                                            <div>
                                                <h4 className="font-bold text-white leading-tight">{team.name}</h4>
                                                <span className="text-[10px] text-gray-400 uppercase tracking-wider"> Purse: ₹{(team.purse / 1000).toFixed(1)}k</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-2xl font-bold text-white/20">{team.squad_count || 0}</span>
                                        </div>
                                    </div>
                                    {/* Mini Squad Indicators */}
                                    <div className="flex gap-1 h-1 mt-2">
                                        {Array.from({ length: 14 }).map((_, i) => (
                                            <div key={i} className={`flex-1 rounded-full ${i < (team.squad_count || 0) ? 'bg-green-500' : 'bg-white/10'}`}></div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                            <PlayerList
                                players={mergedPlayers}
                                teams={teams}
                                className="border-none bg-transparent"
                                onSelectPlayer={null} // Viewer can't select, just view
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
