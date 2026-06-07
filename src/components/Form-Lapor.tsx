"use client";
import { useRef, useState } from "react";
import { useReportForm } from "@/hooks/useReportForm";
import LocationMapPicker from "./locationmappicker";
import {
  MapPin,
  Upload,
  X,
  Loader2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

export default function FormLapor() {
  const {
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
    handleLocationConfirm,
    handleImageUpload,
    removeImage,
    submitReport,
  } = useReportForm();

  const fileInputRef = useRef(null);
  const [step, setStep] = useState(1);

  const handleFileSelect = (e: any) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) handleImageUpload(files);
    e.target.value = "";
  };

  const priorityOptions = [
    { value: "low", label: "Rendah" },
    { value: "medium", label: "Sedang" },
    { value: "high", label: "Tinggi" },
    { value: "critical", label: "Kritis" },
  ];

  return (
    <div className="w-full min-h-screen flex items-start justify-center p-8 bg-stone-50">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-black tracking-tight">
            Buat Laporan Baru
          </h1>
        </div>

        <div className="flex border border-gray-200 rounded-lg overflow-hidden mb-7 bg-white">
          {[
            { num: 1, label: "Detail Laporan" },
            { num: 2, label: "Lokasi & Foto" },
          ].map((s, i) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(s.num)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium uppercase tracking-wide transition-colors ${
                i === 0 ? "border-r border-gray-200" : ""
              } ${
                step === s.num
                  ? "bg-stone-50 text-gray-800"
                  : "bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              }`}
            >
              <span
                className={`w-4.5 h-4.5 rounded-full text-[10px] font-bold flex items-center justify-center transition-colors ${
                  step === s.num
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
                style={{ width: 18, height: 18 }}
              >
                {s.num}
              </span>
              {s.label}
            </button>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-5 pb-3 border-b border-gray-100">
                Informasi Laporan
              </p>

              {/* Kategori */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Kategori
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => updateField("category_id", e.target.value)}
                  disabled={isLoadingCategories}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:border-gray-900 transition-colors appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 12px center",
                    paddingRight: 32,
                  }}
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {isLoadingCategories && (
                  <p className="text-xs text-gray-400 mt-1">
                    Memuat kategori...
                  </p>
                )}
              </div>

              {/* Judul */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Judul
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Contoh: Jalan Berlubang di Depan Sekolah"
                  maxLength={255}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-gray-900 transition-colors"
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={4}
                  placeholder="Jelaskan detail masalah — ukuran, sudah berapa lama, dampak yang ditimbulkan, dll."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-gray-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Prioritas
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {priorityOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateField("priority", opt.value)}
                      className={`py-2 rounded-lg border text-xs font-medium transition-colors ${
                        formData.priority === opt.value
                          ? "bg-black border-gray-900 text-white"
                          : "bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:bg-gray-50 hover:text-gray-800"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-3 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
            >
              Lanjut ke Lokasi & Foto <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            {/* Lokasi */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-5 pb-3 border-b border-gray-100">
                Lokasi
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Titik Lokasi Kerusakan
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.location}
                    placeholder="Pilih lokasi di peta"
                    readOnly
                    onClick={() => setShowLocationPicker(true)}
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder:text-gray-300 bg-stone-50 cursor-pointer focus:outline-none focus:border-gray-900 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLocationPicker(true)}
                    className="w-10 h-10 border border-gray-200 rounded-lg bg-white flex items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                {selectedLocation && (
                  <p className="text-xs text-gray-400 mt-1.5">
                    {selectedLocation.lat.toFixed(6)},{" "}
                    {selectedLocation.lng.toFixed(6)}
                  </p>
                )}
              </div>
            </div>

            {/* Foto */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-5 pb-3 border-b border-gray-100">
                Foto Kerusakan
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Upload Foto
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-upload"
                  disabled={isUploading}
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center gap-2 border-2 border-dashed border-gray-200 rounded-lg p-8 cursor-pointer bg-stone-50 hover:border-gray-400 hover:bg-gray-50 transition-colors text-center"
                >
                  <Upload className="w-5 h-5 text-gray-300" />
                  <span className="text-sm text-gray-400">
                    {isUploading
                      ? "Mengupload..."
                      : "Klik atau drag untuk upload foto"}
                  </span>
                  <span className="text-xs text-gray-300">
                    Maksimal 5MB per file (JPG, PNG, GIF, WEBP)
                  </span>
                </label>

                {uploadedImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {uploadedImages.map((url, idx) => (
                      <div key={idx} className="relative w-16 h-16 group">
                        <img
                          src={url}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-full object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Nav */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-gray-200 bg-white text-gray-600 text-sm font-medium rounded-lg hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Kembali
              </button>
              <button
                type="button"
                onClick={submitReport}
                disabled={isSubmitting || isUploading}
                className="flex-[2] py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Mengirim...
                  </>
                ) : (
                  "Kirim Laporan"
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {showLocationPicker && (
        <LocationMapPicker
          onConfirm={handleLocationConfirm}
          onClose={() => setShowLocationPicker(false)}
        />
      )}
    </div>
  );
}
