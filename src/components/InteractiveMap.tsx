import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { AnimalReport } from '../types';
import { createLeafletPinHtml } from './MapPin';
import { Locate, Navigation, ZoomIn, ZoomOut } from 'lucide-react';

interface InteractiveMapProps {
  mode: 'picker' | 'dashboard';
  // Picker props
  selectedLat?: number;
  selectedLng?: number;
  onLocationSelect?: (coords: { lat: number; lng: number }) => void;
  // Dashboard props
  reports?: AnimalReport[];
  selectedReportId?: string;
  onSelectReport?: (report: AnimalReport) => void;
  className?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  mode,
  selectedLat = 37.7749,
  selectedLng = -122.4194,
  onLocationSelect,
  reports = [],
  selectedReportId,
  onSelectReport,
  className = 'h-96 w-full',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const pickerMarkerRef = useRef<L.Marker | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialCenter: [number, number] = [selectedLat, selectedLng];
    const initialZoom = mode === 'picker' ? 14 : 13;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Handle map clicks in picker mode
    if (mode === 'picker' && onLocationSelect) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        onLocationSelect({ lat: Number(lat.toFixed(5)), lng: Number(lng.toFixed(5)) });
      });
    }

    // Container resize observer for smooth layout adaptiveness
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update picker marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || mode !== 'picker') return;

    const icon = L.divIcon({
      html: createLeafletPinHtml('high', true),
      className: 'custom-leaflet-marker',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    if (!pickerMarkerRef.current) {
      pickerMarkerRef.current = L.marker([selectedLat, selectedLng], {
        icon,
        draggable: true,
      }).addTo(map);

      pickerMarkerRef.current.on('dragend', (e) => {
        const marker = e.target;
        const position = marker.getLatLng();
        if (onLocationSelect) {
          onLocationSelect({
            lat: Number(position.lat.toFixed(5)),
            lng: Number(position.lng.toFixed(5)),
          });
        }
      });
    } else {
      pickerMarkerRef.current.setLatLng([selectedLat, selectedLng]);
    }
  }, [mode, selectedLat, selectedLng, onLocationSelect]);

  // Update dashboard report markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || mode !== 'dashboard') return;

    // Clear old markers that no longer exist
    const currentReportIds = new Set(reports.map((r) => r.id));
    Object.keys(markersRef.current).forEach((id) => {
      if (!currentReportIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Add/update markers
    reports.forEach((report) => {
      const isSelected = report.id === selectedReportId;
      const icon = L.divIcon({
        html: createLeafletPinHtml(report.urgency_level, isSelected),
        className: 'custom-leaflet-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      if (markersRef.current[report.id]) {
        markersRef.current[report.id].setIcon(icon);
        markersRef.current[report.id].setLatLng([report.lat, report.lng]);
      } else {
        const marker = L.marker([report.lat, report.lng], { icon }).addTo(map);
        marker.on('click', () => {
          if (onSelectReport) {
            onSelectReport(report);
          }
        });
        markersRef.current[report.id] = marker;
      }
    });

    // If selected report changes, pan into view
    if (selectedReportId) {
      const selected = reports.find((r) => r.id === selectedReportId);
      if (selected) {
        map.panTo([selected.lat, selected.lng], { animate: true, duration: 0.5 });
      }
    }
  }, [mode, reports, selectedReportId, onSelectReport]);

  const handleUseCurrentLocation = () => {
    setLocating(true);
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: Number(pos.coords.latitude.toFixed(5)),
          lng: Number(pos.coords.longitude.toFixed(5)),
        };
        if (onLocationSelect) {
          onLocationSelect(coords);
        }
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([coords.lat, coords.lng], 15, { animate: true });
        }
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation failed, defaulting to city center:', err.message);
        // Provide friendly message and default to active demo area
        setGeoError('Location permission was denied or unavailable. You can click on the map to set location.');
        setLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-stone-200 shadow-inner ${className}`}>
      {/* Map Target */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Controls */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col gap-1.5 shadow-md bg-white/95 backdrop-blur-sm rounded-xl border border-stone-200 p-1">
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-2 text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="h-px bg-stone-200 mx-1" />
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-2 text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Picker: Use Current Location button */}
      {mode === 'picker' && (
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-[400] flex flex-col gap-2">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={locating}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/95 backdrop-blur-sm hover:bg-white text-stone-800 text-xs sm:text-sm font-semibold shadow-lg border border-stone-200 transition-all active:scale-95 cursor-pointer disabled:opacity-75"
          >
            <Locate className={`w-4 h-4 text-teal-600 ${locating ? 'animate-spin' : ''}`} />
            {locating ? 'Acquiring GPS coordinates...' : 'Use My Current Location'}
          </button>
          {geoError && (
            <div className="px-3 py-1.5 rounded-lg bg-stone-900/90 text-white text-xs max-w-xs shadow-md">
              {geoError}
            </div>
          )}
        </div>
      )}

      {/* Picker instructions badge */}
      {mode === 'picker' && (
        <div className="absolute top-3 left-3 z-[400] hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900/80 backdrop-blur-sm text-white text-xs">
          <Navigation className="w-3.5 h-3.5 text-teal-400" />
          <span>Click anywhere on the map to place rescue pin</span>
        </div>
      )}

      {/* Urgency Legend (Dashboard) */}
      {mode === 'dashboard' && (
        <div className="absolute bottom-3 left-3 z-[400] flex items-center gap-2 p-2 bg-white/95 backdrop-blur-sm rounded-xl border border-stone-200 shadow-md text-xs">
          <span className="font-semibold text-stone-700 mr-1">Urgency:</span>
          <span className="flex items-center gap-1 text-rose-700 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" /> High
          </span>
          <span className="flex items-center gap-1 text-amber-700 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medium
          </span>
          <span className="flex items-center gap-1 text-emerald-700 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Low
          </span>
        </div>
      )}
    </div>
  );
};
