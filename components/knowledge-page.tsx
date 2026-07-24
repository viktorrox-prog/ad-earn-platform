"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BookOpen,
  CheckCircle,
  HelpCircle,
  Mail,
  MessageSquare,
  Shield,
  TrendingUp,
} from "lucide-react";

const steps = [
  {
    title: "Зарегистрируйтесь на платформе",
    description:
      "Создайте аккаунт, указав email или номер телефона. Подтвердите регистрацию через код из письма или SMS.",
  },
  {
    title: "Пополните баланс (необязательно)",
    description:
      "Для просмотра рекламы пополнение не требуется. Баланс нужен только рекламодателям для запуска кампаний.",
  },
  {
    title: "Перейдите в раздел «Просмотр рекламы»",
    description:
      "В личном кабинете выберите раздел «Реклама». Вам будут доступны видео-ролики и баннеры с указанием вознаграждения.",
  },
  {
    title: "Смотрите рекламу и получайте начисления",
    description:
      "Нажмите на объявление, дождитесь завершения просмотра. Вознаграждение автоматически зачисляется на баланс.",
  },
  {
    title: "Выполняйте задания в соцсетях",
    description:
      "В разделе «Задания» доступны задачи: просмотр видео на YouTube/VK, лайки, подписки. Подтвердите выполнение — и получите выплату.",
  },
  {
    title: "Выводите заработанные средства",
    description:
      "В разделе «Финансы» создайте заявку на вывод. Минимальная сумма — 100 ₽. Средства поступают на карту или кошелёк.",
  },
];

const rules = [
  {
    title: "Одно пользователь — один аккаунт",
    description:
      "Запрещено создавать несколько аккаунтов одному лицу. Мультиаккаунтинг ведёт к блокировке всех профилей без выплаты средств.",
  },
  {
    title: "Запрет на скрутку и накрутку",
    description:
      "Запрещены любые попытки искусственного увеличения просмотров, лайков или подписок через ботов, эмуляторы или автоматизированные скрипты.",
  },
  {
    title: "Честное выполнение заданий",
    description:
      "При выполнении заданий в соцсетях необходимо реально просматривать видео, ставить лайки и подписываться. Формальные подтверждения без реальных действий ведут к блокировке.",
  },
  {
    title: "Соблюдение лимитов",
    description:
      "На платформе установлены дневные лимиты на просмотр рекламы (20 объявлений в день) и выполнение заданий. Попытки обойти лимиты наказываются блокировкой.",
  },
  {
    title: "Правила для рекламодателей",
    description:
      "Рекламодатели обязаны соблюдать законодательство РФ о рекламе. Запрещено размещение запрещённых товаров и услуг, а также использование чужих товарных знаков без разрешения.",
  },
  {
    title: "Вывод средств",
    description:
      "Вывод средств возможен только после верификации аккаунта. Минимальная сумма вывода — 100 ₽. Срок обработки заявки — до 3 рабочих дней.",
  },
  {
    title: "Конфиденциальность",
    description:
      "AdEarn не передаёт персональные данные пользователей третьим лицам. Все транзакции и действия на платформе защищены шифрованием.",
  },
];

const faqItems = [
  {
    value: "faq-1",
    question: "Сколько можно заработать на AdEarn?",
    answer:
      "Средний заработок активных пользователей составляет около 500 ₽ в день. Всё зависит от количества просмотренной рекламы и выполненных заданий. С партнёрской программой доход может быть значительно выше.",
  },
  {
    value: "faq-2",
    question: "Как часто появляются новые задания?",
    answer:
      "Рекламодатели добавляют новые кампании ежедневно. Рекомендуем проверять разделы «Реклама» и «Задания» несколько раз в день, чтобы не пропустить высокооплачиваемые предложения.",
  },
  {
    value: "faq-3",
    question: "Как вывести заработанные средства?",
    answer:
      "Перейдите в раздел «Финансы» → «Вывод средств». Укажите сумму (от 100 ₽) и реквизиты. Заявка обрабатывается до 3 рабочих дней. Доступные способы: банковские карты РФ, ЮMoney.",
  },
  {
    value: "faq-4",
    question: "Что делать, если реклама не воспроизводится?",
    answer:
      "Проверьте подключение к интернету, отключите VPN/блокировщики рекламы, обновите страницу. Если проблема сохраняется — обратитесь в службу поддержки.",
  },
  {
    value: "faq-5",
    question: "Могу ли я использовать несколько аккаунтов?",
    answer:
      "Нет. Создание нескольких аккаунтов одним пользователем запрещено правилами платформы. Это приводит к блокировке всех аккаунтов без выплаты средств.",
  },
  {
    value: "faq-6",
    question: "Как работает партнёрская программа?",
    answer:
      "Вы получаете уникальную реферальную ссылку в личном кабинете. Когда по вашей ссылке регистрируется рекламодатель, вы получаете 12% от его расходов на рекламу. Средства начисляются на ваш баланс автоматически.",
  },
  {
    value: "faq-7",
    question: "Безопасно ли указывать платёжные данные?",
    answer:
      "Да. Все платёжные данные передаются по защищённому протоколу. AdEarn не хранит полные данные банковских карт — обработка платежей осуществляется через сертифицированных платёжных партнёров.",
  },
];

const contacts = [
  {
    icon: Mail,
    label: "viktor.rox@yandex.ru",
    href: "mailto:viktor.rox@yandex.ru",
    description: "Напишите нам на почту — отвечаем в течение 2 часов",
  },
];

export function KnowledgePage() {
  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
      {/* Hero */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-6">
          <BookOpen className="size-4" />
          База знаний
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Всё, что нужно знать о{" "}
          <span className="bg-gradient-to-r from-primary via-primary/80 to-purple-400 bg-clip-text text-transparent">
            AdEarn
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Подробные руководства, правила платформы, ответы на частые вопросы и
          контакты службы поддержки.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-20">
        {/* Section 1: How to start earning */}
        <section id="how-to-start" className="scroll-mt-20">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10">
              <TrendingUp className="size-5 text-emerald-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Как начать зарабатывать
            </h2>
          </div>
          <p className="text-muted-foreground mb-8 ml-[52px]">
            Пошаговая инструкция для новых пользователей
          </p>

          <div className="relative">
            <div className="absolute left-[23px] top-2 bottom-2 w-px bg-gradient-to-b from-emerald-500/40 to-primary/40 hidden sm:block" />
            <div className="space-y-8">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="relative flex items-start gap-5 sm:gap-6"
                >
                  <div className="relative z-10 flex size-[46px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20">
                    <span className="text-sm font-bold text-emerald-400">
                      {index + 1}
                    </span>
                  </div>
                  <div className="min-w-0 pt-2">
                    <h3 className="font-semibold text-base mb-1.5">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2: Platform rules */}
        <section id="rules" className="scroll-mt-20">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10">
              <Shield className="size-5 text-amber-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Правила платформы
            </h2>
          </div>
          <p className="text-muted-foreground mb-8 ml-[52px]">
            Условия использования сервиса AdEarn
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {rules.map((rule, index) => (
              <div
                key={index}
                className="group rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm p-5 card-hover"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle className="size-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{rule.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {rule.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: FAQ */}
        <section id="faq" className="scroll-mt-20">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/20 to-sky-600/10">
              <HelpCircle className="size-5 text-sky-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Часто задаваемые вопросы
            </h2>
          </div>
          <p className="text-muted-foreground mb-8 ml-[52px]">
            Ответы на самые популярные вопросы пользователей
          </p>

          <div className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm p-1">
            <Accordion>
              {faqItems.map((item) => (
                <AccordionItem key={item.value} value={item.value}>
                  <AccordionTrigger className="px-4 py-3.5 text-base hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {item.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Section 4: Contacts */}
        <section id="contacts" className="scroll-mt-20">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
              <MessageSquare className="size-5 text-primary" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Контакты
            </h2>
          </div>
          <p className="text-muted-foreground mb-8 ml-[52px]">
            Информация о службе поддержки
          </p>

          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 max-w-sm mx-auto">
            {contacts.map((contact) => {
              const Icon = contact.icon;
              return (
                <a
                  key={contact.label}
                  href={contact.href}
                  className="group rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm p-6 text-center card-hover block"
                >
                  <div className="flex justify-center mb-4">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
                      <Icon className="size-6 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm mb-1.5">
                    {contact.label}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {contact.description}
                  </p>
                </a>
              );
            })}
          </div>

          <div className="mt-8 rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Время ответа службы поддержки — в среднем 5 минут. Мы работаем
              24/7 без выходных.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
