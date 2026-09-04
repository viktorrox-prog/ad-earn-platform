import {
  Service,
  Transaction,
  User,
  Ad,
  Task,
  Advertiser,
  Campaign,
  WithdrawalRequest,
  Ticket,
  DashboardBanner,
  HomepageBanner,
  Broadcast,
  AdminSettings,
  PriceListItem,
  MaintenanceMode,
  TaskReview,
  Payment,
  ReferralClick,
} from "./models";

export const mockServices: Service[] = [
  {
    id: "mock-service-1",
    name: "API Gateway",
    description: "Шлюз для микросервисной архитектуры",
    status: "active",
    url: "https://api.example.com",
    createdAt: new Date("2024-01-15").toISOString(),
    updatedAt: new Date("2024-01-15").toISOString(),
  },
  {
    id: "mock-service-2",
    name: "Auth Service",
    description: "Сервис аутентификации и авторизации",
    status: "active",
    url: "https://auth.example.com",
    createdAt: new Date("2024-02-01").toISOString(),
    updatedAt: new Date("2024-02-01").toISOString(),
  },
  {
    id: "mock-service-3",
    name: "ML Pipeline",
    description: "Пайплайн для обработки данных с AI",
    status: "deploying",
    url: undefined,
    createdAt: new Date("2024-03-10").toISOString(),
    updatedAt: new Date("2024-03-10").toISOString(),
  },
];

export const mockUsers: User[] = [
  {
    id: "mock-user-1",
    email: "user@example.com",
    phone: "+71234567890",
    passwordHash:
      "dummyhash:dummydummydummydummydummydummydummydummydummydummydummydummydummydummydummy",
    verified: true,
    blocked: false,
    createdAt: new Date("2024-01-15").toISOString(),
    updatedAt: new Date("2024-01-15").toISOString(),
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: "mock-tx-1",
    userId: "mock-user-1",
    type: "earnings",
    amount: 1,
    description: "Просмотр рекламы — «Новый бренд кофе»",
    status: "completed",
    createdAt: new Date("2024-06-15T10:30:00Z").toISOString(),
  },
  {
    id: "mock-tx-2",
    userId: "mock-user-1",
    type: "earnings",
    amount: 1.2,
    description: "Просмотр рекламы — «Страховка онлайн»",
    status: "completed",
    createdAt: new Date("2024-06-15T09:15:00Z").toISOString(),
  },
  {
    id: "mock-tx-3",
    userId: "mock-user-1",
    type: "earnings",
    amount: 8.0,
    description: "Выполнение задания — YouTube: просмотр видео",
    status: "completed",
    createdAt: new Date("2024-06-14T18:45:00Z").toISOString(),
  },
  {
    id: "mock-tx-4",
    userId: "mock-user-1",
    type: "withdrawal",
    amount: -50.0,
    description: "Вывод на карту",
    status: "completed",
    createdAt: new Date("2024-06-13T14:20:00Z").toISOString(),
  },
  {
    id: "mock-tx-5",
    userId: "mock-user-1",
    type: "earnings",
    amount: 2.0,
    description: "Просмотр рекламы — «Мобильный банк»",
    status: "completed",
    createdAt: new Date("2024-06-13T11:00:00Z").toISOString(),
  },
  {
    id: "mock-tx-6",
    userId: "mock-user-1",
    type: "referral",
    amount: 10.0,
    description: "Реферальное вознаграждение за друга",
    status: "completed",
    createdAt: new Date("2024-06-12T08:00:00Z").toISOString(),
  },
  {
    id: "mock-tx-7",
    userId: "mock-user-1",
    type: "withdrawal",
    amount: -30.0,
    description: "Вывод на карту",
    status: "completed",
    createdAt: new Date("2024-06-10T16:30:00Z").toISOString(),
  },
  {
    id: "mock-tx-8",
    userId: "mock-user-1",
    type: "earnings",
    amount: 4.5,
    description: "Просмотр рекламы — «Фитнес-клуб»",
    status: "completed",
    createdAt: new Date("2024-06-10T10:00:00Z").toISOString(),
  },
  {
    id: "mock-tx-9",
    userId: "mock-user-1",
    type: "deposit",
    amount: 200.0,
    description: "Пополнение через Azvox",
    status: "completed",
    createdAt: new Date("2024-06-17T12:00:00Z").toISOString(),
  },
  {
    id: "mock-tx-10",
    userId: "mock-user-1",
    type: "deposit",
    amount: 500.0,
    description: "Пополнение через Azvox",
    status: "completed",
    createdAt: new Date("2024-06-11T09:00:00Z").toISOString(),
  },
];

export const mockReferralClicks: ReferralClick[] = [
  {
    id: "mock-click-1",
    referrerId: "mock-user-1",
    createdAt: new Date("2024-06-18T09:00:00Z").toISOString(),
    convertedAdvertiserId: "mock-advertiser-1",
    convertedAt: new Date("2024-06-18T10:00:00Z").toISOString(),
  },
  {
    id: "mock-click-2",
    referrerId: "mock-user-1",
    createdAt: new Date("2024-06-19T12:00:00Z").toISOString(),
  },
  {
    id: "mock-click-3",
    referrerId: "mock-user-1",
    createdAt: new Date("2024-06-20T15:30:00Z").toISOString(),
  },
];

export const mockAds: Ad[] = [];

export const mockTasks: Task[] = [];

export const mockAdvertisers: Advertiser[] = [
  {
    id: "mock-advertiser-1",
    companyName: "ООО Реклама Про",
    email: "advertiser@example.com",
    phone: "+71234567891",
    passwordHash:
      "dummyhash:dummydummydummydummydummydummydummydummydummydummydummydummydummydummydummy",
    balance: 15000,
    referredBy: "mock-user-1",
    createdAt: new Date("2024-05-01").toISOString(),
    updatedAt: new Date("2024-05-01").toISOString(),
  },
];

export const mockCampaigns: Campaign[] = [];

export const mockWithdrawalRequests: WithdrawalRequest[] = [
  {
    id: "mock-wd-1",
    userId: "mock-user-1",
    amount: 500,
    method: "card",
    recipient: "2200 **** **** 1234",
    status: "pending",
    createdAt: new Date("2024-06-16T10:00:00Z").toISOString(),
  },
  {
    id: "mock-wd-2",
    userId: "mock-user-1",
    amount: 1000,
    method: "card",
    recipient: "2200 **** **** 5678",
    status: "approved",
    createdAt: new Date("2024-06-14T15:30:00Z").toISOString(),
  },
];

export const mockTickets: Ticket[] = [
  {
    id: "mock-ticket-1",
    userId: "mock-user-1",
    subject: "Не начислились деньги за просмотр",
    message:
      "Посмотрел 3 рекламы, а баланс не изменился. Проверьте пожалуйста.",
    status: "open",
    createdAt: new Date("2024-06-16T10:30:00Z").toISOString(),
    updatedAt: new Date("2024-06-16T10:30:00Z").toISOString(),
  },
  {
    id: "mock-ticket-2",
    userId: "mock-user-1",
    subject: "Вопрос по выводу средств",
    message: "Как долго обрабатывается заявка на вывод?",
    status: "closed",
    adminResponse: "Обычно заявка обрабатывается в течение 24 часов.",
    createdAt: new Date("2024-06-15T14:00:00Z").toISOString(),
    updatedAt: new Date("2024-06-15T16:30:00Z").toISOString(),
  },
];

export const mockDashboardBanners: DashboardBanner[] = [
  {
    id: "mock-db-1",
    userId: "mock-user-1",
    imageUrl: "https://picsum.photos/800/200?random=1",
    targetUrl: "https://example.com/promo1",
    status: "active",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  },
  {
    id: "mock-db-2",
    userId: "mock-user-2",
    imageUrl: "https://picsum.photos/800/200?random=2",
    targetUrl: "https://example.com/promo2",
    status: "active",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  },
  {
    id: "mock-db-3",
    userId: "mock-user-3",
    imageUrl: "https://picsum.photos/800/200?random=3",
    targetUrl: "https://example.com/promo3",
    status: "active",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  },
];

export const mockBroadcasts: Broadcast[] = [
  {
    id: "mock-broadcast-1",
    title: "Важное объявление",
    message:
      "Уважаемые пользователи! На платформе обновлены условия начисления за просмотр рекламы. Теперь максимальный дневной лимит составляет 30 просмотров.",
    createdAt: new Date().toISOString(),
  },
];

export const mockAdminSettings: AdminSettings = {
  id: "global",
  minCostPerView: 1,
  minViews: 1000,
  updatedAt: new Date().toISOString(),
};

export const mockPriceList: PriceListItem[] = [
  {
    id: "youtube-views",
    name: "YouTube просмотры",
    description: "Просмотры видео на YouTube",
    price: 240,
    unit: "1000",
    category: "youtube",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "telegram-subscribers",
    name: "Telegram подписчики",
    description: "Подписчики Telegram канала",
    price: 16,
    unit: "шт",
    category: "telegram",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "instagram-likes",
    name: "Instagram лайки",
    description: "Лайки на публикации в Instagram",
    price: 400,
    unit: "1000",
    category: "instagram",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "vk-views",
    name: "VK просмотры",
    description: "Просмотры видео в VK",
    price: 200,
    unit: "1000",
    category: "vk",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tiktok-views",
    name: "TikTok просмотры",
    description: "Просмотры видео в TikTok",
    price: 300,
    unit: "1000",
    category: "tiktok",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "youtube-subscribers",
    name: "YouTube подписчики",
    description: "Подписчики YouTube канала",
    price: 800,
    unit: "1000",
    category: "youtube",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "telegram-views",
    name: "Telegram просмотры",
    description: "Просмотры записей в Telegram",
    price: 12,
    unit: "1000",
    category: "telegram",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "vk-subscribers",
    name: "VK подписчики",
    description: "Подписчики сообщества VK",
    price: 500,
    unit: "1000",
    category: "vk",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "instagram-subscribers",
    name: "Instagram подписчики",
    description: "Подписчики Instagram аккаунта",
    price: 1000,
    unit: "1000",
    category: "instagram",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "youtube-likes",
    name: "YouTube лайки",
    description: "Лайки на видео YouTube",
    price: 600,
    unit: "1000",
    category: "youtube",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "vk-likes",
    name: "VK лайки",
    description: "Лайки на записи VK",
    price: 300,
    unit: "1000",
    category: "vk",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tiktok-subscribers",
    name: "TikTok подписчики",
    description: "Подписчики TikTok аккаунта",
    price: 1200,
    unit: "1000",
    category: "tiktok",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tiktok-likes",
    name: "TikTok лайки",
    description: "Лайки на видео TikTok",
    price: 500,
    unit: "1000",
    category: "tiktok",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "youtube-comments",
    name: "YouTube комментарии",
    description: "Комментарии под видео YouTube",
    price: 1000,
    unit: "1000",
    category: "youtube",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "vk-reposts",
    name: "VK репосты",
    description: "Репосты записей VK",
    price: 800,
    unit: "1000",
    category: "vk",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "yandex-music-subscribers",
    name: "Яндекс Музыка подписчики",
    description:
      "250 подписчиков за 2000 ₽ (8 ₽/подписчик), задание с проверкой рекламодателем, не отписываться 1 месяц",
    price: 8,
    unit: "шт",
    category: "yandex",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cpc-clicks",
    name: "CPC переходы",
    description: "Переходы по рекламным ссылкам",
    price: 100,
    unit: "1000",
    category: "cpc",
    updatedAt: new Date().toISOString(),
  },
];

export const mockMaintenanceMode: MaintenanceMode = {
  id: "global",
  enabled: false,
  message:
    "Платформа на техническом обслуживании. Приносим извинения за неудобства.",
  updatedAt: new Date().toISOString(),
};

export const mockTaskReviews: TaskReview[] = [];

export const mockHomepageBanners: HomepageBanner[] = [
  {
    id: "mock-hp-banner-1",
    userId: "mock-user-1",
    imageUrl: "https://picsum.photos/1200/200?random=10",
    targetUrl: "https://example.com/promo1",
    status: "active",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  },
  {
    id: "mock-hp-banner-2",
    userId: "mock-user-2",
    imageUrl: "https://picsum.photos/1200/200?random=11",
    targetUrl: "https://example.com/promo2",
    status: "active",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  },
  {
    id: "mock-hp-banner-3",
    userId: "mock-user-3",
    imageUrl: "https://picsum.photos/1200/200?random=12",
    targetUrl: "https://example.com/promo3",
    status: "active",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  },
];

export const mockPayments: Payment[] = [
  {
    id: "mock-payment-1",
    userId: "mock-user-1",
    amount: 200,
    method: "azvox",
    status: "success",
    description: "Пополнение через Azvox",
    createdAt: new Date("2024-06-17T12:00:00Z").toISOString(),
    updatedAt: new Date("2024-06-17T12:00:00Z").toISOString(),
  },
  {
    id: "mock-payment-2",
    userId: "mock-user-1",
    amount: 500,
    method: "azvox",
    status: "success",
    description: "Пополнение через Azvox",
    createdAt: new Date("2024-06-11T09:00:00Z").toISOString(),
    updatedAt: new Date("2024-06-11T09:00:00Z").toISOString(),
  },
  {
    id: "mock-payment-3",
    advertiserId: "mock-advertiser-1",
    amount: 3000,
    method: "azvox",
    status: "success",
    description: "Пополнение бюджета рекламодателя",
    createdAt: new Date("2024-06-10T14:00:00Z").toISOString(),
    updatedAt: new Date("2024-06-10T14:00:00Z").toISOString(),
  },
];
