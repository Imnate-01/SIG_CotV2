import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
    locales: ['es', 'en'],
    defaultLocale: 'es',
    localePrefix: 'as-needed' // No muestra /es/ para el default, solo /en/
});

// Exportar versiones localizadas de los hooks de navegación
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
