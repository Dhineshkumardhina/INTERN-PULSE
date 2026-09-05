import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Student } from '../../types';

interface GeofenceMapProps {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  toleranceMeters?: number;
  hospitalName?: string;
  onCoordinatesChange?: (lat: number, lng: number) => void;
  onRadiusChange?: (radius: number) => void;
  interns?: Student[];
  testDistance?: number;
  className?: string;
  interactive?: boolean;
}

type MapTileStyle = 'streets' | 'humanitarian' | 'clinical' | 'satellite';

const TILE_LAYERS: Record<MapTileStyle, { name: string; url: string; attribution: string; maxZoom: number }> = {
  streets: {
    name: 'OpenStreetMap (Free)',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors (Free & Open)',
    maxZoom: 19,
  },
  humanitarian: {
    name: 'OSM Humanitarian (Free)',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="https://www.hotosm.org/">Humanitarian OSM</a>',
    maxZoom: 19,
  },
  clinical: {
    name: 'Clinical Carto (Free)',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
    maxZoom: 20,
  },
  satellite: {
    name: 'Satellite Aerial (Free)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri World Imagery (Public Prototyping)',
    maxZoom: 19,
  },
};

export const GeofenceMap: React.FC<GeofenceMapProps> = ({
  latitude,
  longitude,
  radiusMeters,
  toleranceMeters = 15,
  hospitalName = 'Hospital Campus',
  onCoordinatesChange,
  onRadiusChange,
  interns = [],
  testDistance = 45,
  className = 'h-[380px]',
  interactive = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const centerMarkerRef = useRef<L.Marker | null>(null);
  const radiusHandleMarkerRef = useRef<L.Marker | null>(null);
  const testInternMarkerRef = useRef<L.Marker | null>(null);
  const distanceLineRef = useRef<L.Polyline | null>(null);
  const geofenceCircleRef = useRef<L.Circle | null>(null);
  const toleranceCircleRef = useRef<L.Circle | null>(null);
  const internMarkersLayerRef = useRef<L.LayerGroup | null>(null);

  // Default tile style: 100% Free OpenStreetMap
  const [activeTile, setActiveTile] = useState<MapTileStyle>('streets');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [mapNotice, setMapNotice] = useState<string | null>(
    'Free OpenStreetMap: Click map or drag blue pin to place hospital geofence center.'
  );
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isPlacingPinMode, setIsPlacingPinMode] = useState<boolean>(false);

  // Helper to calculate East perimeter coordinate for the radius handle
  const getRadiusHandlePosition = useCallback((centerLat: number, centerLng: number, radiusM: number) => {
    const latRad = (centerLat * Math.PI) / 180;
    const metersPerDegreeLng = 111320 * Math.cos(latRad);
    const lngOffset = radiusM / metersPerDegreeLng;
    return L.latLng(centerLat, centerLng + lngOffset);
  }, []);

  // Helper to create custom HTML DivIcon for the hospital center
  const createCenterPinIcon = useCallback((name: string) => {
    return L.divIcon({
      className: 'custom-hospital-marker-wrapper',
      html: `
        <div class="relative flex flex-col items-center pointer-events-auto select-none" style="width: 44px; height: 60px;">
          <!-- Outer Pulsing Glow -->
          <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-12 bg-blue-500/30 rounded-full animate-ping pointer-events-none"></div>
          
          <!-- Marker Badge Pin -->
          <div class="relative z-10 w-11 h-11 rounded-2xl bg-[#003e6f] text-white shadow-2xl flex items-center justify-center border-2 border-white ring-2 ring-[#003e6f]/50 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
              <path d="M19 10.5h-4.5V6h-5v4.5H5v5h4.5V20h5v-4.5H19v-5z"/>
            </svg>
          </div>
          
          <!-- Little downward needle pointer -->
          <div class="w-3 h-3 bg-[#003e6f] rotate-45 -mt-1.5 z-0 border-r-2 border-b-2 border-white"></div>

          <!-- Label Pill -->
          <div class="absolute top-[54px] left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#0b1c30] text-white text-[10px] font-bold rounded-md shadow-lg border border-white/30 whitespace-nowrap max-w-[160px] truncate text-center pointer-events-none">
            ${name}
          </div>
        </div>
      `,
      iconSize: [44, 60],
      iconAnchor: [22, 52],
    });
  }, []);

  // Helper to create custom HTML DivIcon for the perimeter radius handle
  const createRadiusHandleIcon = useCallback((radius: number) => {
    return L.divIcon({
      className: 'custom-radius-handle-wrapper',
      html: `
        <div class="relative flex flex-col items-center pointer-events-auto select-none" style="width: 40px; height: 40px;">
          <div class="w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-400 text-white shadow-xl flex items-center justify-center border-2 border-white cursor-ew-resize active:scale-125 transition-transform ring-2 ring-amber-600/40">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 fill-current rotate-90" viewBox="0 0 24 24">
              <path d="M12 2L6 8h4v8H6l6 6 6-6h-4V8h4L12 2z"/>
            </svg>
          </div>
          <div class="absolute top-9 px-1.5 py-0.5 bg-amber-950 text-amber-200 text-[9px] font-mono font-bold rounded shadow border border-amber-400/50 whitespace-nowrap pointer-events-none">
            ${radius}m • Drag
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  }, []);

  // Helper to create custom HTML DivIcon for the test intern
  const createTestInternIcon = useCallback((dist: number, isInside: boolean) => {
    return L.divIcon({
      className: 'custom-test-intern-marker-wrapper',
      html: `
        <div class="relative flex flex-col items-center pointer-events-auto select-none" style="width: 40px; height: 56px;">
          <div class="w-9 h-9 rounded-full ${
            isInside
              ? 'bg-emerald-600 ring-emerald-300'
              : 'bg-rose-600 ring-rose-300 animate-bounce'
          } text-white shadow-xl flex items-center justify-center border-2 border-white ring-4 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <div class="w-2 h-2 ${
            isInside ? 'bg-emerald-600' : 'bg-rose-600'
          } rotate-45 -mt-1 z-0 border-r border-b border-white"></div>
          <div class="absolute top-[42px] px-2 py-0.5 ${
            isInside ? 'bg-emerald-950 text-emerald-200 border-emerald-500/50' : 'bg-rose-950 text-rose-200 border-rose-500/50'
          } text-[9px] font-bold rounded-md shadow border whitespace-nowrap pointer-events-none flex items-center gap-1">
            <span>${isInside ? 'Intern Safe' : 'BREACH'}</span>
            <span class="font-mono">(${dist}m)</span>
          </div>
        </div>
      `,
      iconSize: [40, 56],
      iconAnchor: [20, 38],
    });
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [latitude, longitude],
      zoom: 17,
      minZoom: 3,
      maxZoom: 19,
      zoomControl: false,
    });

    // Add initial Free OpenStreetMap tile layer
    const initialTile = TILE_LAYERS[activeTile];
    tileLayerRef.current = L.tileLayer(initialTile.url, {
      attribution: initialTile.attribution,
      maxZoom: initialTile.maxZoom,
    }).addTo(map);

    // Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Tolerance buffer circle (outer dashed ring)
    toleranceCircleRef.current = L.circle([latitude, longitude], {
      radius: radiusMeters + toleranceMeters,
      color: '#006a6a',
      weight: 1.5,
      dashArray: '5, 5',
      fillColor: '#8cf3f3',
      fillOpacity: 0.08,
      interactive: false,
    }).addTo(map);

    // Primary Geofence Circle (inner authoritative boundary)
    geofenceCircleRef.current = L.circle([latitude, longitude], {
      radius: radiusMeters,
      color: '#003e6f',
      weight: 2.5,
      fillColor: '#005596',
      fillOpacity: 0.18,
      interactive: false,
    }).addTo(map);

    // Center Hospital Marker
    const centerMarker = L.marker([latitude, longitude], {
      draggable: interactive,
      icon: createCenterPinIcon(hospitalName),
      title: 'Hospital Geofence Center (Drag to move)',
      zIndexOffset: 1000,
    }).addTo(map);
    centerMarkerRef.current = centerMarker;

    // Draggable Radius Handle on the perimeter edge
    const initialHandlePos = getRadiusHandlePosition(latitude, longitude, radiusMeters);
    const radiusHandle = L.marker(initialHandlePos, {
      draggable: interactive && Boolean(onRadiusChange),
      icon: createRadiusHandleIcon(radiusMeters),
      title: 'Drag to expand or shrink geofence radius',
      zIndexOffset: 500,
    }).addTo(map);
    radiusHandleMarkerRef.current = radiusHandle;

    // Draggable Test Intern Marker
    const initialTestDist = testDistance || Math.round(radiusMeters * 0.45);
    const latRad = (latitude * Math.PI) / 180;
    const testLngOffset = initialTestDist / (111320 * Math.cos(latRad));
    const initialTestPos = L.latLng(latitude + 0.00015, longitude + testLngOffset);

    const isInsideInitial = initialTestDist <= radiusMeters;
    const testInternMarker = L.marker(initialTestPos, {
      draggable: interactive,
      icon: createTestInternIcon(initialTestDist, isInsideInitial),
      title: 'Draggable Intern: Drag anywhere to test geofence alerts',
      zIndexOffset: 700,
    }).addTo(map);
    testInternMarkerRef.current = testInternMarker;

    // Connecting dashed measurement line from hospital center to test intern
    distanceLineRef.current = L.polyline([[latitude, longitude], initialTestPos], {
      color: isInsideInitial ? '#059669' : '#dc2626',
      weight: 2,
      dashArray: '4, 4',
      opacity: 0.8,
    }).addTo(map);

    // Re-anchor or move hospital center & synchronize all components smoothly
    const handlePlaceOrMoveCenter = (latLng: L.LatLng) => {
      const newLat = Number(latLng.lat.toFixed(6));
      const newLng = Number(latLng.lng.toFixed(6));

      // 1. Move center marker
      if (centerMarkerRef.current) {
        centerMarkerRef.current.setLatLng(latLng);
      }

      // 2. Move geofence circles
      if (geofenceCircleRef.current) geofenceCircleRef.current.setLatLng(latLng);
      if (toleranceCircleRef.current) toleranceCircleRef.current.setLatLng(latLng);

      // 3. Move radius handle
      if (radiusHandleMarkerRef.current) {
        const newHandlePos = getRadiusHandlePosition(newLat, newLng, radiusMeters);
        radiusHandleMarkerRef.current.setLatLng(newHandlePos);
      }

      // 4. Move test intern to stay visible & interactive relative to new center
      if (testInternMarkerRef.current) {
        const centerLatRad = (newLat * Math.PI) / 180;
        const safeOffset = Math.round(radiusMeters * 0.45);
        const lngOff = safeOffset / (111320 * Math.cos(centerLatRad));
        const newTestPos = L.latLng(newLat + 0.00015, newLng + lngOff);
        testInternMarkerRef.current.setLatLng(newTestPos);
        testInternMarkerRef.current.setIcon(createTestInternIcon(safeOffset, true));

        if (distanceLineRef.current) {
          distanceLineRef.current.setLatLngs([latLng, newTestPos]);
          distanceLineRef.current.setStyle({ color: '#059669' });
        }
      }

      // 5. Smoothly pan map to keep new center centrally in frame
      map.panTo(latLng, { animate: true, duration: 0.35 });
      map.invalidateSize();

      // 6. Notify parent state & exit placing mode
      onCoordinatesChange?.(newLat, newLng);
      setMapNotice(`Hospital geofence center placed at ${newLat.toFixed(4)}°N, ${newLng.toFixed(4)}°E`);
      setIsPlacingPinMode(false);
    };

    // Interactive Dragging Handlers
    if (interactive) {
      // 1. Hospital center drag
      centerMarker.on('drag', (e: L.LeafletEvent) => {
        const marker = e.target as L.Marker;
        const pos = marker.getLatLng();
        if (geofenceCircleRef.current) geofenceCircleRef.current.setLatLng(pos);
        if (toleranceCircleRef.current) toleranceCircleRef.current.setLatLng(pos);
        if (radiusHandleMarkerRef.current) {
          const newHandlePos = getRadiusHandlePosition(pos.lat, pos.lng, radiusMeters);
          radiusHandleMarkerRef.current.setLatLng(newHandlePos);
        }
        if (distanceLineRef.current && testInternMarkerRef.current) {
          distanceLineRef.current.setLatLngs([pos, testInternMarkerRef.current.getLatLng()]);
        }
      });

      centerMarker.on('dragend', (e: L.LeafletEvent) => {
        const marker = e.target as L.Marker;
        const pos = marker.getLatLng();
        handlePlaceOrMoveCenter(pos);
      });

      // 2. Radius handle drag (Interactive boundary resizing right on the map!)
      if (onRadiusChange) {
        radiusHandle.on('drag', (e: L.LeafletEvent) => {
          const handleMarker = e.target as L.Marker;
          const handlePos = handleMarker.getLatLng();
          const centerPos = centerMarker.getLatLng();
          const rawDistance = Math.round(centerPos.distanceTo(handlePos));
          const clamped = Math.max(25, Math.min(800, rawDistance));

          if (geofenceCircleRef.current) geofenceCircleRef.current.setRadius(clamped);
          if (toleranceCircleRef.current) toleranceCircleRef.current.setRadius(clamped + toleranceMeters);
          radiusHandle.setIcon(createRadiusHandleIcon(clamped));

          // Check test intern against new radius
          if (testInternMarkerRef.current) {
            const internDist = Math.round(centerPos.distanceTo(testInternMarkerRef.current.getLatLng()));
            const isInside = internDist <= clamped;
            testInternMarkerRef.current.setIcon(createTestInternIcon(internDist, isInside));
            if (distanceLineRef.current) {
              distanceLineRef.current.setStyle({ color: isInside ? '#059669' : '#dc2626' });
            }
          }
        });

        radiusHandle.on('dragend', (e: L.LeafletEvent) => {
          const handleMarker = e.target as L.Marker;
          const handlePos = handleMarker.getLatLng();
          const centerPos = centerMarker.getLatLng();
          const rawDistance = Math.round(centerPos.distanceTo(handlePos));
          const clamped = Math.max(25, Math.min(800, rawDistance));

          onRadiusChange(clamped);
          // Snap handle exactly to East at clamped radius
          const snappedPos = getRadiusHandlePosition(centerPos.lat, centerPos.lng, clamped);
          handleMarker.setLatLng(snappedPos);
          setMapNotice(`Geofence perimeter adjusted to ${clamped} meters.`);
        });
      }

      // 3. Test intern drag (Live verification of geofence breach vs safe)
      testInternMarker.on('drag', (e: L.LeafletEvent) => {
        const marker = e.target as L.Marker;
        const internPos = marker.getLatLng();
        const centerPos = centerMarker.getLatLng();
        const dist = Math.round(centerPos.distanceTo(internPos));
        const isInside = dist <= radiusMeters;

        marker.setIcon(createTestInternIcon(dist, isInside));
        if (distanceLineRef.current) {
          distanceLineRef.current.setLatLngs([centerPos, internPos]);
          distanceLineRef.current.setStyle({ color: isInside ? '#059669' : '#dc2626' });
        }
      });

      testInternMarker.on('dragend', (e: L.LeafletEvent) => {
        const marker = e.target as L.Marker;
        const internPos = marker.getLatLng();
        const centerPos = centerMarker.getLatLng();
        const dist = Math.round(centerPos.distanceTo(internPos));
        const isInside = dist <= radiusMeters;

        setMapNotice(
          isInside
            ? `Intern is INSIDE perimeter (${dist}m ≤ ${radiusMeters}m). Attendance valid.`
            : `GEOFENCE BREACH ALERT! Intern is ${dist}m away (exceeds ${radiusMeters}m perimeter).`
        );
      });

      // 4. Click anywhere on map to drop or reposition pin
      map.on('click', (e: L.LeafletMouseEvent) => {
        handlePlaceOrMoveCenter(e.latlng);
      });
    }

    // Layer group for intern student dots
    internMarkersLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    // ResizeObserver to ensure map always recalculates and renders without blank tiles
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    // Initial redraw
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when style changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const tileConfig = TILE_LAYERS[activeTile];
    tileLayerRef.current = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom,
    }).addTo(mapInstanceRef.current);
  }, [activeTile]);

  // Update Center Marker Position & Circles when props change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const latLng = L.latLng(latitude, longitude);

    if (centerMarkerRef.current) {
      centerMarkerRef.current.setLatLng(latLng);
    }

    if (geofenceCircleRef.current) {
      geofenceCircleRef.current.setLatLng(latLng);
      geofenceCircleRef.current.setRadius(radiusMeters);
    }

    if (toleranceCircleRef.current) {
      toleranceCircleRef.current.setLatLng(latLng);
      toleranceCircleRef.current.setRadius(radiusMeters + toleranceMeters);
    }

    if (radiusHandleMarkerRef.current) {
      const handlePos = getRadiusHandlePosition(latitude, longitude, radiusMeters);
      radiusHandleMarkerRef.current.setLatLng(handlePos);
      radiusHandleMarkerRef.current.setIcon(createRadiusHandleIcon(radiusMeters));
    }

    // Synchronize test intern marker near center if it was far away
    if (testInternMarkerRef.current && distanceLineRef.current) {
      const currentTestPos = testInternMarkerRef.current.getLatLng();
      const currentDist = Math.round(latLng.distanceTo(currentTestPos));
      if (currentDist > radiusMeters * 3) {
        const centerLatRad = (latitude * Math.PI) / 180;
        const safeOffset = Math.round(radiusMeters * 0.45);
        const lngOff = safeOffset / (111320 * Math.cos(centerLatRad));
        const newTestPos = L.latLng(latitude + 0.00015, longitude + lngOff);
        testInternMarkerRef.current.setLatLng(newTestPos);
        testInternMarkerRef.current.setIcon(createTestInternIcon(safeOffset, true));
        distanceLineRef.current.setLatLngs([latLng, newTestPos]);
        distanceLineRef.current.setStyle({ color: '#059669' });
      } else {
        distanceLineRef.current.setLatLngs([latLng, currentTestPos]);
      }
    }

    mapInstanceRef.current.invalidateSize();
  }, [latitude, longitude, radiusMeters, toleranceMeters, getRadiusHandlePosition, createRadiusHandleIcon, createTestInternIcon]);

  // Update Center Marker Icon ONLY when hospitalName actually changes
  useEffect(() => {
    if (centerMarkerRef.current) {
      centerMarkerRef.current.setIcon(createCenterPinIcon(hospitalName));
    }
  }, [hospitalName, createCenterPinIcon]);

  // Render Intern Markers on the map
  useEffect(() => {
    if (!mapInstanceRef.current || !internMarkersLayerRef.current) return;

    internMarkersLayerRef.current.clearLayers();

    interns.forEach((intern) => {
      const isBreach = intern.current_status === 'NEEDS ATTENTION' || intern.current_status === 'FAILED';
      const regDigits = (intern.register_number || '1').replace(/\D/g, '0') || '1';
      const angle = (parseInt(regDigits, 10) * 67) % 360;
      const angleRad = (angle * Math.PI) / 180;
      
      const dist = isBreach ? radiusMeters + 160 : Math.max(30, radiusMeters * 0.45);
      const latOffset = (dist * Math.cos(angleRad)) / 111320;
      const lngOffset = (dist * Math.sin(angleRad)) / (111320 * Math.cos((latitude * Math.PI) / 180));

      const internLat = latitude + latOffset;
      const internLng = longitude + lngOffset;

      const dotIcon = L.divIcon({
        className: 'intern-map-marker-wrapper',
        html: `
          <div class="relative flex flex-col items-center pointer-events-auto select-none" style="width: 28px; height: 38px;">
            <div class="w-7 h-7 rounded-full border-2 ${
              isBreach
                ? 'bg-rose-600 border-white ring-rose-400'
                : 'bg-emerald-600 border-white ring-emerald-400'
            } text-white text-[10px] font-bold flex items-center justify-center shadow-lg ring-2">
              ${(intern.name || 'I').charAt(0)}
            </div>
            <div class="w-1.5 h-1.5 ${
              isBreach ? 'bg-rose-600' : 'bg-emerald-600'
            } rotate-45 -mt-1 z-0 border-r border-b border-white"></div>
            <span class="absolute top-8 px-1 bg-slate-900/90 text-[8px] font-medium text-white rounded shadow border border-slate-700 whitespace-nowrap">
              ${(intern.name || 'Intern').split(' ')[0]} (${dist}m)
            </span>
          </div>
        `,
        iconSize: [28, 38],
        iconAnchor: [14, 28],
      });

      const internMarker = L.marker([internLat, internLng], {
        icon: dotIcon,
        interactive: true,
      }).addTo(internMarkersLayerRef.current!);

      internMarker.bindPopup(`
        <div style="font-family: Inter, sans-serif; font-size: 11px; padding: 2px;">
          <strong style="color: #003e6f;">${intern.name || 'Intern'}</strong> (${intern.register_number || 'N/A'})<br/>
          <strong>Dept:</strong> ${intern.department || 'Clinical'}<br/>
          <strong>Status:</strong> <span style="color: ${isBreach ? '#ba1a1a' : '#006129'}; font-weight: bold;">
            ${intern.current_status} (${dist}m)
          </span><br/>
          <strong>Shift:</strong> ${intern.shift_name || 'Shift'} (${intern.shift_time || 'Standard'})
        </div>
      `);
    });
  }, [interns, latitude, longitude, radiusMeters]);

  // Free Nominatim OpenStreetMap Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowSearchResults(true);

    try {
      const endpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchQuery
      )}&limit=5`;
      const res = await fetch(endpoint, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'InternTrack-Clinical-Geofence/1.0',
        },
      });
      const data = await res.json();
      setSearchResults(data);
      if (data.length === 0) {
        setMapNotice('No locations found. Try searching by hospital name or city.');
      }
    } catch {
      setMapNotice('Search service temporarily unavailable.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: { lat: string; lon: string; display_name: string }) => {
    const newLat = parseFloat(result.lat);
    const newLng = parseFloat(result.lon);
    onCoordinatesChange?.(newLat, newLng);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([newLat, newLng], 17, { duration: 1.2 });
    }

    setShowSearchResults(false);
    setSearchQuery(result.display_name.split(',')[0]);
    setMapNotice(`Centered on: ${result.display_name.split(',')[0]}`);
  };

  // Device Geolocation (GPS)
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setMapNotice('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        onCoordinatesChange?.(lat, lng);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 17, { duration: 1.2 });
        }
        setIsLocating(false);
        setMapNotice(`GPS acquired (±${Math.round(pos.coords.accuracy)}m accuracy)`);
      },
      (err) => {
        setIsLocating(false);
        setMapNotice(err.code === err.PERMISSION_DENIED ? 'GPS permission denied.' : 'GPS fix failed.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Quick Center on Hospital
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([latitude, longitude], 17, { duration: 0.8 });
    }
  };

  // Quick preset radius setter
  const handleRadiusPreset = (preset: number) => {
    onRadiusChange?.(preset);
    setMapNotice(`Geofence set to ${preset}m preset`);
  };

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-outline-variant/60 shadow-sm flex flex-col bg-surface ${className} ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none h-screen' : ''
      }`}
    >
      {/* Free Map Header Info Pill */}
      <div className="bg-primary/95 text-white px-3 py-1.5 flex items-center justify-between text-[11px] font-medium z-10 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[15px] text-emerald-300">public</span>
          <span className="font-bold">Free OpenStreetMap Geofence</span>
          <span className="hidden sm:inline text-white/80 font-normal">• 100% Free & Open (No API Key Required)</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] bg-white/15 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Live GPS Active</span>
        </div>
      </div>

      {/* Search & Action Bar */}
      <div className="absolute top-10 left-2 right-2 z-[400] flex flex-col gap-1.5 pointer-events-none">
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Free Nominatim Search Form */}
          <form onSubmit={handleSearch} className="flex-1 relative flex items-center shadow-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hospital, city or street (OpenStreetMap)..."
              className="w-full bg-white/95 backdrop-blur-md text-on-surface text-xs font-medium pl-8 pr-8 py-2 rounded-xl border border-outline-variant/60 shadow-inner focus:outline-primary placeholder:text-on-surface-variant/70"
            />
            <span className="material-symbols-outlined absolute left-2.5 text-[16px] text-on-surface-variant pointer-events-none">
              search
            </span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchResults(false);
                }}
                className="absolute right-2 text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </form>

          {/* Place Pin Toggle */}
          {interactive && (
            <button
              type="button"
              onClick={() => {
                setIsPlacingPinMode(!isPlacingPinMode);
                setMapNotice(
                  !isPlacingPinMode
                    ? 'Click anywhere on the map to place hospital center'
                    : 'Pin placement cancelled'
                );
              }}
              title="Click on map to drop hospital pin"
              className={`p-2 rounded-xl border shadow-md transition-all cursor-pointer shrink-0 flex items-center gap-1 text-xs font-semibold ${
                isPlacingPinMode
                  ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
                  : 'bg-white/95 backdrop-blur-md text-on-surface border-outline-variant/60 hover:bg-primary hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">add_location_alt</span>
              <span className="hidden sm:inline">Drop Pin</span>
            </button>
          )}

          {/* Device GPS Button */}
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            title="Calibrate geofence to your current physical GPS location"
            className="p-2 bg-white/95 backdrop-blur-md rounded-xl border border-outline-variant/60 shadow-md text-primary hover:bg-primary hover:text-white transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            <span className={`material-symbols-outlined text-[18px] ${isLocating ? 'animate-spin' : ''}`}>
              {isLocating ? 'sync' : 'my_location'}
            </span>
          </button>

          {/* Fullscreen toggle */}
          <button
            type="button"
            onClick={() => {
              setIsFullscreen(!isFullscreen);
              setTimeout(() => {
                mapInstanceRef.current?.invalidateSize();
              }, 200);
            }}
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen Map'}
            className="p-2 bg-white/95 backdrop-blur-md rounded-xl border border-outline-variant/60 shadow-md text-on-surface-variant hover:text-on-surface transition-all cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
            </span>
          </button>
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && searchResults.length > 0 && (
          <div className="bg-white/95 backdrop-blur-md border border-outline-variant/60 rounded-xl shadow-xl max-h-48 overflow-y-auto p-1 pointer-events-auto space-y-0.5">
            {searchResults.map((result, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSearchResult(result)}
                className="w-full text-left p-2 rounded-lg text-xs hover:bg-primary/10 transition-colors flex items-start gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5">
                  location_on
                </span>
                <span className="line-clamp-2 text-[11px] text-on-surface font-medium leading-tight">
                  {result.display_name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Drop Pin Mode Active Floating Instruction Pill */}
      {isPlacingPinMode && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[450] bg-amber-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-full shadow-2xl flex items-center gap-2 border-2 border-white pointer-events-auto animate-bounce select-none">
          <span className="material-symbols-outlined text-[16px]">touch_app</span>
          <span>Click anywhere on the map to drop hospital pin</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsPlacingPinMode(false);
              setMapNotice('Pin drop cancelled');
            }}
            className="ml-1 bg-black/20 hover:bg-black/30 rounded-full w-4 h-4 flex items-center justify-center text-[10px] cursor-pointer"
            title="Cancel"
          >
            ✕
          </button>
        </div>
      )}

      {/* Interactive Leaflet Container */}
      <div
        ref={mapContainerRef}
        id="free-geofence-map-container"
        className={`w-full flex-1 z-0 relative min-h-[300px] ${
          isPlacingPinMode ? 'cursor-crosshair' : 'cursor-default'
        }`}
        style={{ minHeight: '300px' }}
      />

      {/* Radius Quick Presets Overlay (Top-Right) */}
      {onRadiusChange && (
        <div className="absolute top-22 right-2 z-[400] flex flex-col items-end gap-1 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-2 shadow-md border border-outline-variant/60 flex flex-col items-center gap-1.5">
            <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
              Radius Presets
            </span>
            <div className="grid grid-cols-2 gap-1 text-[10px] font-bold">
              {[50, 100, 150, 250, 400].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleRadiusPreset(preset)}
                  className={`px-1.5 py-1 rounded-md transition-colors cursor-pointer ${
                    radiusMeters === preset
                      ? 'bg-primary text-white shadow-2xs'
                      : 'bg-surface-container hover:bg-primary/20 text-on-surface'
                  }`}
                >
                  {preset}m
                </button>
              ))}
            </div>

            <div className="w-full border-t border-outline-variant/40 pt-1 flex items-center justify-between text-xs font-mono font-bold text-primary">
              <span>{radiusMeters}m</span>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => onRadiusChange(Math.max(25, radiusMeters - 25))}
                  className="w-5 h-5 bg-surface-container hover:bg-primary hover:text-white rounded flex items-center justify-center font-bold cursor-pointer"
                  title="Shrink -25m"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() => onRadiusChange(Math.min(800, radiusMeters + 25))}
                  className="w-5 h-5 bg-surface-container hover:bg-primary hover:text-white rounded flex items-center justify-center font-bold cursor-pointer"
                  title="Expand +25m"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Tile Style Selector (Bottom-Left) */}
      <div className="absolute bottom-2 left-2 z-[400] flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-md border border-outline-variant/60 text-[10px] font-semibold text-on-surface">
        {(Object.keys(TILE_LAYERS) as MapTileStyle[]).map((style) => (
          <button
            key={style}
            type="button"
            onClick={() => setActiveTile(style)}
            className={`px-2 py-1 rounded-lg capitalize transition-all cursor-pointer ${
              activeTile === style
                ? 'bg-primary text-white shadow-xs font-bold'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            {style === 'streets' ? 'OSM Standard' : style}
          </button>
        ))}

        <div className="h-3.5 w-[1px] bg-outline-variant/60 mx-0.5"></div>

        {/* Recenter Button */}
        <button
          type="button"
          onClick={handleRecenter}
          title="Recenter view on Hospital pin"
          className="px-2 py-1 text-primary hover:bg-primary/10 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span className="material-symbols-outlined text-[14px]">center_focus_strong</span>
          <span>Center</span>
        </button>
      </div>

      {/* Floating Instructions Banner (Bottom) */}
      {mapNotice && (
        <div className="absolute bottom-2 right-12 z-[400] hidden sm:flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] shadow-md border border-white/20 pointer-events-none">
          <span className="material-symbols-outlined text-[13px] text-emerald-400">info</span>
          <span className="truncate max-w-[280px]">{mapNotice}</span>
        </div>
      )}
    </div>
  );
};
