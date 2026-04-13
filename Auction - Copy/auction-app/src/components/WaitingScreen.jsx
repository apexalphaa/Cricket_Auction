
{/* Waiting / Branding State (When no player selected) */ }
{
    !currentPlayer && (
        <div className="text-center absolute inset-0 flex flex-col items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-transparent to-black/80 z-0"></div>
            <div className="z-10 flex flex-col items-center">
                <img
                    src="/src/assets/logo.jpg"
                    alt="SPL Logo"
                    className="w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-auction-gold shadow-[0_0_50px_rgba(255,215,0,0.5)] mb-8 animate-pulse"
                />
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-widest uppercase">Sambalpur Premier League</h2>
                <p className="text-xl text-auction-gold font-mono animate-bounce">WAITING FOR NEXT PLAYER...</p>
            </div>
        </div>
    )
}
