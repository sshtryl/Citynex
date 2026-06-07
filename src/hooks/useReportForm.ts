import { useState, useCallback, useEffect } from 'react';
import { api } from '@/services/api';

export function useReportForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<any>(null);
    const [uploadedImages, setUploadedImages] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    
    const [formData, setFormData] = useState({
        category_id: '',
        title: '',
        description: '',
        priority: 'medium',
        location: '',
        latitude: null,
        longitude: null,
        images: '',
        ai_summary: '',
        fake_score: null,
        priority_score: null
    });

    // Load categories on mount
    useEffect(() => {
        const loadCategories = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            try {
                const data = await api.getCategories(token);
                setCategories(data);
            } catch (error) {
                console.error('Failed to load categories:', error);
            } finally {
                setIsLoadingCategories(false);
            }
        };
        
        loadCategories();
    }, []);

    // Update form field
    const updateField = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    // Handle location confirmation from map
    const handleLocationConfirm = useCallback((location) => {
        setSelectedLocation(location);
        updateField('location', location.address);
        updateField('latitude', location.lat);
        updateField('longitude', location.lng);
        setShowLocationPicker(false);
    }, [updateField]);

    // Handle single image upload
    const uploadSingleImage = useCallback(async (file) => {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');
        
        return await api.uploadImage(file, token);
    }, []);

    // Handle multiple image uploads
    const handleImageUpload = useCallback(async (files) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Anda harus login terlebih dahulu');
            return;
        }

        setIsUploading(true);
        const uploadedUrls = [];

        try {
            for (const file of files) {
                const url = await uploadSingleImage(file);
                uploadedUrls.push(url);
            }

            const newImages = [...uploadedImages, ...uploadedUrls];
            setUploadedImages(newImages);
            updateField('images', newImages.join(','));
        } catch (error) {
            console.error('Upload error:', error);
            alert(error.message || 'Gagal upload gambar');
        } finally {
            setIsUploading(false);
        }
    }, [uploadedImages, updateField, uploadSingleImage]);

    // Remove uploaded image
    const removeImage = useCallback((indexToRemove) => {
        setUploadedImages(prev => {
            const newImages = prev.filter((_, idx) => idx !== indexToRemove);
            updateField('images', newImages.join(','));
            return newImages;
        });
    }, [updateField]);

    // Submit report
    const submitReport = useCallback(async () => {
        // Validations
        if (!formData.category_id) {
            alert('Pilih kategori laporan');
            return false;
        }
        if (!formData.title || formData.title.trim().length < 5) {
            alert('Judul minimal 5 karakter');
            return false;
        }
        if (!formData.description || formData.description.trim().length < 10) {
            alert('Deskripsi minimal 10 karakter');
            return false;
        }
        if (!formData.location) {
            alert('Pilih lokasi kejadian');
            return false;
        }
        if (uploadedImages.length === 0) {
            alert('Foto kerusakan wajib dilampirkan minimal 1 foto');
            return false;
        }

        setIsSubmitting(true);
        const token = localStorage.getItem('token');

        try {
            const payload = {
                category_id: parseInt(formData.category_id),
                title: formData.title.trim(),
                description: formData.description.trim(),
                priority: formData.priority,
                location: formData.location,
                latitude: formData.latitude,
                longitude: formData.longitude,
                images: uploadedImages,
                ai_summary: formData.ai_summary || null,
                fake_score: formData.fake_score ? parseFloat(formData.fake_score) : null,
                priority_score: formData.priority_score ? parseFloat(formData.priority_score) : null
            };

            const result = await api.createReport(payload, token);
            
            if (result.success) {
                // Reset form
                setFormData({
                    category_id: '',
                    title: '',
                    description: '',
                    priority: 'medium',
                    location: '',
                    latitude: null,
                    longitude: null,
                    images: '',
                    ai_summary: '',
                    fake_score: null,
                    priority_score: null
                });
                setUploadedImages([]);
                setSelectedLocation(null);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Submit error:', error);
            alert(error.message || 'Terjadi kesalahan saat mengirim laporan');
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, uploadedImages]);

    return {
        // State
        formData,
        updateField,
        isSubmitting,
        showLocationPicker,
        setShowLocationPicker,
        selectedLocation,
        uploadedImages,
        isUploading,
        categories,
        isLoadingCategories,
        // Functions
        handleLocationConfirm,
        handleImageUpload,
        removeImage,
        submitReport,
    };
}