'use client';

import { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, X, Maximize2 } from 'lucide-react';

type RegisterQrCodeProps = {
  registerUrl: string;
  merchantName: string;
};

export default function RegisterQrCode({ registerUrl, merchantName }: RegisterQrCodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // Fonction pour télécharger le QR Code au format PNG
  const handleDownload = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;

    // Convertir le canvas en URL d'image PNG
    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    
    // Créer un lien de téléchargement invisible et cliquer dessus
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    // Nom du fichier : ex "QR_Code_Tif_Hair.png"
    downloadLink.download = `QR_Code_${merchantName.replace(/\s+/g, '_')}.png`;
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <>
      {/* 1. La miniature affichée sur la page - TAILLE RÉDUITE */}
      <div className="flex flex-col items-center gap-1.5 non-printable"> {/* Ajout de gap-1.5 et d'une classe pour l'impression si besoin */}
        <button
          onClick={() => setIsOpen(true)}
          className="relative group overflow-hidden rounded-lg border border-gray-200 hover:border-blue-500 transition-colors p-1.5 bg-white shadow-sm"
          title="Agrandir le QR Code"
        >
          {/* 👇 TAILLE RÉDUITE DE 80 À 64 👇 */}
          <QRCodeCanvas value={registerUrl} size={64} level="H" /> 
          
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Maximize2 className="text-white w-5 h-5" />
          </div>
        </button>
        <span className="text-[11px] text-gray-400 font-medium">Imprimer</span>
      </div>

      {/* 2. La modale (Pop-up) affichée quand isOpen est true */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center animate-in fade-in zoom-in duration-200">
            
            {/* Bouton fermer */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
              QR Code d'inscription
            </h3>
            <p className="text-sm text-gray-500 text-center mb-8">
              Les clients peuvent scanner ce code pour s'inscrire à votre programme de fidélité.
            </p>

            {/* Le QR Code en grand (avec la ref pour le téléchargement) */}
            <div ref={qrRef} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-8">
              <QRCodeCanvas 
                value={registerUrl} 
                size={250} 
                level="H" // Niveau de correction d'erreur élevé
                includeMargin={true}
              />
            </div>

            {/* Bouton de téléchargement */}
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              <Download className="w-5 h-5" />
              Télécharger pour impression
            </button>
          </div>
        </div>
      )}
    </>
  );
}