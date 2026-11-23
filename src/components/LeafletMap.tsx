import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Crosshair, MapPin } from 'lucide-react';

interface LeafletMapProps {
  latitude: number;
  longitude: number;
  interactive?: boolean;
  label?: string;
  heightClass?: string;
  onLocationChange?: (lat: number, lng: number) => void;
}

const pinIcon = L.divIcon({
  className: 'loksudhar-map-pin',
  html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:#123B70;border:3px solid #FFFFFF;box-shadow:0 2px 6px rgba(0,0,0,0.45);transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;"><div style="width:8px;height:8px;border-radius:50%;background:#F28C28;transform:rotate(45deg);"></div></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

export function LeafletMap({
  latitude,
  longitude,
  interactive = false,
  label,
  heightClass = 'h-72',
  onLocationChange,
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [latitude, longitude],
      zoom: 13,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([latitude, longitude], {
      icon: pinIcon,
      draggable: interactive,
    }).addTo(map);

    if (label) {
      marker.bindPopup(label);
    }

    if (interactive && onLocationChange) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const nextLat = Number(e.latlng.lat.toFixed(6));
        const nextLng = Number(e.latlng.lng.toFixed(6));
        marker.setLatLng([nextLat, nextLng]);
        onLocationChange(nextLat, nextLng);
      });

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onLocationChange(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)));
      });
    }

    mapRef.current = map;
    markerRef.current = marker;

    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    markerRef.current.setLatLng([latitude, longitude]);
    mapRef.current.setView([latitude, longitude], mapRef.current.getZoom(), { animate: true });
    if (label) {
      markerRef.current.bindPopup(label);
    }
  }, [latitude, longitude, label]);

  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by this browser.');
      return;
    }
    setGpsError('');
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const nextLat = Number(pos.coords.latitude.toFixed(6));
        const nextLng = Number(pos.coords.longitude.toFixed(6));
        onLocationChange?.(nextLat, nextLng);
      },
      () => {
        setGpsLoading(false);
        setGpsError('Unable to access device GPS. Click on the map to pin the location manually.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="border border-slate-300 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-[#F4F6F9] border-b border-slate-300 text-xs">
        <div className="flex items-center gap-2 text-slate-800 font-medium">
          <MapPin className="w-4 h-4 text-[#123B70]" aria-hidden="true" />
          <span className="font-mono-tabular">
            LAT {latitude.toFixed(5)} · LNG {longitude.toFixed(5)}
          </span>
        </div>
        {interactive && (
          <button
            type="button"
            onClick={handleCaptureGps}
            disabled={gpsLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#123B70] text-white font-medium hover:bg-[#0E2F5A] disabled:opacity-60 cursor-pointer whitespace-nowrap"
          >
            <Crosshair className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{gpsLoading ? 'Capturing GPS...' : 'Capture GPS Location'}</span>
          </button>
        )}
      </div>
      {gpsError && (
        <div className="px-3 py-1.5 bg-amber-50 border-b border-amber-200 text-xs text-amber-900">
          {gpsError}
        </div>
      )}
      <div ref={containerRef} className={`w-full ${heightClass} z-0`} />
      {interactive && (
        <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
          Click anywhere on the map or drag the navy pin to refine the grievance location.
        </div>
      )}
    </div>
  );
}
