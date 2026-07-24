import { Wrench } from "lucide-react";
import Link from "next/link";

export default function MaintenancePage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4">
      <div className="text-center max-w-md space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Wrench className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Технические работы
        </h1>
        <p className="text-muted-foreground text-lg">
          Платформа временно недоступна. Мы проводим техническое обслуживание.
        </p>
        <p className="text-sm text-muted-foreground">
          Пожалуйста, зайдите позже. Приносим извинения за неудобства.
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}
