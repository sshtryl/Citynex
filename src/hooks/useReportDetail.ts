// hooks/useReportDetail.ts
import { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface ReportDetail {
    id: string;
    title: string;
    description: string;
    priority: string;
    status: string;
    location: string;
    images: string[];
    likes_count: number;
    is_liked: boolean;
    comment_count: number;
    created_at: string;
    updated_at: string;
    user: {
        id: string;
        username: string;
        email: string;
        profile_image: string | null;
        trust_score: number;
    };
    category: {
        id: number;
        name: string;
    };
    admin: {
        id: string;
        username: string;
        profile_image: string | null;
    } | null;
    status_history: {
        old_status: string;
        new_status: string;
        notes: string;
        created_at: string;
        changed_by_name: string;
    }[];
    comments: {
        id: string;
        content: string;
        created_at: string;
        username: string;
        profile_image: string | null;
    }[];
}

export function useReportDetail(reportId: string) {
    const [report, setReport] = useState<ReportDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDetail = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/reports/${reportId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.success) {
                setReport(data.data);
            } else {
                setError(data.message || 'Gagal mengambil detail laporan');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (reportId) {
            fetchDetail();
        }
    }, [reportId]);

    return { report, isLoading, error, refetch: fetchDetail };
}