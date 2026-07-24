import Link from "next/link";
import {
  TrendingUp,
  Play,
  Users,
  WalletCards,
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart3,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent } from "@/components/ui/card";
import { HomepageBanners } from "@/components/homepage-banners";
const benefits = [
  {
    icon: Play,
    title: "Просмотр рекламы",
    description:
      "Смотри короткие рекламные ролики и получай деньги на баланс. Ежедневно — новые объявления с разным вознаграждением.",
  },
  {
    icon: Users,
    title: "Задания в соцсетях",
    description:
      "Подписывайся, ставь лайки, выполняй задания в соцсетях. Выполнил задание — подтверди и получи оплату.",
  },
  {
    icon: WalletCards,
    title: "Мгновенный вывод",
    description:
      "Забирай заработанное на карту или электронный кошелёк. Минимальная сумма вывода — всего 100 ₽.",
  },
];

const stats = [
  { icon: Users, value: "10 000+", label: "Пользователей" },
  { icon: BarChart3, value: "5 млн+", label: "Просмотров" },
  { icon: Zap, value: "Реальный", label: "заработок" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <section className="relative min-h-[calc(100vh-3.5rem)] flex items-center overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 25% 35%, oklch(0.55 0.18 264 / 0.15) 0%, transparent 55%),
              radial-gradient(ellipse at 75% 60%, oklch(0.4 0.2 290 / 0.1) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 20%, oklch(0.5 0.18 264 / 0.08) 0%, transparent 45%),
              radial-gradient(ellipse at 65% 80%, oklch(0.4 0.15 320 / 0.06) 0%, transparent 50%),
              oklch(0.12 0.02 270)
            `,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-background" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, oklch(0.6 0.18 264 / 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, oklch(0.5 0.2 290 / 0.1) 0%, transparent 50%)",
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8 py-20">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary animate-in fade-in slide-in-from-bottom-4 duration-500">
              <TrendingUp className="h-4 w-4" />
              Платформа для заработка онлайн
            </div>
            <div data-banner-slot="top">
              <HomepageBanners position="top" />
            </div>
            <div className="flex items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-28 sm:w-36 shrink-0" data-banner-slot="left">
                <HomepageBanners position="left" />
              </div>
              <div className="text-7xl sm:text-8xl lg:text-9xl font-extrabold tracking-tighter">
                <span className="text-white text-glow animate-text-glow-pulse">
                  AdEarn
                </span>
              </div>
              <div className="w-28 sm:w-36 shrink-0" data-banner-slot="right">
                <HomepageBanners position="right" />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl animate-in fade-in slide-in-from-bottom-4 duration-700">
              Зарабатывай на рекламе
              <br />
              <span className="bg-gradient-to-r from-primary via-primary/80 to-purple-400 bg-clip-text text-transparent">
                и заданиях в соцсетях
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              Смотри рекламные ролики, выполняй задания в соцсетях — получай
              деньги на баланс. Выводи в любой момент без комиссии.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <Link
                href="/auth"
                className={
                  buttonVariants({ size: "lg" }) + " gap-2 text-base h-12 px-8"
                }
              >
                Начать зарабатывать
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="#benefits"
                className={
                  buttonVariants({ variant: "outline", size: "lg" }) +
                  " text-base h-12 px-8"
                }
              >
                Узнать больше
              </Link>
            </div>
            <div className="flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
              <div className="inline-flex items-center gap-2 rounded-lg border border-primary/10 bg-primary/[0.03] px-4 py-2 text-xs text-muted-foreground/70">
                <ShieldCheck className="h-3.5 w-3.5 text-primary/50" />
                <span>
                  Все рекламные баннеры проходят модерацию перед публикацией
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="benefits" className="border-t border-border/40 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-14">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Почему выбирают AdEarn
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Простая и понятная платформа для ежедневного заработка без
              вложений
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {benefits.map((benefit, i) => (
              <Card
                key={benefit.title}
                className="bg-card/50 backdrop-blur-sm border-border/50 card-hover animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <CardContent className="flex flex-col items-center text-center gap-4 pt-8 px-6 pb-8">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                    <benefit.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/40 py-16 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 sm:grid-cols-3 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-3 text-center"
              >
                <stat.icon className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold tracking-tight">
                  {stat.value}
                </span>
                <span className="text-sm text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/40 py-24 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(ellipse at center, oklch(0.6 0.18 264 / 0.2) 0%, transparent 70%)",
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary">
              <ShieldCheck className="h-4 w-4" />
              Начни прямо сейчас
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Готовы начать зарабатывать?
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Присоединяйся к тысячам пользователей, которые уже зарабатывают на
              AdEarn. Регистрация занимает меньше минуты.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth"
                className={
                  buttonVariants({ size: "lg" }) + " gap-2 text-base h-12 px-8"
                }
              >
                Зарегистрироваться
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/auth"
                className={
                  buttonVariants({ variant: "outline", size: "lg" }) +
                  " text-base h-12 px-8"
                }
              >
                Войти
              </Link>
            </div>
            <div data-banner-slot="bottom">
              <HomepageBanners position="bottom" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
