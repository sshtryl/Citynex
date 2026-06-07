"use client";
import { useState } from "react";
import { Send } from "lucide-react";
import { useComments, Comment } from "@/hooks/useComments";

function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diff < 1) return "Baru saja";
    if (diff < 60) return `${diff} menit lalu`;
    if (diff < 1440) return `${Math.floor(diff / 60)} jam lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function CommentItem({
    comment,
    onReplySuccess,
    reportId,
}: {
    comment: Comment;
    onReplySuccess: (reply: Comment, parentId: string) => void;
    reportId: string;
}) {
    const [showReply, setShowReply] = useState(false);
    const [replyText, setReplyText] = useState("");
    const { submitComment, isSubmitting } = useComments(reportId);

    const handleReply = async () => {
        if (!replyText.trim()) return;
        await submitComment(
            replyText,
            (newReply) => {
                onReplySuccess(newReply, comment.id);
                setReplyText("");
                setShowReply(false);
            },
            comment.id
        );
    };

    return (
        <div className="flex gap-2.5">
        {comment.profile_image ? (
    <img
        src={comment.profile_image}
        alt={comment.username}
        className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5"
    />
) : (
    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 flex-shrink-0 mt-0.5">
        {comment.username?.[0]?.toUpperCase() ?? "?"}
    </div>
)}
            <div className="flex-1 min-w-0">
                <div className="bg-gray-50 rounded-xl px-3 py-2">
                    <p className="text-xs font-semibold text-gray-800">{comment.username}</p>
                    <p className="text-sm text-gray-700 mt-0.5">{comment.comment}</p>
                </div>
                <div className="flex items-center gap-3 mt-1 px-1">
                    <span className="text-[11px] text-gray-400">{formatDate(comment.created_at)}</span>
                    <button
                        onClick={() => setShowReply(!showReply)}
                        className="text-[11px] text-gray-400 hover:text-gray-700 font-medium"
                    >
                        Balas
                    </button>
                </div>

                {showReply && (
                    <div className="flex gap-2 mt-2">
                        <input
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Tulis balasan..."
                            className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-gray-400"
                            onKeyDown={(e) => e.key === "Enter" && handleReply()}
                        />
                        <button
                            onClick={handleReply}
                            disabled={isSubmitting || !replyText.trim()}
                            className="p-1.5 text-gray-500 hover:text-gray-900 disabled:opacity-40"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-2 space-y-2 pl-2 border-l-2 border-gray-100">
                        {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-2">
                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-600 flex-shrink-0 mt-0.5">
                                    {reply.username?.[0]?.toUpperCase() ?? "?"}
                                </div>
                                <div className="flex-1">
                                    <div className="bg-gray-50 rounded-xl px-3 py-2">
                                        <p className="text-xs font-semibold text-gray-800">{reply.username}</p>
                                        <p className="text-sm text-gray-700 mt-0.5">{reply.comment}</p>
                                    </div>
                                    <span className="text-[11px] text-gray-400 px-1">{formatDate(reply.created_at)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

interface CommentSectionProps {
    reportId: string;
    initialComments: Comment[];
}

export function CommentSection({ reportId, initialComments }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>(initialComments ?? []);
    const [text, setText] = useState("");
    const { submitComment, isSubmitting, error } = useComments(reportId);

    const handleSubmit = async () => {
        if (!text.trim()) return;
        await submitComment(text, (newComment) => {
            setComments((prev) => [newComment, ...prev]);
            setText("");
        });
    };

    const handleReplySuccess = (reply: Comment, parentId: string) => {
        setComments((prev) =>
            prev.map((c) =>
                c.id === parentId
                    ? { ...c, replies: [...(c.replies ?? []), reply] }
                    : c
            )
        );
    };

    return (
        <div className="bg-white rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">
                Komentar {comments.length > 0 && <span className="text-gray-400 font-normal">({comments.length})</span>}
            </h3>

            {/* Input */}
            <div className="flex gap-2 mb-5">
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Tulis komentar..."
                    className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-gray-400 transition-colors"
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !text.trim()}
                    className="p-2 bg-gray-900 text-white rounded-xl hover:bg-gray-700 disabled:opacity-40 transition-colors"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>

            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

            {/* Comments list */}
            {comments.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Belum ada komentar</p>
            ) : (
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            onReplySuccess={handleReplySuccess}
                            reportId={reportId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}