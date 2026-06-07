import { useState, useCallback } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface Comment {
    id: string;
    comment: string;
    created_at: string;
    username: string;
    profile_image: string | null;
    user_id: string;
    replies?: Comment[];
}

export function useComments(reportId: string) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submitComment = useCallback(async (
        comment: string,
        onSuccess: (newComment: Comment) => void,
        parentCommentId?: string
    ) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE}/reports/${reportId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    comment,
                    parent_comment_id: parentCommentId ?? null,
                }),
            });

            const data = await res.json();

            if (data.success) {
                onSuccess({
                    id: data.data.id,
                    comment: data.data.comment,
                    created_at: data.data.created_at,
                    username: data.data.user?.username ?? 'Anda',
                    profile_image: data.data.user?.profile_image ?? null,
                    user_id: data.data.user_id,
                    replies: [],
                });
            } else {
                setError(data.message ?? 'Gagal mengirim komentar');
            }
        } catch {
            setError('Terjadi kesalahan koneksi');
        } finally {
            setIsSubmitting(false);
        }
    }, [reportId]);

    return { submitComment, isSubmitting, error };
}