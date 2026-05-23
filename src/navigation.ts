import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fr', 'en', 'nl'],
  defaultLocale: 'fr'
});

// On exporte nos nouveaux outils intelligents !
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);