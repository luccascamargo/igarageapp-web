import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Prisma } from "@prisma/client";

interface iCardAd {
  className?: string;
  data: Prisma.AdvertsGetPayload<{
    include: { model: true; brand: true; images: true; user: true };
  }>;
}

export function CardAdvert({ className, data }: iCardAd) {
  return (
    <Link
      href={`/anuncio/${data.slug}`}
      className={cn(
        className,
        "rounded-md border pb-5 h-fit min-w-60 transition-all hover:shadow-md"
      )}
    >
      <div className="w-full h-[125px] relative">
        {data.emphasis && (
          <Badge className="absolute z-10 top-2 right-2">Destaque</Badge>
        )}
        <Image
          src={data.images[0].url || "/default-car.png"}
          fill
          quality={100}
          alt={data.model.name}
          className="object-cover rounded-t"
        />
      </div>
      <div className="mt-3 px-3 w-full flex flex-col gap-5">
        <span className="text-muted-foreground text-lg font-bold">
          {Number(data.price).toLocaleString("pt-BR", {
            currency: "BRL",
            style: "currency",
          })}
        </span>
        <div className="flex flex-col min-h-20">
          <span className="text-muted-foreground text-lg font-bold">
            {data.brand.name}
          </span>
          <span className="text-muted-foreground font-normal text-xs uppercase">
            {data.model.name}
          </span>
        </div>
        <div className="w-full flex items-center justify-between">
          <span className="text-muted-foreground font-semibold text-xs">
            {data.year_model}
          </span>
          <span className="text-muted-foreground font-semibold text-xs">
            {Number(data.mileage).toLocaleString("pt-BR")} km
          </span>
          <span className="text-muted-foreground font-semibold text-xs">
            {data.color}
          </span>
        </div>
        <div className="border w-full" />
        <span className="text-muted-foreground font-semibold text-xs w-full text-center">
          {data.city} - {data.state}
        </span>
      </div>
    </Link>
  );
}
