import { useState, useRef, useEffect, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function isAskingLocation(message) {
  const lower = message.toLowerCase();
  return (
    lower.includes("lokasi") ||
    lower.includes("nama jalan") ||
    lower.includes("kelurahan") ||
    lower.includes("patokan")
  );
}

interface AIChatMessage {
  role: string;
  content: string;
  image?: string | null;
  showMapButton?: boolean;
}

export function useAIChat(
  initialMessage = "Halo selamat datang di Civora. Ada masalah infrastruktur yang ingin dilaporkan? Ceritakan saja",
) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<AIChatMessage[]>([
    { role: "assistant", content: initialMessage },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [showMap, setShowMap] = useState(false);
  const [pendingLocation, setPendingLocation] = useState(null); 
  const [waitingForLocation, setWaitingForLocation] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isValidImage = (file) => {
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WEBP.");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file terlalu besar. Maksimal 5MB.");
      return false;
    }
    return true;
  };

  const handleImageSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (!file || !isValidImage(file)) return;
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  }, []);

  const removeImage = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const uploadImage = useCallback(async () => {
    if (!selectedImage) return null;
    setIsUploading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("image", selectedImage);
      const response = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (response.ok && data.success) return data.imageUrl;
      throw new Error(data.message || `Upload failed: ${response.status}`);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Gagal upload gambar. Silakan coba lagi.");
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [selectedImage]);

  const sendMessageWithContent = useCallback(
    async (messageContent, imageUrl = null, coords = null) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: messageContent,
          image: imageUrl,
        },
      ]);
      setIsLoading(true);

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE}/api/ai/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: messageContent,
            session_id: sessionId,
            image_url: imageUrl,
            ...(coords && { latitude: coords.lat, longitude: coords.lng }),
          }),
        });

        const data = await response.json();

        if (data.success) {
          if (data.session_id && !sessionId) setSessionId(data.session_id);

          const isLocQuestion = isAskingLocation(data.message);
          setWaitingForLocation(isLocQuestion);

          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: data.message,
              showMapButton: isLocQuestion,
            },
          ]);

          if (data.is_complete) {
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content:
                  "Laporan Anda telah berhasil dikirim! Terima kasih sudah membantu membangun kota yang lebih baik",
              },
            ]);
            setSessionId(null);
            setWaitingForLocation(false);
          }
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "Maaf, terjadi kesalahan. Silakan coba lagi.",
            },
          ]);
        }
      } catch (error) {
        console.error("Error sending message:", error);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Gagal terhubung ke server. Periksa koneksi Anda.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId],
  );

  const sendMessage = useCallback(async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMessage = input.trim();
    let imageUrl = null;

    if (selectedImage) {
      imageUrl = await uploadImage();
      if (!imageUrl) return;
    }

    setInput("");
    removeImage();

   const messageContent = userMessage || '';

    await sendMessageWithContent(messageContent, imageUrl);
  }, [
    input,
    selectedImage,
    isLoading,
    uploadImage,
    removeImage,
    sendMessageWithContent,
  ]);

  const confirmLocation = useCallback(
    async (locationData) => {
      setShowMap(false);
      setPendingLocation(locationData);
      setWaitingForLocation(false);

      const messageContent = locationData.address;
      await sendMessageWithContent(messageContent, null, {
        lat: locationData.lat,
        lng: locationData.lng,
      });
    },
    [sendMessageWithContent],
  );

  const resetChat = useCallback(() => {
    setMessages([{ role: "assistant", content: initialMessage }]);
    setSessionId(null);
    removeImage();
    setInput("");
    setShowMap(false);
    setPendingLocation(null);
    setWaitingForLocation(false);
  }, [initialMessage, removeImage]);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage],
  );

  return {
    messages,
    input,
    setInput,
    isLoading,
    isUploading,
    sessionId,
    selectedImage,
    imagePreview,
    messagesEndRef,
    fileInputRef,
    sendMessage,
    resetChat,
    handleImageSelect,
    removeImage,
    handleKeyPress,
    // Map
    showMap,
    setShowMap,
    pendingLocation,
    waitingForLocation,
    confirmLocation,
  };
}
