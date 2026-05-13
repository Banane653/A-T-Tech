import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    
    // On récupère les paramètres (ex: ?count=3&color=%23ff0000)
    const count = parseInt(searchParams.get('count') || '0');
    const color = searchParams.get('color') || '#000000';
    const total = 10; // On reste sur une base de 10 tampons

    // Construction du SVG (Dessin mathématique)
    // On crée une grille de 2 lignes et 5 colonnes
    let icons = '';
    for (let i = 0; i < total; i++) {
        const x = 50 + (i % 5) * 110; // Position X
        const y = 60 + Math.floor(i / 5) * 110; // Position Y
        const isFilled = i < count;

        icons += `
            <g transform="translate(${x}, ${y})">
                <circle cx="0" cy="0" r="45" fill="${isFilled ? 'white' : 'rgba(255,255,255,0.2)'}" />
                <path d="M0 -25 L7.3 -10 L23.7 -7.7 L11.8 3.8 L14.7 20 L0 12.3 L-14.7 20 L-11.8 3.8 L-23.7 -7.7 L-7.3 -10 Z" 
                      fill="${isFilled ? color : 'white'}" />
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

    // On renvoie l'image avec le bon type MIME
    return new Response(svg, {
        headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'no-cache' // Important pour que l'image change direct au scan
        },
    });
}