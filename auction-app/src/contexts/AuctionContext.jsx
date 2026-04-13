import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { db } from "../lib/firebase";
import { ref, onValue, update, push, runTransaction } from "firebase/database";
import { initialPlayers } from "../data/initialData";

const AuctionContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function useAuction() {
    return useContext(AuctionContext);
}

export function AuctionProvider({ children }) {
    const [auctionState, setAuctionState] = useState({
        status: "WAITING", // WAITING, LIVE, PAUSED, COMPLETED, UNSOLD, SOLD
        current_player_id: null,
        current_bid: 0,
        current_bidder_team_id: null,
        timer: 60,
    });

    // const [currentPlayer, setCurrentPlayer] = useState(null);
    const [teams, setTeams] = useState({});
    const [isConnected, setIsConnected] = useState(false);

    // Connection Listener
    useEffect(() => {
        const connectedRef = ref(db, ".info/connected");
        const unsubscribe = onValue(connectedRef, (snap) => {
            setIsConnected(!!snap.val());
        });
        return unsubscribe;
    }, []);

    // Global State Listener
    useEffect(() => {
        const stateRef = ref(db, "state");
        const unsubscribe = onValue(stateRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setAuctionState(prev => ({
                    ...prev,
                    ...data,
                    // Firebase removes keys with null values. We must explicitly set them to null in state if missing in data.
                    current_bidder_team_id: data.current_bidder_team_id || null,
                    current_player_id: data.current_player_id || null
                }));
            }
        });
        return unsubscribe;
    }, []);

    // Teams Listener
    useEffect(() => {
        const teamsRef = ref(db, "teams");
        const unsubscribe = onValue(teamsRef, (snapshot) => {
            if (snapshot.exists()) {
                setTeams(snapshot.val());
            } else {
                setTeams({});
            }
        });
        return unsubscribe;
    }, []);

    // All Players Listener (For Leaderboards & Status)
    const [allPlayers, setAllPlayers] = useState({});
    useEffect(() => {
        const playersRef = ref(db, "players");
        const unsubscribe = onValue(playersRef, (snapshot) => {
            if (snapshot.exists()) {
                setAllPlayers(snapshot.val());
            } else {
                setAllPlayers({});
            }
        });
        return unsubscribe;
    }, []);

    // Derived Current Player
    const currentPlayer = useMemo(() => {
        return auctionState.current_player_id && allPlayers[auctionState.current_player_id]
            ? allPlayers[auctionState.current_player_id]
            : null;
    }, [auctionState.current_player_id, allPlayers]);


    // --- ACTIONS (Admin Only mostly, but owner places bid) ---

    const placeBid = async (teamId, amount) => {
        // Basic validation handled here, but rules also enforce this
        // Calculation of next bid amount happens on UI or Service layer, 
        // but ultimately valid bid is committed to DB.
        try {
            await update(ref(db, "state"), {
                current_bid: amount,
                current_bidder_team_id: teamId,
                timer: 60, // Reset timer on new bid (optional rule, but standard)
                last_activity: Date.now()
            });

            // Log bid history
            const bidRef = ref(db, `bids/${auctionState.current_player_id}`);
            await push(bidRef, {
                team_id: teamId,
                amount: amount,
                timestamp: Date.now()
            });

            return true;
        } catch (e) {
            console.error("Bid failed", e);
            return false;
        }
    };

    const updateTimer = (seconds) => {
        update(ref(db, "state"), { timer: seconds });
    };

    // --- ADMIN ACTIONS ---

    const selectPlayer = async (playerId) => {
        console.log("Selecting player...", playerId);
        const playerFn = initialPlayers.find(p => p.id === playerId);
        console.log("Found in local list:", playerFn);

        try {
            await update(ref(db, "state"), {
                current_player_id: playerId,
                current_bid: 0,
                current_bidder_team_id: "", // Empty string avoids "missing key" issues in merge
                status: "WAITING",
                timer: 120
            });
            console.log("State updated successfully in DB");
        } catch (e) {
            console.error("Failed to select player:", e);
            alert("Error selecting player: " + e.message);
        }
    };

    const adminStartAuction = async () => {
        await update(ref(db, "state"), { status: "LIVE" });
    };

    const adminPauseAuction = async () => {
        await update(ref(db, "state"), { status: "PAUSED" });
    };

    const adminResumeAuction = async () => {
        await update(ref(db, "state"), { status: "LIVE" });
    };

    const adminSoldPlayer = async () => {
        const { current_player_id, current_bid, current_bidder_team_id } = auctionState;
        if (!current_player_id || !current_bidder_team_id) return;

        await update(ref(db, `players/${current_player_id}`), {
            status: "SOLD",
            sold_to: current_bidder_team_id,
            sold_price: current_bid
        });

        const teamRef = ref(db, `teams/${current_bidder_team_id}`);
        await runTransaction(teamRef, (team) => {
            if (team) {
                team.purse = team.purse - current_bid;
                if (!team.squad) team.squad = [];
                team.squad.push(current_player_id);
                if (!team.squad_count) team.squad_count = 0;
                team.squad_count += 1;
            }
            return team;
        });


        await update(ref(db, "state"), {
            status: "SOLD",
            current_bidder_team_id: null,
            last_sold_to: current_bidder_team_id, // Preserve winner for UI display
            last_sold_player_id: currentPlayer.id // Track for Latest Buy stats
        });
    };

    const adminUnsoldPlayer = async () => {
        const { current_player_id } = auctionState;
        if (!current_player_id) return;

        await update(ref(db, `players/${current_player_id}`), {
            status: "UNSOLD"
        });

        await update(ref(db, "state"), {
            status: "UNSOLD",
            current_bidder_team_id: null
        });
    };

    const resetAuctionTimer = async () => {
        await update(ref(db, "state"), { timer: 120 });
    };

    const value = {
        auctionState,
        currentPlayer,
        teams,
        allPlayers,
        isConnected,
        placeBid,
        updateTimer,
        selectPlayer,
        adminStartAuction,
        adminPauseAuction,
        adminResumeAuction,
        adminSoldPlayer,
        adminUnsoldPlayer,
        resetAuctionTimer
    };

    return (
        <AuctionContext.Provider value={value}>
            {children}
        </AuctionContext.Provider>
    );
}
