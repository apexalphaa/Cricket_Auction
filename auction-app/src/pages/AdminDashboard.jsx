import React, { useEffect } from 'react';
import { useAuction } from '../contexts/AuctionContext';
import { initialPlayers, initialTeams } from '../data/initialData';
import { ref, set } from "firebase/database";
import { db } from "../lib/firebase";
import PlayerList from '../components/PlayerList';

export default function AdminDashboard() {
    const {
        auctionState,
        selectPlayer,
        adminStartAuction,
        adminPauseAuction,
        adminResumeAuction,
        adminSoldPlayer,
        adminUnsoldPlayer,
        resetAuctionTimer,
        updateTimer,
        currentPlayer,
        teams,
        allPlayers // Destructure allPlayers to stop crash
    } = useAuction();

    const mergedPlayers = React.useMemo(() => {
        return initialPlayers.map(p => {
            const liveData = allPlayers[p.id] || {};
            // Ensure status is correctly passed. 
            // If liveData is empty, status is undefined => Clickable.
            // If liveData has status 'SOLD' => Not Clickable.
            return { ...p, ...liveData };
        });
    }, [allPlayers]);


    // const [localTimer, setLocalTimer] = useState(auctionState.timer);
    // const [searchTerm, setSearchTerm] = useState("");

    // Timer Interval (Local driver for Admin)
    useEffect(() => {
        let timerId;
        if (auctionState.status === "LIVE" && auctionState.timer > 0) {
            timerId = setTimeout(() => {
                // Optimize: Update DB every second or just rely on local loops for viewers?
                // Requirement: "Control timer". Admin drives the timer.
                // Better to update DB every second so viewers see it.
                updateTimer(auctionState.timer - 1);
            }, 1000);
        } else if (auctionState.status === "LIVE" && auctionState.timer === 0) {
            // Timer ran out! Auto-decide.
            if (auctionState.current_bidder_team_id) {
                // Has a bid -> SOLD
                adminSoldPlayer();
            } else {
                // No bid -> UNSOLD
                adminUnsoldPlayer();
            }
        }
        return () => clearTimeout(timerId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auctionState.status, auctionState.timer, auctionState.current_bidder_team_id]);


    const handleSeedData = async () => {
        if (!confirm("This will overwrite all data. Continue?")) return;

        // Upload Teams
        await set(ref(db, "teams"), initialTeams);

        // Upload Players (Convert array to object)
        const playersObj = {};
        initialPlayers.forEach(p => playersObj[p.id] = p);
        await set(ref(db, "players"), playersObj);

        // Upload Owners (Email-based mapping for easy access without UIDs)
        // Firebase keys cannot contain '.', '#', '$', '[', or ']'. We replace '.' with ','
        const initialOwners = {
            "ankit,sharma,cd,civ21@itbhu,ac,in": { role: "owner", teamId: "t1" }
        };
        await set(ref(db, "owners"), initialOwners);

        // Reset State
        await set(ref(db, "state"), {
            status: "WAITING",
            current_player_id: null,
            current_bid: 0,
            current_bidder_team_id: null,
            timer: 60
        });
        alert("Data Seeded!");
    };

    // const unsoldPlayers = initialPlayers.filter(p => !p.status || p.status === 'UNSOLD'); // Simple filter, ideally fetch from DB status
    // Note: initialPlayers is static. We should read from DB for status updates.
    // Implementing a real listener for player list is heavy, so we might optimistically update or use a separate listener.
    // For now, let's just show all and rely on Admin to know.

    return (
        <div className="flex gap-6 h-[calc(100vh-140px)]">
            <aside className="w-80 bg-auction-surface p-4 rounded-lg border border-white/10 flex flex-col shrink-0">
                {/* Dynamic Controls Header */}
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                    <h3 className="font-black text-transparent bg-clip-text bg-gradient-to-r from-auction-gold to-yellow-200 text-2xl uppercase tracking-widest">
                        Admin Controls
                    </h3>
                    <button
                        onClick={handleSeedData}
                        className="bg-zinc-800 text-zinc-400 text-[10px] px-3 py-1.5 rounded-full hover:bg-red-900/50 hover:text-red-200 transition-colors uppercase tracking-wider"
                    >
                        Reset DB
                    </button>
                </div>

                {/* Main Action Area */}
                <div className="space-y-4">
                    {/* Big START / RESUME Button Wrapper */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                        {auctionState.status === 'PAUSED' ? (
                            <button
                                onClick={adminResumeAuction}
                                className="relative w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-xl py-6 rounded-lg shadow-xl hover:translate-y-[-2px] hover:shadow-2xl transition-all uppercase tracking-widest flex items-center justify-center gap-3 overflow-hidden"
                            >
                                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                                <span className="relative z-10">RESUME AUCTION</span>
                                <svg className="w-6 h-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </button>
                        ) : auctionState.status === 'LIVE' ? (
                            <button
                                onClick={adminPauseAuction}
                                className="relative w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-black text-xl py-6 rounded-lg shadow-xl hover:translate-y-[-2px] hover:shadow-2xl transition-all uppercase tracking-widest flex items-center justify-center gap-3"
                            >
                                <span className="animate-pulse">PAUSE AUCTION</span>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </button>
                        ) : (
                            <button
                                onClick={adminStartAuction}
                                className="relative w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xl py-6 rounded-lg shadow-xl hover:translate-y-[-2px] hover:shadow-2xl transition-all uppercase tracking-widest flex items-center justify-center gap-3"
                            >
                                <span>START AUCTION</span>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </button>
                        )}
                    </div>

                    <button
                        onClick={resetAuctionTimer}
                        className="w-full bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold py-3 rounded hover:bg-zinc-700 transition flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        RESET TIMER (120s)
                    </button>
                </div>

                <div className="bg-black/20 rounded-xl p-4 border border-white/5 mt-6">
                    <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 text-center">Decision</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={adminSoldPlayer}
                            className="bg-gradient-to-br from-auction-gold to-yellow-600 text-black font-black py-4 rounded-lg shadow-lg hover:brightness-110 active:scale-95 transition-all flex flex-col items-center justify-center gap-1 group"
                        >
                            <span className="text-lg">SOLD</span>
                            <span className="text-[10px] opacity-70 group-hover:opacity-100">TO HIGHEST BIDDER</span>
                        </button>
                        <button
                            onClick={adminUnsoldPlayer}
                            className="bg-gradient-to-br from-gray-700 to-gray-800 text-white font-black py-4 rounded-lg shadow-lg hover:bg-gray-700 active:scale-95 transition-all flex flex-col items-center justify-center gap-1 border border-white/10"
                        >
                            <span className="text-lg">UNSOLD</span>
                            <span className="text-[10px] opacity-50">NO BIDS</span>
                        </button>
                    </div>
                </div>
            </aside>

            <div className="flex-1 flex flex-col gap-6 min-h-0">
                <div className="bg-auction-surface p-6 rounded-lg border border-white/10 flex-[0.5] flex flex-col items-center justify-center relative overflow-hidden min-h-0">
                    {currentPlayer ? (
                        <>
                            <div className="z-10 text-center relative w-full h-full flex flex-col items-center justify-center">
                                {/* Sold/Unsold Overlay for Admin */}
                                {/* Sold/Unsold Overlay for Admin */}
                                {auctionState.status === 'SOLD' && auctionState.last_sold_to && teams[auctionState.last_sold_to] ? (
                                    <div className="animate-in zoom-in duration-300 flex flex-col items-center">
                                        <div className="text-6xl font-black text-green-500 mb-4 drop-shadow-[0_0_10px_rgba(0,255,0,0.5)]">SOLD</div>
                                        <img
                                            src={teams[auctionState.last_sold_to].icon}
                                            className="w-32 h-32 rounded-full bg-white p-2 mb-4 shadow-2xl"
                                        />
                                        <h2 className="text-4xl font-bold text-white mb-2">{teams[auctionState.last_sold_to].name}</h2>
                                        <p className="text-2xl text-auction-gold font-mono">₹ {auctionState.current_bid.toLocaleString()}</p>
                                    </div>
                                ) : auctionState.status === 'UNSOLD' ? (
                                    <div className="animate-in zoom-in duration-300">
                                        <div className="text-6xl font-black text-gray-500 border-4 border-gray-500 px-8 py-2 rounded transform rotate-[-5deg]">UNSOLD</div>
                                        <p className="text-white mt-4 text-xl">Better luck next time!</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-8 w-full h-full px-8">
                                            {/* Left: Image */}
                                            <div className="shrink-0 relative">
                                                <div className="absolute inset-0 bg-auction-gold/20 blur-xl rounded-full animate-pulse"></div>
                                                <img
                                                    src={currentPlayer.photo}
                                                    alt={currentPlayer.name}
                                                    className="w-56 h-56 rounded-full border-4 border-auction-gold object-cover shadow-[0_0_30px_rgba(255,215,0,0.3)] relative z-10"
                                                />
                                            </div>

                                            {/* Right: Details */}
                                            <div className="flex-1 text-left space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h2 className="text-5xl font-black text-white leading-tight uppercase tracking-tight">{currentPlayer.name}</h2>
                                                        <p className="text-2xl text-auction-gold font-light uppercase tracking-widest">{currentPlayer.role}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-8 bg-black/40 p-6 rounded-xl border border-white/5">
                                                    <div>
                                                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Base Price</p>
                                                        <p className="text-3xl font-mono text-white font-bold">₹ {currentPlayer.base_price?.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Current Bid</p>
                                                        <p className="text-4xl font-mono text-green-400 font-bold">₹ {auctionState.current_bid?.toLocaleString()}</p>
                                                    </div>
                                                    {/* Highest Bidder - Now beside Current Bid */}
                                                    <div>
                                                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Highest Bidder</p>
                                                        {auctionState.current_bidder_team_id && teams[auctionState.current_bidder_team_id] ? (
                                                            <div className="flex items-center gap-3">
                                                                <img
                                                                    src={teams[auctionState.current_bidder_team_id].icon}
                                                                    alt={teams[auctionState.current_bidder_team_id].name}
                                                                    className="w-10 h-10 rounded bg-white p-1 border border-white/20"
                                                                />
                                                                <span className="text-xl font-bold text-white uppercase leading-tight">
                                                                    {teams[auctionState.current_bidder_team_id].name}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <p className="text-gray-600 text-lg italic mt-1">Waiting for bid...</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Timer Overlay - Clock Style */}
                            {auctionState.status !== 'SOLD' && auctionState.status !== 'UNSOLD' && (
                                <div className={`
                                    absolute top-4 right-4 w-24 h-24 rounded-full border-4 flex items-center justify-center bg-black/50 backdrop-blur-md shadow-2xl transition-all duration-300
                                    ${auctionState.timer <= 10
                                        ? 'border-red-500 text-red-500 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)] scale-110'
                                        : 'border-auction-gold text-white'}
                                `}>
                                    <div className="flex flex-col items-center">
                                        {/* Minimal Clock Icon */}
                                        <div className="w-1 h-1 rounded-full mb-1 opacity-50 bg-current"></div>
                                        <span className={`text-4xl font-black font-mono leading-none ${auctionState.timer <= 10 ? 'scale-110' : ''}`}>
                                            {auctionState.timer}
                                        </span>
                                        <span className="text-[8px] uppercase tracking-widest opacity-70">Sec</span>
                                    </div>

                                    {/* Progress Ring (Simple decorative) */}
                                    <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                                        <circle
                                            className="text-white/5"
                                            strokeWidth="4"
                                            stroke="currentColor"
                                            fill="transparent"
                                            r="44"
                                            cx="48"
                                            cy="48"
                                        />
                                        <circle
                                            className={auctionState.timer <= 10 ? 'text-red-500' : 'text-auction-gold'}
                                            strokeWidth="4"
                                            strokeDasharray={276}
                                            strokeDashoffset={276 - (276 * auctionState.timer) / 60}
                                            strokeLinecap="round"
                                            stroke="currentColor"
                                            fill="transparent"
                                            r="44"
                                            cx="48"
                                            cy="48"
                                            style={{ transition: 'stroke-dashoffset 1s linear' }}
                                        />
                                    </svg>
                                </div>
                            )}

                            {auctionState.status === 'LIVE' && (
                                <div className="absolute inset-0 border-4 border-green-500/30 rounded-lg pointer-events-none animate-pulse"></div>
                            )}
                        </>
                    ) : (
                        <div className="text-gray-500 text-xl">Select a player to start</div>
                    )}
                </div>

                {/* Player Selection Area - Moved from Sidebar */}
                {/* Player Selection Area - New Shared Component */}
                <PlayerList
                    players={mergedPlayers}
                    teams={teams}
                    onSelectPlayer={(id) => {
                        console.log("Clicked player:", id);
                        selectPlayer(id);
                    }}
                    selectedPlayerId={auctionState.current_player_id}
                    className="flex-[0.5] min-h-0"
                    columns={3}
                />
            </div>
        </div>
    );
}
