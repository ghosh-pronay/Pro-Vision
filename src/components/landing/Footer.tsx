import { Link } from "react-router";
import logo from "@/assets/logo.png";
import { useLang } from "@/i18n/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";

export function Footer() {
  const { lang } = useLang();

  return (
    <footer className="relative py-12 border-t border-border/30">
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <Link to="/" className="relative">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[var(--pv-blue)]/20 to-[var(--pv-teal)]/10 dark:from-white/10 dark:to-white/5" />
              <img
                src={logo}
                alt="Pro-Vision"
                width={28}
                height={28}
                className="relative rounded-lg"
              />
            </Link>
            <Link
              to="/"
              className="text-sm font-semibold text-foreground hover:opacity-80 transition-opacity"
            >
              Pro-Vision
            </Link>
            <span className="text-xs text-muted-foreground">
              · Plan · Focus · Achieve
            </span>
          </div>

          <div className="flex items-center gap-6">
            {[
              { key: "footer.privacy" as TranslationKey },
              { key: "footer.terms" as TranslationKey },
              { key: "footer.cookie" as TranslationKey },
              { key: "footer.contact" as TranslationKey },
            ].map(({ key }) => (
              <a
                key={key}
                href="#"
                className="text-xs text-muted-foreground hover:text-foreground hover-lift transition-colors"
              >
                {t(key, lang)}
              </a>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? (
              <>
                <a
                  href="https://pronayghosh.site/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-foreground hover:underline"
                >
                  Pronay
                </a>{" "}
                {t("footer.madeWith", lang)}
              </>
            ) : (
              <>
                {t("footer.madeWith", lang)}{" "}
                <a
                  href="https://pronayghosh.site/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-foreground hover:underline"
                >
                  Pronay
                </a>
              </>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
