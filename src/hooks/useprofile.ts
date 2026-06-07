import { useState, useEffect, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface ProfileReport {
  id: string;
  title: string;
  description: string;
  status: "pending" | "verified" | "in_progress" | "resolved" | "rejected";
  priority: string;
  location: string;
  images: string[];
  created_at: string;
  category_name: string;
}

export interface ProfileStats {
  pending: string;
  verified: string;
  in_progress: string;
  resolved: string;
  rejected: string;
  total: string;
}

export function useProfile() {
  const [reports, setReports] = useState<ProfileReport[]>([]);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/profile/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setReports(data.data.reports);
        setStats(data.data.stats);
      } else {
        setError(data.message || "Gagal memuat data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const filteredReports =
    activeFilter === "all"
      ? reports
      : reports.filter((r) => r.status === activeFilter);

  return {
    reports: filteredReports,
    stats,
    isLoading,
    error,
    activeFilter,
    setActiveFilter,
    refresh: fetchProfile,
  };
}