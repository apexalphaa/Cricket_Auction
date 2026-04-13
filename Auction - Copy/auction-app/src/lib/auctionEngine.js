export const getNextBid = (currentBid) => {
    // Rules:
    // Start increment: ₹1000
    // ₹1,000 → ₹10,000 → increment ₹1000
    // ₹10,000 → ₹30,000 → increment ₹2000
    // ₹30,000 → ₹50,000 → increment ₹5000
    // Above ₹50,000 -> Maintain ₹5000 (Assumption based on scale)

    if (currentBid < 10000) return currentBid + 1000;
    if (currentBid < 30000) return currentBid + 2000;

    return currentBid + 5000;
};

export const canBid = (team, currentBid, nextBid) => {
    if (!team) return { allowed: false, reason: "No team found" };
    if (team.purse < nextBid) return { allowed: false, reason: "Insufficient Purse" };
    if (team.squad_count >= 14) return { allowed: false, reason: "Squad Full (14/14)" };

    return { allowed: true };
};
