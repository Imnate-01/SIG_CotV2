"use client";

import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function VerificadoPage() {
  const router = useRouter();
  const t = useTranslations("Verificado");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-black flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 shadow-2xl rounded-2xl max-w-6xl w-full flex overflow-hidden border border-transparent dark:border-zinc-800">
        {/* Columna IZQUIERDA: Contenido */}
        <div className="w-full md:w-1/2 px-8 sm:px-12 lg:px-16 py-16 flex flex-col items-center justify-center text-center">
          <div className="mb-8">
            <img
              src="/SIG_logo.png"
              alt="Logo SIG"
              className="h-16 w-auto object-contain dark:brightness-100 mx-auto"
            />
          </div>

          {/* Ícono animado de éxito */}
          <div className="relative mb-8">
            <div className="absolute inset-0 animate-ping rounded-full bg-green-400/20 w-28 h-28 mx-auto" />
            <div className="relative w-28 h-28 mx-auto bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
              <svg
                className="w-14 h-14 text-white animate-[fadeInScale_0.5s_ease-out_forwards]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-tight mb-3">
            {t("title")}
          </h1>

          <p className="text-lg text-slate-600 dark:text-gray-400 mb-2 max-w-sm">
            {t("subtitle")}
          </p>

          <p className="text-base text-slate-500 dark:text-gray-500 mb-10 max-w-sm">
            {t("description")}
          </p>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full max-w-xs bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-700 dark:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white font-semibold text-base py-3.5 rounded-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <span>{t("btnLogin")}</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>

          <p className="mt-8 text-xs text-slate-400 dark:text-gray-600">
            {t("footer")}
          </p>
        </div>

        {/* Columna DERECHA: Panel decorativo */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-emerald-600 to-blue-700 items-center justify-center p-12 relative overflow-hidden">
          {/* Decoración de fondo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 text-center max-w-md">
            <div className="mb-8 flex justify-center">
              <div className="w-48 h-48 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl">
                <svg
                  className="w-24 h-24 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-4">
              Cuenta Verificada
            </h2>
            <p className="text-blue-100 text-lg leading-relaxed mb-8">
              Tu identidad ha sido confirmada. Estás listo para acceder al
              sistema de cotizaciones SIG.
            </p>

            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-1">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">Email verificado</p>
                  <p className="text-blue-100 text-sm">
                    Tu dirección de correo ha sido confirmada
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-1">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">Cuenta activa</p>
                  <p className="text-blue-100 text-sm">
                    Tu perfil está listo para usar
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-1">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">Acceso seguro</p>
                  <p className="text-blue-100 text-sm">
                    Protegido con autenticación Supabase
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animación CSS del checkmark */}
      <style jsx>{`
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
