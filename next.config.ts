import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

// On indique où se trouvera notre fichier de configuration i18n
const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    '192.168.1.8', 
    'http://192.168.1.8:3000', 
    '192.168.1.27', 
    'http://192.168.1.27:3000'
  ],
};

// On englobe ta configuration avec le plugin
export default withNextIntl(nextConfig);