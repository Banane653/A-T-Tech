import { NextResponse } from 'next/server';

// Dictionnaire des formes mathématiques SVG (centrées sur 0,0)
const getIconPath = (shape: string) => {
    switch(shape) {
        case 'coffee':
            // Une tasse de café avec son anse (dessinée avec des courbes de Bézier)
            return 'M-14,-12 H10 V4 C10,12 4,16 -2,16 C-8,16 -14,12 -14,4 Z M10,-6 H16 C20,-6 20,2 16,2 H10 Z';
        case 'pizza':
            // Une part de pizza avec 3 pepperonis (les cercles créent des "trous" grâce au fill-rule)
            return 'M0,18 L-18,-12 Q0,-20 18,-12 Z M-6,-4 A3,3 0 1,0 -5.9,-4 M6,4 A3,3 0 1,0 6.1,4 M2,-12 A2,2 0 1,0 2.1,-12';
        case 'gift':
            // Un paquet cadeau avec un ruban et deux boucles
            return 'M-14,-4 H14 V18 H-14 Z M-16,-12 H16 V-4 H-16 Z M-2,-12 C-12,-22 -16,-4 -2,-12 Z M2,-12 C12,-22 16,-4 2,-12 Z';
        case 'star':
        default:
            // L'étoile classique
            return 'M0 -25 L7.3 -10 L23.7 -7.7 L11.8 3.8 L14.7 20 L0 12.3 L-14.7 20 L-11.8 3.8 L-23.7 -7.7 L-7.3 -10 Z';
    }
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    
    // On récupère les paramètres, en ajoutant 'shape'
    const count = parseInt(searchParams.get('count') || '0');
    const color = searchParams.get('color') || '#000000';
    const shape = searchParams.get('shape') || 'star'; // 👈 NOUVEAU
    const total = 10;

    const iconPath = getIconPath(shape);

    // Construction de la grille SVG
    let icons = '';
    for (let i = 0; i < total; i++) {
        const x = 50 + (i % 5) * 110;
        const y = 60 + Math.floor(i / 5) * 110;
        const isFilled = i < count;

        icons += `
            <g transform="translate(${x}, ${y})">
                <circle cx="0" cy="0" r="45" fill="${isFilled ? 'white' : 'rgba(255,255,255,0.2)'}" />
                <path d="${iconPath}" 
                      fill="${isFilled ? color : 'white'}" 
                      fill-rule="evenodd" /> 
            </g>
        `;
    }

    const svg = `
        <svg width="600" height="280" viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${color};stop-opacity:0.8" />
                </linearGradient>
            </defs>
            
            <rect width="600" height="280" rx="30" fill="url(#grad)" />
            ${icons}
        </svg>
    `;

    return new Response(svg, {
        headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'no-cache'
        },
    });
}