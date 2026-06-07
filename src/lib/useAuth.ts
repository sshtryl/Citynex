"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface UseAuthOptions {
  redirectTo?: string;
  required?: boolean;
}

interface User {
  id: string;
  username: string;
  email: string;
  phone_number: string | null;
  profile_image: string | null;
  slug: string;
  trust_score: number;
  is_verified: boolean;
  role_id: number;
  role_name: string;
  created_at: string;
}

const ADMIN_ROLE_IDS = [1, 2, 3, 4, 6, 7];
const AUTH_PAGES = ["/login", "/register", "/forgot-password", "/reset-password"];

// ─── Token helpers ────────────────────────────────────────────────────────────

export function saveToken(token: string) {
  localStorage.setItem("token", token);
  // Set cookie so Next.js edge middleware can read it
  document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
}

export function removeToken() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  // Expire the cookie immediately
  document.cookie = "token=; path=/; max-age=0";
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

// ─── useAuth hook ─────────────────────────────────────────────────────────────

export function useAuth({
  redirectTo = "/login",
  required = true,
}: UseAuthOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();

      if (!token) {
        if (required && !AUTH_PAGES.includes(pathname)) {
          router.replace(`${redirectTo}?redirect=${pathname}`);
        }
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

        const response = await fetch(`${apiUrl}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();

          if (data.success && data.data) {
            const userData: User = data.data;
            setUser(userData);
            setIsAuthenticated(true);

            const isUserAdmin = ADMIN_ROLE_IDS.includes(userData.role_id);
            setIsAdmin(isUserAdmin);

            // Keep localStorage in sync
            localStorage.setItem("user", JSON.stringify(userData));

            // If the user landed on an auth page while already logged in,
            // send them to the right dashboard
            if (AUTH_PAGES.includes(pathname)) {
              if (userData.role_id === 1) {
                router.replace("/superadmin");
              } else if (ADMIN_ROLE_IDS.includes(userData.role_id)) {
                router.replace(`/admin/${userData.role_id}`);
              } else {
                router.replace("/home");
              }
            }
          } else {
            // Token rejected by server
            removeToken();
            if (required && !AUTH_PAGES.includes(pathname)) {
              router.replace(redirectTo);
            }
            setIsAuthenticated(false);
          }
        } else if (response.status === 401) {
          removeToken();
          if (required && !AUTH_PAGES.includes(pathname)) {
            router.replace(redirectTo);
          }
          setIsAuthenticated(false);
        } else {
          // 5xx or other errors — don't wipe token, let user retry
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        // Network error — keep token, don't redirect
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, redirectTo, required, pathname]);

  return { isAuthenticated, isLoading, user, isAdmin };
}