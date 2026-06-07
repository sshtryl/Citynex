"use client";
import { useState, useRef, useEffect } from "react";
import { X, Camera, Loader2, Eye, EyeOff } from "lucide-react";
import { useUser } from "@/hooks/useUser";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface SettingsProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

type Tab = "profile" | "password";

interface Msg { type: "success" | "error"; text: string }

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-500">{label}</label>
            {children}
        </div>
    );
}

const inputCls = "w-full text-sm px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-gray-400 focus:bg-white transition-colors";

export function Settings({ isOpen, onClose, onSuccess }: SettingsProps) {
    const { user, updateUsername, updateEmail, updatePassword, updatePhoneNumber, updateProfileImage, refetch } = useUser();

    const [tab, setTab] = useState<Tab>("profile");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
    const [msg, setMsg] = useState<Msg | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const [profile, setProfile] = useState({ username: "", email: "", phone_number: "" });
    const [pw, setPw] = useState({ current: "", new: "", confirm: "" });

    useEffect(() => {
        if (user) {
            setProfile({
                username: user.username ?? "",
                email: user.email ?? "",
                phone_number: user.phone_number ?? "",
            });
        }
    }, [user]);

    if (!isOpen) return null;

    const handleUpload = async (file: File) => {
        setIsUploading(true);
        setMsg(null);
        const token = localStorage.getItem("token");
        const fd = new FormData();
        fd.append("image", file);
        try {
            const res = await fetch(`${API_BASE}/upload`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            });
            const data = await res.json();
            if (data.success) {
                const r = await updateProfileImage(data.imageUrl);
                if (r?.success) {
                    setMsg({ type: "success", text: "Foto profil diperbarui" });
                    refetch?.();
                    onSuccess?.();
                }
            } else {
                setMsg({ type: "error", text: "Gagal upload gambar" });
            }
        } catch {
            setMsg({ type: "error", text: "Terjadi kesalahan" });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMsg(null);

        try {
            if (tab === "profile") {
                if (profile.username !== user?.username) await updateUsername(profile.username);
                if (profile.email !== user?.email) await updateEmail(profile.email);
                if (profile.phone_number !== (user?.phone_number ?? "")) await updatePhoneNumber(profile.phone_number);
                setMsg({ type: "success", text: "Profil berhasil diperbarui" });
                refetch?.();
                onSuccess?.();
                setTimeout(onClose, 1200);
            } else {
                if (pw.new !== pw.confirm) {
                    setMsg({ type: "error", text: "Password baru tidak cocok" });
                    return;
                }
                const r = await updatePassword(pw.current, pw.new);
                if (r?.success) {
                    setMsg({ type: "success", text: "Password berhasil diubah" });
                    setPw({ current: "", new: "", confirm: "" });
                    setTimeout(onClose, 1200);
                } else {
                    setMsg({ type: "error", text: r?.message ?? "Gagal mengubah password" });
                }
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const tabs: { key: Tab; label: string }[] = [
        { key: "profile", label: "Profil" },
        { key: "password", label: "Password" },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-900">Edit Profil</h2>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                {/* Avatar */}
                <div className="flex justify-center pt-5 pb-4 border-b border-gray-100">
                    <button
                        onClick={() => fileRef.current?.click()}
                        disabled={isUploading}
                        className="relative group"
                    >
                        <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                            {user?.profile_image
                                ? <img src={user.profile_image} alt="avatar" className="w-full h-full object-cover" />
                                : user?.username?.[0]?.toUpperCase() ?? "?"
                            }
                        </div>
                        <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            {isUploading
                                ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                                : <Camera className="w-5 h-5 text-white" />
                            }
                        </div>
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden"
                        onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                    {tabs.map(t => (
                        <button
                            key={t.key}
                            onClick={() => { setTab(t.key); setMsg(null); }}
                            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                                tab === t.key
                                    ? "text-gray-900 border-b-2 border-gray-900"
                                    : "text-gray-400 hover:text-gray-600"
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[50vh] overflow-y-auto">
                    {tab === "profile" ? (
                        <>
                            <Field label="Username">
                                <input className={inputCls} value={profile.username}
                                    onChange={e => setProfile(p => ({ ...p, username: e.target.value }))} required />
                            </Field>
                            <Field label="Email">
                                <input type="email" className={inputCls} value={profile.email}
                                    onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} required />
                            </Field>
                            <Field label="Nomor Telepon">
                                <input type="tel" className={inputCls} value={profile.phone_number}
                                    onChange={e => setProfile(p => ({ ...p, phone_number: e.target.value }))}
                                    placeholder="Opsional" />
                            </Field>
                        </>
                    ) : (
                        <>
                            {(["current", "new", "confirm"] as const).map((k) => (
                                <Field key={k} label={k === "current" ? "Password Saat Ini" : k === "new" ? "Password Baru" : "Konfirmasi Password"}>
                                    <div className="relative">
                                        <input
                                            type={showPw[k] ? "text" : "password"}
                                            className={`${inputCls} pr-10`}
                                            value={pw[k]}
                                            onChange={e => setPw(p => ({ ...p, [k]: e.target.value }))}
                                            required
                                        />
                                        <button type="button" onClick={() => setShowPw(p => ({ ...p, [k]: !p[k] }))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            {showPw[k] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </Field>
                            ))}
                        </>
                    )}

                    {msg && (
                        <p className={`text-xs px-3 py-2 rounded-lg ${msg.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                            {msg.text}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        Simpan
                    </button>
                </form>
            </div>
        </div>
    );
}