import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import ClientLayout from '@/components/ClientLayout';

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    setRequestLocale(locale);

    let messages;
    try {
        messages = (await import(`../../messages/${locale}.json`)).default;
    } catch {
        notFound();
    }

    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            <ClientLayout>
                {children}
            </ClientLayout>
        </NextIntlClientProvider>
    );
}
