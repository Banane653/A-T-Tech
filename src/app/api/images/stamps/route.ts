export const dynamic = 'force-dynamic';

const getIconPath = (shape: string) => {
    switch(shape) {
        case 'coffee': return 'M-14,-12 H10 V4 C10,12 4,16 -2,16 C-8,16 -14,12 -14,4 Z M10,-6 H16 C20,-6 20,2 16,2 H10 Z';
        case 'pizza': return 'M0,18 L-18,-12 Q0,-20 18,-12 Z M-6,-4 A3,3 0 1,0 -5.9,-4 M6,4 A3,3 0 1,0 6.1,4 M2,-12 A2,2 0 1,0 2.1,-12';
        case 'gift': return 'M-14,-4 H14 V18 H-14 Z M-16,-12 H16 V-4 H-16 Z M-2,-12 C-12,-22 -16,-4 -2,-12 Z M2,-12 C12,-22 16,-4 2,-12 Z';
        case 'nails': return 'M-5,-16 H5 V-2 H-5 Z M-12,-2 H12 V10 C12,18 8,22 0,22 C-8,22 -12,18 -12,10 Z';        
        case 'star':
        default: return 'M0 -25 L7.3 -10 L23.7 -7.7 L11.8 3.8 L14.7 20 L0 12.3 L-14.7 20 L-11.8 3.8 L-23.7 -7.7 L-7.3 -10 Z';
    }
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    
    const count = parseInt(searchParams.get('count') || '0');
    // On force les couleurs à avoir un format propre (#000000)
    let color = (searchParams.get('color') || '#000000').toUpperCase();
    if (!color.startsWith('#')) color = '#' + color;
    
    let stampColor = '#FFFFFF';
    const stampColorParam = searchParams.get('stampColor');
    
    if (stampColorParam) {
        stampColor = stampColorParam.toUpperCase();
        if (!stampColor.startsWith('#')) stampColor = '#' + stampColor;
    } else {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16) || 0;
        const g = parseInt(hex.substring(2, 4), 16) || 0;
        const b = parseInt(hex.substring(4, 6), 16) || 0;
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        stampColor = brightness > 160 ? '#000000' : '#FFFFFF';
    }

    const shape = searchParams.get('shape') || 'star';
    const max = parseInt(searchParams.get('max') || '10'); 

    const iconPath = getIconPath(shape);
    const WIDTH = 1125;
    const HEIGHT = 369;

    let icons = '';
    const cols = max <= 5 ? max : Math.ceil(max / 2);
    const spacingX = max <= 5 ? 200 : 170;
    const gridWidth = (cols - 1) * spacingX;
    
    const startX = (WIDTH - gridWidth) / 2;
    const startY = max <= 5 ? HEIGHT / 2 : 92.25;

    for (let i = 0; i < max; i++) {
        let x, y;
        if (max <= 5) {
             x = startX + i * spacingX;
             y = startY;
        } else if (max === 9) {
             if (i < 5) {
                 x = startX + i * spacingX;
                 y = startY;
             } else {
                 const xOffset = spacingX / 2; 
                 x = startX + xOffset + (i - 5) * spacingX;
                 y = startY + 184.5;
             }
        } else {
             x = startX + (i % 5) * spacingX;
             y = startY + Math.floor(i / 5) * 184.5;
        }

        const isFilled = i < count;

        // LA CORRECTION EST ICI : 
        // 1. Plus aucun attribut CSS complexe (rgba, opacity, etc.)
        // 2. On utilise une astuce : pour les tampons vides, le rond est de la couleur de fond (invisible)
        // et son contour (stroke) est de la couleur voulue. C'est du SVG 1.0 basique que "sharp" lira à 100%.
        if (isFilled) {
            icons += `
                <g transform="translate(${x}, ${y})">
                    <circle cx="0" cy="0" r="65" fill="${stampColor}" />
                    <g transform="scale(1.5)"><path d="${iconPath}" fill="${color}" fill-rule="evenodd" /></g>
                </g>
            `;
        } else {
            icons += `
                <g transform="translate(${x}, ${y})">
                    <circle cx="0" cy="0" r="65" fill="${color}" stroke-dasharray="10 10" stroke="${stampColor}" stroke-width="4" />
                </g>
            `;
        }
    }

    const svg = `
        <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
            <rect width="${WIDTH}" height="${HEIGHT}" fill="${color}" />
            ${icons}
        </svg>
    `;

    return new Response(svg, {
        headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        },
    });
}