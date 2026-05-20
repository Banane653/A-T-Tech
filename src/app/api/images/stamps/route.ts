import { NextResponse } from 'next/server';

// Dictionnaire des formes mathématiques SVG (centrées sur 0,0)
const getIconPath = (shape: string) => {
    switch(shape) {
        case 'coffee':
            return 'M-14,-12 H10 V4 C10,12 4,16 -2,16 C-8,16 -14,12 -14,4 Z M10,-6 H16 C20,-6 20,2 16,2 H10 Z';
        case 'pizza':
            return 'M0,18 L-18,-12 Q0,-20 18,-12 Z M-6,-4 A3,3 0 1,0 -5.9,-4 M6,4 A3,3 0 1,0 6.1,4 M2,-12 A2,2 0 1,0 2.1,-12';
        case 'gift':
            return 'M-14,-4 H14 V18 H-14 Z M-16,-12 H16 V-4 H-16 Z M-2,-12 C-12,-22 -16,-4 -2,-12 Z M2,-12 C12,-22 16,-4 2,-12 Z';
        case 'star':
        default:
            return 'M0 -25 L7.3 -10 L23.7 -7.7 L11.8 3.8 L14.7 20 L0 12.3 L-14.7 20 L-11.8 3.8 L-23.7 -7.7 L-7.3 -10 Z';
    }
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    
    const count = parseInt(searchParams.get('count') || '0');
    const color = searchParams.get('color') || '#000000';
    const shape = searchParams.get('shape') || 'star';
    const total = 10;

    const iconPath = getIconPath(shape);

    // 👇 NOUVELLES DIMENSIONS RÉTINA POUR APPLE WALLET (Ratio 375x123) 👇
    const WIDTH = 1125;
    const HEIGHT = 369;

    // Construction de la grille SVG
    let icons = '';
    for (let i = 0; i < total; i++) {
        // Nouveau calcul de la grille pour espacer parfaitement les 10 badges
        const x = 112.5 + (i % 5) * 225;
        const y = 92.25 + Math.floor(i / 5) * 184.5;
        const isFilled = i < count;

        icons += `
            <g transform="translate(${x}, ${y})">
                <circle cx="0" cy="0" r="65" fill="${isFilled ? 'white' : 'rgba(255,255,255,0.2)'}" />
                <g transform="scale(1.5)">
                    <path d="${iconPath}" 
                          fill="${isFilled ? color : 'white'}" 
                          fill-rule="evenodd" /> 
                </g>
            </g>
        `;
    }

    const svg = `
        <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${color};stop-opacity:0.8" />
                </linearGradient>
            </defs>
            
            <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grad)" />
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