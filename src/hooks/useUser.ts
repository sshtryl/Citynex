import { useState, useEffect, useCallback } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface UserProfile {
    id: string;
    username: string;
    email: string;
    phone_number: string;
    profile_image: string | null;
    slug: string;
    trust_score: number;
    is_verified: boolean;
    role_name: string;
    created_at: string;
}

export function useUser() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.success) {
                setUser(data.data);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateUsername = async (username: string) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/profile/username`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ username })
        });
        const data = await response.json();
        if (data.success) {
            setUser(prev => prev ? { ...prev, username: data.data.username, slug: data.data.slug } : null);
        }
        return data;
    };

    const updateEmail = async (email: string) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/profile/email`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ email })
        });
        const data = await response.json();
        if (data.success) {
            setUser(prev => prev ? { ...prev, email: data.data.email } : null);
        }
        return data;
    };

    const updatePassword = async (current_password: string, new_password: string) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/profile/password`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ current_password, new_password })
        });
        return response.json();
    };

    const updateProfileImage = async (image_url: string) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/profile/profile-image`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ image_url })
        });
        const data = await response.json();
        if (data.success) {
            setUser(prev => prev ? { ...prev, profile_image: data.data.profile_image } : null);
        }
        return data;
    };

    const updatePhoneNumber = async (phone_number: string) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/profile/phone-number`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ phone_number })
        });
        const data = await response.json();
        if (data.success) {
            setUser(prev => prev ? { ...prev, phone_number: data.data.phone_number } : null);
        }
        return data;
    };

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return {
        user,
        isLoading,
        error,
        refetch: fetchProfile,
        updateUsername,
        updateEmail,
        updatePassword,
        updateProfileImage,
        updatePhoneNumber
    };
}