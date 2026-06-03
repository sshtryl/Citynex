// components/AIChat.jsx
"use client";
import { useState, useRef, useEffect } from 'react';
import { Send, Plus, Loader2, User, Bot, Image, X } from 'lucide-react';

export default function AIChat() {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Halo selamat datang di Civora. Ada masalah infrastruktur yang ingin dilaporkan? Ceritakan saja, saya akan membantu mencatatnya.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    
    // Auto scroll ke pesan terbaru
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    // Handle image selection
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WEBP.');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            alert('Ukuran file terlalu besar. Maksimal 5MB.');
            return;
        }
        
        setSelectedImage(file);
        setImagePreview(URL.createObjectURL(file));
    };
    
    // Remove selected image
    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
    
    // Upload image ke server
    const uploadImage = async () => {
        if (!selectedImage) return null;
        
        setIsUploading(true);
        
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('image', selectedImage);
            
            const response = await fetch(`${API_BASE}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            const contentType = response.headers.get('content-type') || '';
            const responseText = await response.text();
            const data = contentType.includes('application/json')
                ? JSON.parse(responseText)
                : { success: false, message: responseText };
            
            if (response.ok && data.success) {
                return data.imageUrl;
            }
            
            throw new Error(data.message || `Upload failed: ${response.status}`);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Gagal upload gambar. Silakan coba lagi.');
            return null;
        } finally {
            setIsUploading(false);
        }
    };
    
    // Kirim pesan ke backend
    const sendMessage = async () => {
        if ((!input.trim() && !selectedImage) || isLoading) return;
        
        const userMessage = input.trim();
        let imageUrl = null;
        
        // Upload image jika ada (hanya jika user memilih gambar)
        if (selectedImage) {
            imageUrl = await uploadImage();
            if (!imageUrl) {
                return;
            }
        }
        
        // Reset input dan image
        setInput('');
        removeImage();
        
        // Konten pesan (teks + image)
        let messageContent = userMessage;
        if (imageUrl) {
            messageContent = userMessage 
                ? `${userMessage}\n[Gambar: ${imageUrl}]`
                : `[Gambar: ${imageUrl}]`;
        }
        
        // Tambah pesan user ke state
        setMessages(prev => [...prev, { 
            role: 'user', 
            content: messageContent,
            image: imageUrl 
        }]);
        setIsLoading(true);
        
        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${API_BASE}/api/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: messageContent,
                    session_id: sessionId
                })
            });
            
            const contentType = response.headers.get('content-type') || '';
            const data = contentType.includes('application/json')
                ? await response.json()
                : { success: false, message: await response.text() };
            
            if (data.success) {
                if (data.session_id && !sessionId) {
                    setSessionId(data.session_id);
                }
                
                setMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: data.message 
                }]);
                
                if (data.is_complete) {
    setMessages(prev => [...prev, {
        role: 'assistant',
        content: '✅ Laporan Anda telah berhasil dikirim! Terima kasih sudah membantu membangun kota yang lebih baik. 🎉'
    }]);
    setSessionId(null);
}
            } else {
                setMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: 'Maaf, terjadi kesalahan. Silakan coba lagi.' 
                }]);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: 'Gagal terhubung ke server. Periksa koneksi Anda.' 
            }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Submit report ke backend
    const submitReport = async (reportData) => {
        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${API_BASE}/api/reports`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(reportData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                setMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: '✅ Laporan Anda telah berhasil dikirim! Terima kasih sudah membantu membangun kota yang lebih baik. 🎉' 
                }]);
                setSessionId(null);
            } else {
                console.error('Submit report failed:', data);
            }
        } catch (error) {
            console.error('Error submitting report:', error);
        }
    };
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };
    
    const resetChat = () => {
        setMessages([
            { role: 'assistant', content: 'Halo selamat datang di Civora. Ada masalah infrastruktur yang ingin dilaporkan? Ceritakan saja, saya akan membantu mencatatnya.' }
        ]);
        setSessionId(null);
        removeImage();
        setInput('');
    };
    
    return (
        <div className="flex flex-col h-screen max-w-4xl mx-auto bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-800 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-semibold text-gray-800 dark:text-white">AI Asisten Laporan</h1>
                        <p className="text-xs text-gray-500">Sampaikan masalah Anda, AI akan membantu membuat laporan</p>
                    </div>
                </div>
                <button 
                    onClick={resetChat}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                    <Plus className="w-5 h-5 text-gray-500" />
                </button>
            </div>
            
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                        )}
                        <div
                            className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                                msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-sm'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-sm'
                            }`}
                        >
                            {msg.image && (
                                <img 
                                    src={msg.image} 
                                    alt="Uploaded" 
                                    className="max-w-full h-auto rounded-lg mb-2 max-h-48 object-cover"
                                />
                            )}
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        {msg.role === 'user' && (
                            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                            </div>
                        )}
                    </div>
                ))}
                
                {(isLoading || isUploading) && (
                    <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Bot className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-bl-sm px-4 py-3">
                            <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                            <span className="text-sm ml-2">
                                {isUploading ? 'Mengupload gambar...' : 'AI sedang mengetik...'}
                            </span>
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>
            
            {/* Image Preview Area */}
            {imagePreview && (
                <div className="p-2 border-t bg-white dark:bg-gray-800">
                    <div className="relative inline-block">
                        <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="h-20 w-auto rounded-lg object-cover border"
                        />
                        <button
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            )}
            
            {/* Input Area */}
            <div className="p-4 border-t bg-white dark:bg-gray-800 shadow-lg">
                <div className="flex gap-2">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        type="button"
                    >
                        <Image className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                    />
                    
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ceritakan masalah Anda..."
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading || isUploading}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={(!input.trim() && !selectedImage) || isLoading || isUploading}
                        className="p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">
                    Ceritakan masalah Anda, AI akan memandu untuk membuat laporan lengkap dengan foto
                </p>
            </div>
        </div>
    );
}