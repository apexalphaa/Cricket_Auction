import React, { useEffect, useState } from 'react';

export default function SplashScreen({ onComplete }) {
    const [stage, setStage] = useState(0);

    useEffect(() => {
        // Sequence of animations
        // 0: Initial blank
        // 1: Logo zoom in
        // 2: Glow epxansion
        // 3: Fade out / Reveal app

        const t1 = setTimeout(() => setStage(1), 100);
        const t2 = setTimeout(() => setStage(2), 1500);
        const t3 = setTimeout(() => {
            // onComplete(); // Optional: if we want to remove it from DOM completely.
            // For now, let's keep it simple, maybe just hide it or let the parent handle it.
            if (onComplete) onComplete();
        }, 3500);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [onComplete]);

    return (
        <div className={`fixed inset-0 z-[100] bg-auction-dark flex items-center justify-center transition-opacity duration-1000 ${stage >= 3 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div className="relative flex flex-col items-center">
                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-auction-gold/20 blur-[100px] rounded-full transition-all duration-1000 ${stage >= 2 ? 'scale-150 opacity-100' : 'scale-0 opacity-0'}`}></div>

                {/* Logo */}
                <img
                    src="/src/assets/logo.jpg"
                    alt="SPL Logo"
                    className={`
                    w-64 h-64 md:w-96 md:h-96 rounded-full border-4 border-auction-gold shadow-[0_0_50px_rgba(255,215,0,0.3)] z-10
                    transform transition-all duration-[2000ms] cubic-bezier(0.34, 1.56, 0.64, 1)
                    ${stage >= 1 ? 'scale-100 rotate-0 opacity-100' : 'scale-50 rotate-[-180deg] opacity-0'}
                `}
                />

                {/* Text */}
                <h1 className={`
                mt-12 text-4xl md:text-6xl font-black text-white tracking-widest uppercase text-center
                transition-all duration-1000 delay-1000
                ${stage >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
            `}>
                    Sambalpur <span className="text-auction-gold block text-2xl md:text-4xl mt-2 font-serif italic">Premier League</span>
                </h1>
            </div>
        </div>
    );
}
