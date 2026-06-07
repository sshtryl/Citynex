"use client";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { MessageSquare, Send, User } from "lucide-react";

interface Message {
    id: string;
    report_id: string;
    sender_id: string;
    message: string;
    created_at: string;
    sender_username?: string;
    sender_profile_image?: string | null;
    role_name?: string | null;
}

interface ChatSectionProps {
    reportId: string;
    currentUserId: string;
    currentUsername: string;
}

export function ChatSection({ reportId, currentUserId, currentUsername }: ChatSectionProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isConnecting, setIsConnecting] = useState(true);
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch initial chat history & Connect socket
    useEffect(() => {
        const token = localStorage.getItem("token");
        const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

        // 1. Fetch past messages
        const fetchHistory = async () => {
            try {
                const res = await fetch(`${apiBase}/reports/${reportId}/messages`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const resData = await res.json();
                    if (resData.success) {
                        setMessages(resData.data || []);
                    }
                }
            } catch (err) {
                console.error("Gagal mengambil riwayat chat:", err);
            }
        };

        fetchHistory();

        // 2. Establish Socket Connection
        const socket = io(apiBase, {
            transports: ["websocket"],
            reconnectionAttempts: 5,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("Connected to Chat socket");
            setIsConnecting(false);
            socket.emit("join_report", reportId);
        });

        socket.on("receive_message", (newMsg: Message) => {
            setMessages((prev) => {
                // Prevent duplicate messages in list if broadcast hits sender
                if (prev.some((m) => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
            });
        });

        socket.on("disconnect", () => {
            console.log("Disconnected from Chat socket");
        });

        return () => {
            socket.disconnect();
        };
    }, [reportId]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !socketRef.current) return;

        socketRef.current.emit("send_message", {
            report_id: reportId,
            sender_id: currentUserId,
            message: input.trim(),
        });

        setInput("");
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
            {/* Header */}
            <div className="px-4 py-3 bg-stone-900 text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-semibold">Ruang Obrolan Laporan</span>
                {isConnecting && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Menghubungkan..." />
                )}
            </div>

            {/* Message Pane */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs gap-1">
                        <MessageSquare className="w-8 h-8 text-gray-300" />
                        Tulis pesan pertama untuk memulai obrolan dengan admin/pelapor.
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isSelf = msg.sender_id === currentUserId;
                        const isAdminSender = msg.role_name && msg.role_name.startsWith("admin");
                        
                        return (
                            <div key={msg.id} className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}>
                                {/* Sender Info */}
                                <div className="flex items-center gap-1.5 mb-0.5 text-[10px] text-gray-400 font-semibold px-1">
                                    <span>{msg.sender_username || "User"}</span>
                                    {isAdminSender && (
                                        <span className="px-1 bg-stone-950 text-white text-[9px] font-bold rounded">
                                            Admin
                                        </span>
                                    )}
                                </div>
                                
                                {/* Bubble */}
                                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                                    isSelf 
                                        ? "bg-stone-900 text-white rounded-tr-none" 
                                        : "bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-xs"
                                }`}>
                                    <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                                    <span className={`block text-[9px] mt-1 text-right ${isSelf ? "text-white/60" : "text-gray-400"}`}>
                                        {new Date(msg.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 border-t border-gray-200 bg-white flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Tulis pesan..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-stone-900 transition-colors"
                />
                <button
                    type="submit"
                    disabled={!input.trim()}
                    className="w-10 h-10 bg-stone-900 text-white rounded-xl flex items-center justify-center hover:bg-stone-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}
