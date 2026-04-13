import React from 'react';

export default function BackgroundLayout({ children }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-900 to-black relative overflow-hidden text-white font-sans selection:bg-auction-gold selection:text-black">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Bat - Floating */}
                <div className="absolute top-20 left-10 opacity-10 animate-float-slow">
                    <svg className="w-64 h-64 transform -rotate-45 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M14.6 2.3l-2.9 2.9 4.7 4.7 2.9-2.9c.4-.4.4-1 0-1.4l-3.3-3.3c-.4-.4-1-.4-1.4 0zm-3.6 3.6l-9 9c-.4.4-.4 1 0 1.4l2.2 2.2c.4.4 1 .4 1.4 0l9-9-3.6-3.6zm0 0"></path></svg>
                </div>

                {/* Ball - Bouncing */}
                <div className="absolute bottom-20 right-20 opacity-10 animate-bounce-slow">
                    <div className="w-40 h-40 rounded-full border-4 border-dashed border-white flex items-center justify-center">
                        <div className="w-32 h-32 rounded-full border-2 border-white"></div>
                    </div>
                </div>

                {/* Hammer - Auction Theme */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 scale-150">
                    <svg className="w-96 h-96 text-auction-gold" fill="currentColor" viewBox="0 0 24 24"><path d="M2.207 13.925l5.868-5.869 4.818 4.819-5.868 5.869a2.05 2.05 0 01-2.9-2.9l-1.918-1.919zm6.677 6.676l5.869-5.868 4.818 4.818-5.869 5.869a2.05 2.05 0 01-2.899-2.9l-1.919-1.919zm4.615-18.394l5.657 5.657-2.828 2.828-5.657-5.657 2.828-2.828zm-3.536 7.778l5.657 5.657-2.828 2.829-5.657-5.657 2.828-2.829z" /></svg>
                </div>
            </div>

            <div className="relative z-10 w-full h-full flex flex-col">
                {children}
            </div>
        </div>
    );
}
