"use client";

import React, { useRef } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Search,
  ClipboardCheck,
  Users,
  ShieldCheck,
  BarChart3,
  Sparkles,
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
  tone = "blue",
}: {
  icon: any;
  title: string;
  desc: string;
  tone?: "blue" | "indigo" | "emerald" | "slate";
}) {
  const tones: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
    slate: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-700",
  };

  return (
    <div className="feature-card group rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-start gap-4">
        <div
          className={`h-12 w-12 rounded-2xl border flex items-center justify-center ${tones[tone]}`}
        >
          <Icon size={20} />
        </div>
        <div>
          <h3 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-gray-400">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function Step({
  n,
  title,
  desc,
}: {
  n: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="step-card rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-extrabold">
          {n}
        </div>
        <div>
          <div className="font-extrabold text-slate-900 dark:text-white">{title}</div>
          <div className="mt-1 text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
            {desc}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const t = useTranslations("Landing");
  const tCommon = useTranslations("Common");
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Hero Text animation
    gsap.fromTo(".hero-text", 
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out", delay: 0.1 }
    );

    // Hero Mockup animation
    gsap.fromTo(".hero-mockup", 
      { x: 40, opacity: 0 },
      { x: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.3 }
    );

    // Features Section
    gsap.fromTo(".feature-card", 
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1, 
        duration: 0.6, stagger: 0.1, ease: "power2.out",
        scrollTrigger: {
          trigger: ".features-section",
          start: "top 80%",
        }
      }
    );

    // How It Works Section
    gsap.fromTo(".step-card", 
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1, 
        duration: 0.6, stagger: 0.15, ease: "power2.out",
        scrollTrigger: {
          trigger: ".steps-section",
          start: "top 80%",
        }
      }
    );

    // CTA Section
    gsap.fromTo(".cta-content", 
      { scale: 0.95, opacity: 0, y: 20 },
      {
        scale: 1, opacity: 1, y: 0, 
        duration: 0.8, ease: "back.out(1.5)",
        scrollTrigger: {
          trigger: ".cta-section",
          start: "top 80%",
        }
      }
    );
  }, { scope: container });

  return (
    <div ref={container} className="min-h-screen bg-white dark:bg-zinc-950 text-slate-900 dark:text-gray-100 selection:bg-blue-100 dark:selection:bg-blue-900 overflow-hidden">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 border-b border-slate-100 dark:border-zinc-800 bg-white/75 dark:bg-zinc-950/75 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold shadow-sm">
              S
            </div>
            <div className="leading-tight">
              <div className="font-extrabold tracking-tight text-slate-900 dark:text-white">
                {tCommon("appName")}
              </div>
              <div className="text-xs text-slate-500 dark:text-gray-400">
                {tCommon("appTagline")}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex rounded-xl px-4 py-2 text-sm font-bold text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
            >
              {t("hero.ctaLogin")}
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-blue-700 transition shadow-sm"
            >
              {t("hero.ctaRegister")} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="relative pt-32 pb-16 lg:pt-44 lg:pb-24">
        {/* background glow */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[1100px] rounded-full bg-blue-50 dark:bg-blue-900/20 blur-3xl opacity-70 -z-10" />
        <div className="absolute -bottom-40 right-0 h-[520px] w-[520px] rounded-full bg-indigo-50 dark:bg-indigo-900/20 blur-3xl opacity-70 -z-10" />

        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Copy */}
            <div>
              <div className="hero-text inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1 text-xs font-extrabold text-slate-600 dark:text-gray-300 shadow-[0px_0px_20px_0px_rgba(59,130,246,0.15)] opacity-0">
                <Sparkles size={14} className="text-blue-600 dark:text-blue-400" />
                {t("hero.badge")}
              </div>

              <h1 className="hero-text mt-6 text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white opacity-0">
                {t("hero.titleStart")}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                  {t("hero.titleHighlight")}
                </span>{" "}
                {t("hero.titleEnd")}
              </h1>

              <p className="hero-text mt-5 text-lg text-slate-600 dark:text-gray-400 leading-relaxed max-w-xl opacity-0">
                {t("hero.description")}
              </p>

              <div className="hero-text mt-8 flex flex-col sm:flex-row gap-3 opacity-0">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 dark:bg-white px-6 py-3 font-extrabold text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-gray-100 transition shadow-sm"
                >
                  {t("hero.ctaLogin")} <ArrowRight size={18} />
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white dark:bg-zinc-900 px-6 py-3 font-extrabold text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
                >
                  {t("hero.ctaRegister")}
                </Link>
              </div>

              <div className="hero-text mt-6 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-gray-400 opacity-0">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1">
                  <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                  {t("hero.badge1")}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1">
                  <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                  {t("hero.badge2")}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1">
                  <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                  {t("hero.badge3")}
                </span>
              </div>
            </div>

            {/* Visual mock */}
            <div className="hero-mockup rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden opacity-0">
              <div className="border-b border-slate-100 dark:border-zinc-800 p-5 flex items-center justify-between">
                <div className="font-extrabold text-slate-900 dark:text-white">{t("mockup.title")}</div>
                <div className="text-xs font-bold text-slate-500 dark:text-gray-500">
                  {t("mockup.subtitle")}
                </div>
              </div>
              <div className="p-6 grid gap-4">
                <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-extrabold dark:text-white">{t("mockup.quotation")}</div>
                    <span className="text-xs font-extrabold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 px-2 py-1 rounded-full">
                      {t("mockup.inReview")}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-slate-600 dark:text-gray-400">
                    {t("mockup.mockDetail")}
                  </div>
                  <div className="mt-3 h-2 w-full rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 overflow-hidden">
                    <div className="h-full w-[62%] bg-slate-900 dark:bg-zinc-700" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 p-4">
                    <div className="text-xs font-bold text-slate-500 dark:text-gray-500">
                      {t("mockup.searchTitle")}
                    </div>
                    <div className="mt-2 text-2xl font-extrabold dark:text-white">
                      {t("mockup.searchValue")}
                    </div>
                    <div className="mt-2 text-sm text-slate-600 dark:text-gray-400">
                      {t("mockup.searchDesc")}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 p-4">
                    <div className="text-xs font-bold text-slate-500 dark:text-gray-500">
                      {t("mockup.docsTitle")}
                    </div>
                    <div className="mt-2 text-2xl font-extrabold dark:text-white">
                      {t("mockup.docsValue")}
                    </div>
                    <div className="mt-2 text-sm text-slate-600 dark:text-gray-400">
                      {t("mockup.docsDesc")}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-900 dark:bg-zinc-800 text-white p-4">
                  <div className="font-extrabold">{t("mockup.auditTitle")}</div>
                  <div className="text-sm text-white/80 mt-1">
                    {t("mockup.auditDesc")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* FEATURES */}
      <section className="features-section py-16 bg-slate-50 dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight dark:text-white">
              {t("features.title")}
            </h2>
            <p className="mt-3 text-slate-600 dark:text-gray-400 leading-relaxed">
              {t("features.subtitle")}
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={FileText}
              title={t("features.centralizedTitle")}
              desc={t("features.centralizedDesc")}
              tone="blue"
            />
            <FeatureCard
              icon={Search}
              title={t("features.searchTitle")}
              desc={t("features.searchDesc")}
              tone="slate"
            />
            <FeatureCard
              icon={ClipboardCheck}
              title={t("features.trackingTitle")}
              desc={t("features.trackingDesc")}
              tone="indigo"
            />
            <FeatureCard
              icon={Users}
              title={t("features.clientsTitle")}
              desc={t("features.clientsDesc")}
              tone="emerald"
            />
            <FeatureCard
              icon={BarChart3}
              title={t("features.visibilityTitle")}
              desc={t("features.visibilityDesc")}
              tone="slate"
            />
            <FeatureCard
              icon={ShieldCheck}
              title={t("features.controlTitle")}
              desc={t("features.controlDesc")}
              tone="blue"
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="steps-section py-16 bg-white dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight dark:text-white">
              {t("howItWorks.title")}
            </h2>
            <p className="mt-3 text-slate-600 dark:text-gray-400 leading-relaxed">
              {t("howItWorks.subtitle")}
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Step
              n="1"
              title={t("howItWorks.step1Title")}
              desc={t("howItWorks.step1Desc")}
            />
            <Step
              n="2"
              title={t("howItWorks.step2Title")}
              desc={t("howItWorks.step2Desc")}
            />
            <Step
              n="3"
              title={t("howItWorks.step3Title")}
              desc={t("howItWorks.step3Desc")}
            />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="cta-section py-20 bg-slate-900 dark:bg-black text-white relative">
        <div className="absolute -top-24 left-0 h-[420px] w-[420px] rounded-full bg-blue-600 blur-[120px] opacity-20" />
        <div className="cta-content mx-auto max-w-7xl px-6 text-center relative opacity-0">
          <h2 className="text-4xl font-extrabold tracking-tight">
            {t("cta.title")}
          </h2>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t("cta.description")}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-3 font-extrabold text-slate-900 hover:bg-slate-100 transition"
            >
              {t("cta.login")} <ArrowRight size={18} />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-7 py-3 font-extrabold text-white hover:bg-white/15 transition"
            >
              {t("cta.register")}
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-sm text-slate-600 dark:text-gray-400">
            {tCommon("copyright", { year: new Date().getFullYear() })}
          </div>
          <div className="text-sm text-slate-500 dark:text-gray-500">{tCommon("internalPlatform")}</div>
        </div>
      </footer>
    </div>
  );
}
