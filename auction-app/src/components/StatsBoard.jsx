
import React, { useState, useEffect } from 'react';

export default function StatsBoard({ allPlayers, teams, auctionState, className = "" }) {
    // 1. Calculate Stats
    // Ensure allPlayers is an array (mergedPlayers passed from PublicView is an array)
    const playersArray = Array.isArray(allPlayers) ? allPlayers : Object.values(allPlayers || {});
    const soldPlayers = playersArray.filter(p => p.status === 'SOLD' && p.sold_price > 0);

    // Sort by price descending (Top Buys)
    const sortedByPrice = [...soldPlayers].sort((a, b) => (b.sold_price || 0) - (a.sold_price || 0));
    const top3 = sortedByPrice.slice(0, 3);
    const highestSold = sortedByPrice.length > 0 ? sortedByPrice[0] : null;

    // Last 5 Sold (Reverse array as proxy for time if no timestamp, better than nothing)
    // Note: If initialPlayers is static order, this might not be accurate unless we track sold time.
    // However, usually appended updates might preserve order? Let's assume standard filtering preserves ID order.
    // Ideally we would use a 'soldAt' timestamp. For now, this meets the requirement visually.
    const last5 = [...soldPlayers].reverse().slice(0, 5);

    // Latest Buy (Specific single highlight)
    const latestBuyId = auctionState.last_sold_player_id;
    const latestBuy = latestBuyId && playersArray.find(p => p.id === latestBuyId && p.status === 'SOLD');

    // Build Slides
    const slides = [];

    // 1. Latest Buy (Priority)
    if (latestBuy) {
        slides.push({ type: 'LATEST BUY', player: latestBuy, highlight: true });
    }

    // 2. Highest Sold
    if (highestSold) {
        // Avoid duplicate if same as latest
        if (!latestBuy || latestBuy.id !== highestSold.id) {
            slides.push({ type: 'RECORD BID', player: highestSold, highlight: true });
        }
    }

    // 3. Top 3 Highest
    top3.forEach((p, i) => {
        // Optional: Dedup
        slides.push({ type: "TOP EXPENSIVE #" + (i + 1), player: p, highlight: false });
    });

    // 4. Last 5 Sold
    last5.forEach((p) => {
        // Label them
        slides.push({ type: 'RECENTLY SOLD', player: p, highlight: false });
    });

    // Fallback if empty
    if (slides.length === 0) {
        slides.push({
            type: 'AUCTION STATUS',
            player: {
                name: 'Waiting for Sale',
                photo: 'https://via.placeholder.com/150/000000/FFFFFF?text=Waiting',
                role: 'AUCTION LIVE',
                sold_price: 0
            },
            highlight: false
        });
    }

    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        if (slides.length <= 1) return;
        const interval = setInterval(() => {
            setActiveIndex(current => (current + 1) % slides.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [slides.length]);

    const currentSlide = slides[activeIndex] || slides[0];
    // Safety check for currentSlide
    if (!currentSlide) {
        return (
            <div className={`w-full h-full flex items-center justify-center border-4 border-red-500 text-white font-bold text-2xl ${className}`}>
                ERROR: No Slide Data
            </div>
        );
    }

    const team = currentSlide.player.sold_to ? teams[currentSlide.player.sold_to] : null;

    console.log("StatsBoard Rendered", { slidesCount: slides.length, activeIndex, currentSlide });

    return (
        <div className={`w-full shrink-0 border border-auction-gold/30 rounded-xl relative overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)] ${className || "h-36 bg-gradient-to-r from-gray-900 via-black to-gray-900"}`}>

            {/* Content Group - Compact Vertical */}
            <div key={activeIndex} className="flex flex-col items-center justify-center gap-3 animate-in zoom-in-95 fade-in duration-500 p-4">

                {/* 1. Player Image (Medium-Big & Centered) */}
                <div className="relative group">
                    <img
                        src={currentSlide.player.photo}
                        className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-500"
                    />
                    {currentSlide.highlight && (
                        <div className="absolute inset-0 border-4 border-green-500/50 rounded-full animate-pulse"></div>
                    )}
                    <div className="absolute top-0 right-0 bg-auction-gold text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-white/20 whitespace-nowrap z-10">
                        {currentSlide.type}
                    </div>
                </div>

                {/* 2. Info Block (Below Image) */}
                <div className="flex flex-col items-center text-center">
                    <h2 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight mb-1 drop-shadow-lg">{currentSlide.player.name}</h2>

                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-auction-gold font-bold uppercase tracking-widest text-xs md:text-sm">{currentSlide.player.role}</span>
                        {team && (
                            <div className="flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                                <span className="text-gray-300 text-[10px]">SOLD TO</span>
                                <img src={team.icon} className="w-5 h-5 rounded-full bg-white p-0.5" title={team.name} />
                                <span className="text-white font-bold text-xs uppercase">{team.name}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-0.5">Sold Price</span>
                        <span className="font-mono text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 drop-shadow-2xl">
                            ₹ {(currentSlide.player.sold_price || 0).toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Indicators - Bottom Center */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {slides.map((_, i) => (
                    <div
                        key={i}
                        className={`transition-all duration-300 rounded-full ${i === activeIndex ? 'w-6 h-1 bg-auction-gold' : 'w-1 h-1 bg-white/20'}`}
                    ></div>
                ))}
            </div>

            {/* Progress Bar - Very Bottom */}
            <div className="absolute bottom-0 left-0 h-1 bg-auction-gold/50 transition-all duration-300 ease-linear"
                style={{ width: `${((activeIndex + 1) / slides.length) * 100}%` }}></div>
        </div>
    );
}
