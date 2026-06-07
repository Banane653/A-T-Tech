// src/config/templates.ts

export type TemplateType = 'STAMPS' | 'POINTS';

export interface CardTemplate {
    id: string;
    type: TemplateType;
    name: string;
    description: string;
    
    // --- Propriétés secrètes pour notre moteur de génération ---
    stampShape?: 'star' | 'coffee' | 'pizza' | 'gift' | 'nails'; // Quel dessin pour les tampons ?
    backgroundImage?: string; // Quelle image de fond pour les points ?
}

export const CARD_TEMPLATES: CardTemplate[] = [
    // -------------------------
    // 🎨 MODÈLES POUR TAMPONS
    // -------------------------
    {
        id: 'stamps_stars',
        type: 'STAMPS',
        name: 'Classique Étoiles',
        description: 'Des étoiles élégantes qui se remplissent.',
        stampShape: 'star',
    },
    {
        id: 'stamps_coffee',
        type: 'STAMPS',
        name: 'Coffee Shop',
        description: 'Des tasses de café pour les baristas.',
        stampShape: 'coffee',
    },
    {
        id: 'stamps_pizza',
        type: 'STAMPS',
        name: 'Pizza Lover',
        description: 'Une part de pizza pour récompenser la gourmandise.',
        stampShape: 'pizza',
    },
    {
        id: 'stamps_gift',
        type: 'STAMPS',
        name: 'Cadeau Surprise',
        description: 'De jolis paquets cadeaux pour récompenser la fidélité.',
        stampShape: 'gift',
    },
    {
        id: 'stamps_nails',
        type: 'STAMPS',
        name: 'Nails',
        description: 'Des ongles pour récompenser la fidélité.',
        stampShape: 'nails',
    },
    // -------------------------
    // 💳 MODÈLES POUR POINTS
    // -------------------------
    {
        id: 'points_minimal',
        type: 'POINTS',
        name: 'Couleur Unie (Minimaliste)',
        description: 'Un design épuré utilisant uniquement votre couleur principale.',
        backgroundImage: undefined, // Pas d'image, le moteur utilisera juste la couleur
    },
    {
        id: 'points_gold',
        type: 'POINTS',
        name: 'Luxe Or',
        description: 'Une texture dorée premium pour vos clients VIP.',
        backgroundImage: '/templates/points-gold-bg.png', // On ajoutera cette image plus tard
    },
    {
        id: 'points_abstract',
        type: 'POINTS',
        name: 'Moderne Abstrait',
        description: 'Des formes géométriques modernes et dynamiques.',
        backgroundImage: '/templates/points-abstract-bg.png', // On ajoutera cette image plus tard
    }
];

// --- 🛠️ Petits outils pratiques pour notre code ---

// Trouver un modèle précis grâce à son ID
export const getTemplateById = (id: string) => {
    // Si on ne trouve pas l'ID, on renvoie les étoiles par défaut pour éviter un crash
    return CARD_TEMPLATES.find(t => t.id === id) || CARD_TEMPLATES[0]; 
};

// Récupérer uniquement les modèles d'une certaine catégorie (Points OU Tampons)
export const getTemplatesByType = (type: TemplateType) => {
    return CARD_TEMPLATES.filter(t => t.type === type);
};