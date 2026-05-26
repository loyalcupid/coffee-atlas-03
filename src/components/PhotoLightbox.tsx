"use client";

import { useEffect } from "react";

export function PhotoLightbox({ url, onClose }: { url: string; onClose: () => void }) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm"
            onClick={onClose}
        >
            <img
                src={url}
                alt=""
                className="max-w-[80vw] max-h-[80vh] object-contain rounded-xl shadow-2xl ring-1 ring-white/10"
                onClick={e => e.stopPropagation()}
            />
        </div>
    );
}
