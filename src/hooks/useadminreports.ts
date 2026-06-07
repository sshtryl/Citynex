import { useState, useEffect, useCallback } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface AdminReport {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'pending' | 'verified' | 'in_progress' | 'resolved' | 'rejected';
    location: string;
    images: string[];
    category_name: string;
    username: string;
    email: string;
    assigned_admin_name: string | null;
    comment_count: number;
    likes_count: number;
    created_at: string;
}

export interface AdminStats {
    reports: {
        pending: string;
        verified: string;
        in_progress: string;
        resolved: string;
        rejected: string;
        total: string;
    };
    online_admins: number;
}

function getToken() { return localStorage.getItem('token'); }

export function useAdminReports() {
    const [reports, setReports] = useState<AdminReport[]>([]);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActing, setIsActing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

    const fetchStats = useCallback(async () => {
        const res = await fetch(`${API_BASE}/admin/stats`, {
            headers: { Authorization: `Bearer ${getToken()}` }
        });
        const data = await res.json();
        if (data.success) setStats(data.data);
    }, []);

    const fetchReports = useCallback(async (filter = 'all', page = 1) => {
        setIsLoading(true);
        setError(null);
        try {
            const statusParam = filter === 'all' ? '' : `&status=${filter}`;
            const res = await fetch(
                `${API_BASE}/admin/reports?page=${page}&limit=10${statusParam}`,
                { headers: { Authorization: `Bearer ${getToken()}` } }
            );
            const data = await res.json();
            if (data.success) {
                setReports(data.data);
                setPagination(data.pagination);
            } else {
                setError(data.message);
            }
        } catch {
            setError('Gagal memuat laporan');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateStatus = useCallback(async (reportId: string, status: string, notes?: string) => {
        setIsActing(true);
        try {
            const res = await fetch(`${API_BASE}/admin/reports/${reportId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({ status, notes }),
            });
            const data = await res.json();
            if (data.success) {
                // update local state
                setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: status as any } : r));
                fetchStats();
                return true;
            }
            return false;
        } catch {
            return false;
        } finally {
            setIsActing(false);
        }
    }, [fetchStats]);

    const setOnlineStatus = useCallback(async (is_online: boolean) => {
        await fetch(`${API_BASE}/admin/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify({ is_online }),
        });
    }, []);

    useEffect(() => {
        fetchReports(activeFilter);
        fetchStats();
    }, [activeFilter, fetchReports, fetchStats]);

    // Set online when tab is active, offline when hidden
    useEffect(() => {
        setOnlineStatus(true);
        const handleVisibility = () => setOnlineStatus(!document.hidden);
        document.addEventListener('visibilitychange', handleVisibility);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
            setOnlineStatus(false);
        };
    }, [setOnlineStatus]);

    return {
        reports, stats, isLoading, isActing, error,
        activeFilter, setActiveFilter,
        pagination,
        updateStatus,
        refresh: () => { fetchReports(activeFilter); fetchStats(); },
    };
}