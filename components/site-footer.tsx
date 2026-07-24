import Link from "next/link";
import {
  TrendingUp,
  HeadphonesIcon,
  BookOpen,
  Mail,
  MessageSquare,
  ArrowUpRight,
  Scale,
  FileText,
} from "lucide-react";
import { PromoBanner } from "./promo-banner";

const appName = "AdEarn";

const supportLinks = [
  { label: "Центр помощи", href: "/knowledge#how-to-start" },
  { label: "Часто задаваемые вопросы", href: "/knowledge#faq" },
  { label: "Статус платформы", href: "#" },
];

const knowledgeLinks = [
  { label: "Как начать зарабатывать", href: "/knowledge#how-to-start" },
  { label: "Правила платформы", href: "/knowledge#rules" },
  { label: "Безопасность аккаунта", href: "/knowledge#rules" },
  { label: "Условия вывода средств", href: "/knowledge#faq" },
];

const contactLinks = [
  {
    label: "viktor.rox@yandex.ru",
    href: "mailto:viktor.rox@yandex.ru",
    icon: Mail,
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <HeadphonesIcon className="h-4 w-4 text-primary" />
              </div>
              <span>Служба поддержки</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Мы здесь, чтобы помочь. Наша команда поддержки отвечает в среднем
              за 5 минут.
            </p>
            <ul className="space-y-2.5">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <span>База знаний</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Подробные руководства и инструкции по всем возможностям платформы.
            </p>
            <ul className="space-y-2.5">
              {knowledgeLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Scale className="h-4 w-4 text-primary" />
              </div>
              <span>Юридическая информация</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Правовые документы и условия использования платформы.
            </p>
            <ul className="space-y-2.5">
              {[
                { label: "Публичная оферта", href: "/offer" },
                { label: "Политика конфиденциальности", href: "/privacy" },
                { label: "Прайс-лист", href: "/prices" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 pt-1">
              <FileText className="h-3.5 w-3.5 text-primary/60" />
              <span className="text-xs text-muted-foreground/60">
                Редакция от 01.07.2026
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              <span>Связаться с нами</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Напишите нам на почту — отвечаем в течение 2 часов.
            </p>
            <ul className="space-y-3">
              {contactLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border/40">
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
                <TrendingUp className="h-3 w-3" />
                Партнёрская программа
              </span>
            </div>
            <PromoBanner />
          </div>
        </div>
      </div>

      <div className="border-t border-border/40">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
              Мы принимаем
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex h-10 items-center gap-2 rounded-lg border border-border/40 bg-card/50 px-4 text-sm font-semibold text-foreground/80 shadow-xs">
                <span className="text-[10px] font-bold tracking-tight text-[#6B3FA0]">
                  Робокасса
                </span>
              </div>
              <div className="flex h-10 items-center gap-2 rounded-lg border border-border/40 bg-card/50 px-4 text-sm font-semibold text-foreground/80 shadow-xs">
                <span className="text-[10px] font-bold tracking-tight text-[#088A2B]">
                  ЮMoney
                </span>
              </div>
              <div className="flex h-10 items-center gap-2 rounded-lg border border-border/40 bg-card/50 px-4 text-sm font-semibold text-foreground/80 shadow-xs">
                <span className="text-[10px] font-bold tracking-tight text-[#1A1F71]">
                  Visa
                </span>
                <span className="text-xs text-muted-foreground">/</span>
                <span className="text-[10px] font-bold tracking-tight text-[#F79E1B]">
                  Mastercard
                </span>
              </div>
              <div className="flex h-10 items-center gap-2 rounded-lg border border-border/40 bg-card/50 px-4 text-sm font-semibold text-foreground/80 shadow-xs">
                <span className="text-[10px] font-bold tracking-tight text-[#1A5C38]">
                  Мир
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border/40">
        <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
            {appName}
          </Link>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {appName}. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}
