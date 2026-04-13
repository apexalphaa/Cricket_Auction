import React, { useState, useEffect } from 'react';
import { useAuction } from '../contexts/AuctionContext';
import { initialPlayers, initialTeams } from '../data/initialData';
import { ref, set } from "firebase/database";
import { db } from "../lib/firebase";

export default function AdminDashboard() {
    const {
        auctionState,
        selectPlayer,
        adminStartAuction,
        adminPauseAuction,
        adminSoldPlayer,
        adminUnsoldPlayer,
        resetAuctionTimer,
        updateTimer,
        currentPlayer
    } = useAuction();

    const [localTimer, setLocalTimer] = useState(auctionState.timer);
    const [searchTerm, setSearchTerm] = useState("");

    // Sync with global timer
    useEffect(() => {
        setLocalTimer(auctionState.timer);
    }, [auctionState.timer]);

    // Timer Interval (Local driver for Admin)
    useEffect(() => {
        let interval;
        if (auctionState.status === "LIVE" && localTimer > 0) {
            interval = setInterval(() => {
                const newTime = localTimer - 1;
                setLocalTimer(newTime);
                // Optimize: Update DB every second or just rely on local loops for viewers?
                // Requirement: "Control timer". Admin drives the timer.
                // Better to update DB every second so viewers see it.
                updateTimer(newTime);
            }, 1000);
        } else if (localTimer === 0 && auctionState.status === "LIVE") {
            // Auto pause or just stop?
            // Keep it 0.
        }
        return () => clearInterval(interval);
    }, [auctionState.status, localTimer]);


    const handleSeedData = async () => {
        if (!confirm("This will overwrite all data. Continue?")) return;

        // Upload Teams
        await set(ref(db, "teams"), initialTeams);

        // Upload Players (Convert array to object)
        const playersObj = {};
        initialPlayers.forEach(p => playersObj[p.id] = p);
        await set(ref(db, "players"), playersObj);

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

    const unsoldPlayers = initialPlayers.filter(p => !p.status || p.status === 'UNSOLD'); // Simple filter, ideally fetch from DB status
    // Note: initialPlayers is static. We should read from DB for status updates.
    // Implementing a real listener for player list is heavy, so we might optimistically update or use a separate listener.
    // For now, let's just show all and rely on Admin to know.

    return (
        <div className="flex gap-6 h-[calc(100vh-140px)]">
            <aside className="w-80 bg-auction-surface p-4 rounded-lg border border-white/10 overflow-y-auto flex flex-col">
                <h3 className="font-bold text-auction-gold mb-4 text-xl">Controls</h3>

                <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                        onClick={adminStartAuction}
                        disabled={auctionState.status === "LIVE"}
                        className="bg-green-600 text-white py-2 rounded hover:bg-green-500 disabled:opacity-50"
                    >Start</button>
                    <button
                        onClick={adminPauseAuction}
                        className="bg-red-600 text-white py-2 rounded hover:bg-red-500"
                    >Pause</button>
                    <button
                        onClick={resetAuctionTimer}
                        className="bg-blue-600 text-white py-2 rounded hover:bg-blue-500 col-span-2"
                    >Reset Timer (60s)</button>
                </div>

                <div className="border-t border-white/10 pt-4 mb-4">
                    <h4 className="text-white mb-2">Outcome</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={adminSoldPlayer}
                            className="bg-auction-gold text-black font-bold py-2 rounded hover:brightness-110"
                        >SOLD</button>
                        <button
                            onClick={adminUnsoldPlayer}
                            className="bg-gray-600 text-white py-2 rounded hover:bg-gray-500"
                        >UNSOLD</button>
                    </div>
                </div>

                <button onClick={handleSeedData} className="mt-auto bg-red-900/50 text-red-200 text-xs py-1 rounded">
                    Reset / Seed DB
                </button>

                <hr className="border-white/10 my-4" />

                <h3 className="font-bold text-auction-gold mb-2">Select Player</h3>
                <input
                    type="text"
                    placeholder="Search..."
                    className="w-full bg-black/30 text-white px-2 py-1 rounded mb-2 text-sm"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="flex-1 overflow-y-auto space-y-1">
                    {initialPlayers.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(player => (
                        <div
                            key={player.id}
                            onClick={() => selectPlayer(player.id)}
                            className={`p-2 rounded cursor-pointer text-sm flex justify-between items-center ${auctionState.current_player_id === player.id ? 'bg-auction-gold text-black' : 'bg-black/20 hover:bg-black/40 text-gray-300'}`}
                        >
                            <span>{player.name}</span>
                            <span className="text-xs opacity-70">{player.role}</span>
                        </div>
                    ))}
                </div>
            </aside>

            <div className="flex-1 flex flex-col gap-6">
                <div className="bg-auction-surface p-6 rounded-lg border border-white/10 flex-1 flex flex-col items-center justify-center relative overflow-hidden">
                    {currentPlayer ? (
                        <>
                            <div className="z-10 text-center">
                                <img
                                    src={currentPlayer.photo}
                                    alt={currentPlayer.name}
                                    className="w-48 h-48 rounded-full border-4 border-auction-gold mx-auto mb-4 object-cover shadow-[0_0_30px_rgba(255,215,0,0.3)]"
                                />
                                <h2 className="text-4xl font-bold text-white mb-2">{currentPlayer.name}</h2>
                                <p className="text-xl text-auction-gold mb-6">{currentPlayer.role}</p>

                                <div className="grid grid-cols-2 gap-8 text-left bg-black/30 p-6 rounded-xl min-w-[400px]">
                                    <div>
                                        <p className="text-gray-400 text-sm">Base Price</p>
                                        <p className="text-2xl font-mono text-white">₹ {currentPlayer.base_price?.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Current Bid</p>
                                        <p className="text-4xl font-mono text-green-400">₹ {auctionState.current_bid?.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Timer Overlay */}
                            <div className="absolute top-4 right-4 text-6xl font-black text-white/10">
                                {auctionState.timer}
                            </div>

                            {auctionState.status === 'LIVE' && (
                                <div className="absolute inset-0 border-4 border-green-500/30 rounded-lg pointer-events-none animate-pulse"></div>
                            )}
                        </>
                    ) : (
                        <div className="text-gray-500 text-xl">Select a player to start</div>
                    )}
                </div>

                <div className="bg-auction-surface p-6 rounded-lg border border-white/10 h-1/3 overflow-y-auto">
                    <h3 className="font-bold text-gray-400 mb-2">Live Logs / Debug</h3>
                    <pre className="text-xs text-green-300 font-mono">
                        {JSON.stringify(auctionState, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
}
