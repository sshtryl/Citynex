// lib/useFeed.ts
import { useState, useEffect, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface Report {
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
  user: {
    id: string;
    username: string;
    profile_image: string | null;
  };
  category: {
    id: number;
    name: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function useFeed() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLiking, setIsLiking] = useState<Record<string, boolean>>({});

  // Ambil token dari localStorage
  const getToken = () => localStorage.getItem("token");

  // Fetch feed reports
  const fetchFeed = useCallback(async (page = 1, limit = 10) => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE}/reports?status=verified,in_progress,resolved&page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await response.json();

      if (data.success) {
        if (page === 1) {
          setReports(data.data);
        } else {
          setReports((prev) => [...prev, ...data.data]);
        }
        setPagination(data.pagination);
      } else {
        setError(data.message || "Gagal mengambil data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Like report
  const likeReport = useCallback(async (reportId: string) => {
    const token = getToken();
    if (!token) return false;

    setIsLiking((prev) => ({ ...prev, [reportId]: true }));

    try {
      const response = await fetch(`${API_BASE}/reports/${reportId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        setReports((prev) =>
          prev.map((report) =>
            report.id === reportId
              ? {
                  ...report,
                  is_liked: true,
                  likes_count: report.likes_count + 1,
                }
              : report,
          ),
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Like error:", error);
      return false;
    } finally {
      setIsLiking((prev) => ({ ...prev, [reportId]: false }));
    }
  }, []);

  const unlikeReport = useCallback(async (reportId: string) => {
    const token = getToken();
    if (!token) return false;

    setIsLiking((prev) => ({ ...prev, [reportId]: true }));

    try {
      const response = await fetch(`${API_BASE}/reports/${reportId}/like`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        setReports((prev) =>
          prev.map((report) =>
            report.id === reportId
              ? {
                  ...report,
                  is_liked: false,
                  likes_count: Math.max(0, report.likes_count - 1),
                }
              : report,
          ),
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Unlike error:", error);
      return false;
    } finally {
      setIsLiking((prev) => ({ ...prev, [reportId]: false }));
    }
  }, []);

  const toggleLike = useCallback(
    async (reportId: string, isCurrentlyLiked: boolean) => {
      if (isCurrentlyLiked) {
        return await unlikeReport(reportId);
      } else {
        return await likeReport(reportId);
      }
    },
    [likeReport, unlikeReport],
  );

const loadMore = useCallback(() => {
    if (pagination.page < pagination.totalPages && !isLoading) {
        fetchFeed(pagination.page + 1, pagination.limit);
    }
}, [pagination, isLoading, fetchFeed]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  return {
    reports,
    isLoading,
    error,
    pagination,
    isLiking,
    toggleLike,
    loadMore,
    refresh: () => fetchFeed(1, pagination.limit),
  };
}
