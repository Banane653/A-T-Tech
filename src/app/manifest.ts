// src/app/manifest.ts
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cardeo - Espace Gérant',
    short_name: 'Cardeo',
    description: 'Scannez les cartes de vos clients et gérez votre programme de fidélité.',
    start_url: '/login', // L'URL qui s'ouvre quand ils cliquent sur l'icône
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff', 
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}