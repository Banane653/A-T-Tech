'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Correctif pour afficher correctement l'icône du marqueur bleu sous Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Petit sous-composant invisible qui recentre la carte quand l'adresse change
function MapUpdater({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng], 15, { animate: true });
    }, [lat, lng, map]);
    return null;
}

export default function MapPreview({ latitude, longitude }: { latitude: number; longitude: number }) {
    return (
        <div className="w-full h-48 rounded-xl overflow-hidden border border-gray-200 shadow-sm relative z-0 mt-3">
            <MapContainer 
                center={[latitude, longitude]} 
                zoom={15} 
                style={{ height: '100%', width: '100%' }} 
                zoomControl={false}
                dragging={false} // On bloque le glissement pour que ça reste un simple aperçu
                scrollWheelZoom={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap'
                />
                <Marker position={[latitude, longitude]} />
                <MapUpdater lat={latitude} lng={longitude} />
            </MapContainer>
        </div>
    );
}