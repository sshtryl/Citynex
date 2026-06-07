"use client";
import { useEffect, useRef, useState } from "react";
import { X, MapPin, Loader2, Check } from "lucide-react";

export default function LocationMapPicker({ onConfirm, onClose }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (mapRef.current?._leaflet_id) return;
    if (mapInstanceRef.current) return;

    let map = null;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (!mapRef.current || mapRef.current._leaflet_id) return;

      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      map = L.map(mapRef.current).setView([-2.5, 118.0], 5);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      if (navigator.geolocation) {
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            map.setView([pos.coords.latitude, pos.coords.longitude], 15);
            setIsLocating(false);
          },
          () => setIsLocating(false),
        );
      }

      map.on("click", async (e) => {
        const { lat, lng } = e.latlng;

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng]).addTo(map);
        }

        setIsGeocoding(true);
        setSelectedLocation({ lat, lng, address: "Mencari alamat..." });

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=id`,
          );
          const data = await res.json();
          const address = buildAddress(data);
          setSelectedLocation({ lat, lng, address });
          markerRef.current.bindPopup(address).openPopup();
        } catch {
          setSelectedLocation({
            lat,
            lng,
            address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          });
        } finally {
          setIsGeocoding(false);
        }
      });
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []); // ← empty deps, jalan sekali

  const buildAddress = (nominatimData) => {
    const a = nominatimData.address || {};
    const parts = [
      a.road || a.pedestrian || a.footway,
      a.suburb || a.neighbourhood || a.village,
      a.city || a.town || a.municipality,
      a.state,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : nominatimData.display_name;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div
        className="bg-white dark:bg-gray-900 w-full sm:max-w-2xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        style={{ height: "85vh" }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-800  text-sm">
              Pilih Lokasi di Peta
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="px-4 py-2 bg-blue-50 flex-shrink-0">
          <p className="text-xs text-black">
            Klik di peta untuk menandai lokasi masalah
          </p>
        </div>

        <div className="flex-1 relative">
          {isLocating && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow text-xs text-gray-500 flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" />
              Mendeteksi lokasi Anda...
            </div>
          )}
          <div ref={mapRef} className="w-full h-full" />
        </div>

        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
          {selectedLocation ? (
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                {isGeocoding ? (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Mencari alamat...
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-800 dark:text-white font-medium leading-snug">
                      {selectedLocation.address}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {selectedLocation.lat.toFixed(6)},{" "}
                      {selectedLocation.lng.toFixed(6)}
                    </p>
                  </>
                )}
              </div>
              <button
                onClick={() => !isGeocoding && onConfirm(selectedLocation)}
                disabled={isGeocoding}
                className="flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-gray-800 disabled:opacity-50 text-white text-sm rounded-xl transition flex-shrink-0"
              >
                Pilih
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-1">
              Belum ada lokasi dipilih
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
