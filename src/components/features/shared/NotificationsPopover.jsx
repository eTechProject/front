import React, { useState, useRef, useEffect } from "react";
import { Bell ,X} from "lucide-react";

// Notifications mock (à remplacer par tes données dynamiques)
const notifications = [
    { id: 1, text: "Nouvelle alerte sur le site", time: "Il y a 2 min" },
    { id: 2, text: "Message reçu de Jean", time: "Il y a 10 min" },
    { id: 3, text: "Mise à jour système", time: "Il y a 1h" },
    { id: 4, text: "Backup terminé", time: "Il y a 2h" },
    { id: 5, text: "Backup terminé", time: "Il y a 2h" },
];

export default function NotificationsPopover() {
    const [open, setOpen] = useState(false);
    const popoverRef = useRef(null);

    useEffect(() => {
        function handleClick(e) {
            if (popoverRef.current && !popoverRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    return (
        <div className="fixed bottom-6 right-6 z-[999]">
            <button
                className="relative bg-white shadow-md w-12 h-12 rounded-full flex items-center justify-center hover:bg-orange-100 transition"
                onClick={() => setOpen((o) => !o)}
                aria-label="Afficher les notifications"
            >
                <Bell size={22} className="text-orange-500" />
                {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-1.5 font-bold">
                        {notifications.length}
                    </span>
                )}
            </button>

            {/* Popover */}
            {open && (
                <div
                    ref={popoverRef}
                    className="absolute right-0 bottom-14 w-72 max-w-[95vw] bg-white rounded-xl shadow-lg overflow-hidden animate-notif-pop"
                >
                    <div className="flex items-center justify-between px-4 py-2 border-b">
                        <span className="font-medium text-gray-800 text-base">Notifications</span>
                        <button
                            className="text-gray-400 hover:text-red-400 text-lg"
                            onClick={() => setOpen(false)}
                            aria-label="Fermer"
                        >
                            <X/>
                        </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-5 text-gray-400 text-center text-sm">Aucune notification</div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    className="flex gap-3 px-4 py-3 hover:bg-orange-50 transition"
                                >
                                    <div className="w-2 h-2 rounded-full bg-orange-400 mt-2" />
                                    <div>
                                        <div className="text-sm text-gray-800">{n.text}</div>
                                        <div className="text-xs text-gray-400">{n.time}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Animation */}
            <style>{`
                .animate-notif-pop {
                    animation: notif-pop .18s cubic-bezier(.4,0,.2,1);
                }
                @keyframes notif-pop {
                    0% { opacity: 0; transform: translateY(20px) scale(.98);}
                    100% { opacity: 1; transform: translateY(0) scale(1);}
                }
            `}</style>
        </div>
    );
}