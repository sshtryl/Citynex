const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export const api = {
    async uploadImage(file, token) {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Upload failed');
        return data.imageUrl;
    },

    async createReport(reportData, token) {
        const response = await fetch(`${API_BASE}/reports`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(reportData)
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Create report failed');
        return data;
    },
    
    async getCategories(token) {
        const response = await fetch(`${API_BASE}/categories`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        return data.success ? data.data : [];
    }
};
