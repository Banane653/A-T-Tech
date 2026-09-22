'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Correctif pour les icônes
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Composant intelligent qui recadre la carte pour voir tous les marqueurs
function MapBounds({ locations }: { locations: { lat: number; lng: number }[] }) {
    const map = useMap();
    useEffect(() => {
        if (locations.length === 0) return;
        if (locations.length === 1) {
            map.setView([locations[0].lat, locations[0].lng], 15, { animate: true });
        } else {
            const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
            map.fitBounds(bounds, { padding: [40, 40], animate: true });
        }
    }, [locations, map]);
    return null;
}

export default function MapPreview({ locations }: { locations: { lat: number; lng: number }[] }) {
    // Centre par défaut (Bruxelles) si aucune adresse
    const center: [number, number] = locations.length > 0 ? [locations[0].lat, locations[0].lng] : [50.8503, 4.3517];

    return (
        <div className="w-full h-64 rounded-xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
            <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap'
                />
                {locations.map((loc, i) => (
                    <Marker key={i} position={[loc.lat, loc.lng]} />
                ))}
                <MapBounds locations={locations} />
            </MapContainer>
        </div>
    );
}