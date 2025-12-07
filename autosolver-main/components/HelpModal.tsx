import React from 'react';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-neutral-900 border border-white/10 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative">

                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-white/5">
                    <h2 className="text-lg font-bold text-white tracking-tight">How to Use</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">

                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                            Answer Color Guide
                        </h3>

                        <div className="grid gap-3">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-red-600/90 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-red-900/20">A</div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-white">Answer A / 1</span>
                                    <span className="text-xs text-neutral-500">Red Color</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-600/90 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-900/20">B</div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-white">Answer B / 2</span>
                                    <span className="text-xs text-neutral-500">Blue Color</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-green-600/90 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-green-900/20">C</div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-white">Answer C / 3</span>
                                    <span className="text-xs text-neutral-500">Green Color</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-amber-500/90 flex items-center justify-center text-black font-black text-lg shadow-lg shadow-amber-900/20">D</div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-white">Answer D / 4</span>
                                    <span className="text-xs text-neutral-500">Amber Color</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-600/90 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-purple-900/20">E</div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-white">Answer E / 5</span>
                                    <span className="text-xs text-neutral-500">Purple Color</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">
                            Tips
                        </h3>
                        <ul className="text-sm text-neutral-400 space-y-2 list-disc pl-4">
                            <li>Turn on standard <span className="text-white font-medium">Auto Scan</span> to scan every 30s.</li>
                            <li>Press <span className="text-white font-medium">Scan Now</span> for immediate results.</li>
                            <li>Ensure the text is clearly visible in the camera frame.</li>
                        </ul>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 bg-neutral-950/50 text-center">
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm active:scale-95 transition-transform"
                    >
                        Got it
                    </button>
                </div>

            </div>
        </div>
    );
};

export default HelpModal;
