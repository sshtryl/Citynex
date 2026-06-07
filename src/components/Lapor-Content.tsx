"use client";
import {
  Send,
  Loader2,
  User,
  Bot,
  X,
  MapPin,
  Plus,
  ArrowUp,
} from "lucide-react";
import { useAIChat } from "@/hooks/useAIChat";
import dynamic from "next/dynamic";

const LocationMapPicker = dynamic(
  () => import("@/components/locationmappicker"),
  { ssr: false },
);

export default function LaporAIpage() {
  const {
    messages,
    input,
    setInput,
    isLoading,
    isUploading,
    imagePreview,
    messagesEndRef,
    fileInputRef,
    sendMessage,
    resetChat,
    handleImageSelect,
    removeImage,
    handleKeyPress,
    showMap,
    setShowMap,
    waitingForLocation,
    confirmLocation,
  } = useAIChat();

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white ">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pt-20">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border border-gray-300">
                <Bot className="w-4 h-4 text-black" />
              </div>
            )}
            <div className="flex flex-col gap-2 max-w-[70%]">
              <div
                className={`rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-gray-200 text-gray-800  rounded-br-sm"
                    : "bg-gray-200 text-gray-800  rounded-bl-sm"
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

              {msg.role === "assistant" && msg.showMapButton && (
                <button
                  onClick={() => setShowMap(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-whiteborder border-2 border-black text-black-600 text-sm rounded-xl hover:bg-gray-50 transition w-fit"
                >
                  <MapPin className="w-4 h-4" />
                  Pilih lokasi di peta
                </button>
              )}
            </div>

            {msg.role === "user" && <div></div>}
          </div>
        ))}

        {(isLoading || isUploading) && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border border-gray-300">
              <Bot className="w-4 h-4 text-black" />
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center">
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
              <span className="text-sm ml-2">
                {isUploading ? "Mengupload gambar..." : "..."}
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {imagePreview && (
        <div className="p-2 border-2 border-black rounded-2xl bg-white">
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-20 w-auto rounded-lg object-cover border"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 p-1 bg-black text-white rounded-full cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="relative flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:border-transparent">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="ml-2 p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            type="button"
          >
            <Plus className="w-5 h-5" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />

          {waitingForLocation && (
            <button
              onClick={() => setShowMap(true)}
              className="p-2 rounded-lg text-black hover:bg-gray-200 transition"
              title="Pilih lokasi di peta"
            >
              <MapPin className="w-5 h-5" />
            </button>
          )}

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              waitingForLocation
                ? "Ketik lokasi atau klik pin di atas..."
                : "Ceritakan masalah Anda..."
            }
            className="flex-1 py-3 bg-transparent focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            disabled={isLoading || isUploading}
          />

          <button
            onClick={sendMessage}
            disabled={
              (!input.trim() && !imagePreview) || isLoading || isUploading
            }
            className="mr-2 p-2 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showMap && (
        <LocationMapPicker
          onConfirm={confirmLocation}
          onClose={() => setShowMap(false)}
        />
      )}
    </div>
  );
}
