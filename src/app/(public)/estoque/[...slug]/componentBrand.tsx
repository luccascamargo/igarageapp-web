/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { CardAdvert } from "@/components/cardAdvert";
import { apiClient, GetCities, GetStates, normalizeText } from "@/lib/utils";
import { CustomInputValue } from "@/components/customInputValue";
import { X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export interface iTypes {
  value: number;
  name: string;
}

const formSchemaFilter = z.object({
  modelo: z.string(),
  busca: z.string(),
  cidade: z.string(),
  estado: z.string(),
  ano_modelo_min: z.coerce
    .string()

    .transform((value) => value?.toString()),
  ano_modelo_max: z.coerce
    .string()

    .transform((value) => value?.toString()),
  quilometragem_min: z.string().transform((value) => value.replace(/\D/g, "")),
  quilometragem_max: z.string().transform((value) => value.replace(/\D/g, "")),
  portas: z.string(),
  preco_min: z.string().transform((value) => value.replace(/\D/g, "")),
  preco_max: z.string().transform((value) => value.replace(/\D/g, "")),
  opcionais: z.array(z.string().optional()).optional(),
});

interface iOptional {
  id: string;
  name: string;
}

interface iModel {
  id: number;
  name: string;
}

type IFilterBrand = {
  slug: string[];
  models: iModel[];
};

const sortingOptions = [
  { key: "preco-asc", label: "Preço Mínimo" },
  { key: "preco-desc", label: "Preço Máximo" },
  { key: "data-asc", label: "Mais Recentes" },
  { key: "data-desc", label: "Mais Antigos" },
];

export function ComponentBrand({ slug, models }: IFilterBrand) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const defaultValues = {
    portas: searchParams.get("portas") || "",
    marca: searchParams.get("marca") || "",
    cidade: searchParams.get("cidade") || "",
    estado: searchParams.get("estado") || "",
    busca: searchParams.get("busca") || "",
    modelo: searchParams.get("modelo") || "",
    opcionais: searchParams.getAll("opcionais") || [],
    ano_modelo_max: searchParams.get("ano_modelo_max") || "",
    ano_modelo_min: searchParams.get("ano_modelo_min") || "",
    quilometragem_max: searchParams.get("quilometragem_max") || "",
    quilometragem_min: searchParams.get("quilometragem_min") || "",
    preco_max: searchParams.get("preco_max") || "",
    preco_min: searchParams.get("preco_min") || "",
  };

  const sort = searchParams.get("sort");

  const form = useForm<z.infer<typeof formSchemaFilter>>({
    resolver: zodResolver(formSchemaFilter),
    defaultValues,
  });

  async function fetchAdverts({ pageParam = 1 }: { pageParam: number }) {
    const limit = 25;
    const params = new URLSearchParams(searchParams);
    params.set("limit", limit.toString());
    params.set("pageParam", pageParam.toString());

    const { data } = await apiClient.get(
      `/adverts/filterbybrand/${slug[1]}?${params}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return data;
  }

  function onSubmit(values: z.infer<typeof formSchemaFilter>) {
    const params = new URLSearchParams();

    Object.entries(values).forEach(([key, value]) => {
      if (key === "opcionais" && Array.isArray(value)) {
        value = value.filter((item) => item !== "");
        if (value.length === 0) return;
        value.forEach((item) => params.append("opcionais", item as string));
      } else if (value && value !== "" && value !== "default") {
        params.set(key, normalizeText(value.toString()));
      }
    });

    router.push(`/stock/${slug[0]}/${slug[1]}?${params.toString()}`);
  }

  const getOptionals = useQuery({
    queryKey: ["getOptionals"],
    queryFn: async () => {
      const { data } = await apiClient.get("/optionals", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return data;
    },
  });

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["adsbybrand", slug[1], searchParams.toString()],
    queryFn: ({ pageParam }) => fetchAdverts({ pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.nextPage;
      return nextPage ? Number(nextPage) : undefined;
    },
  });

  const QueryStates = useQuery({
    queryKey: ["getStates"],
    queryFn: async () => await GetStates(),
  });

  const QueryCities = useMutation({
    mutationKey: ["getCities"],
    mutationFn: async (sigla: string) => await GetCities(sigla),
  });

  useEffect(() => {
    if (form.watch("estado") !== "") {
      QueryCities.mutate(form.watch("estado"));
    }
  }, [form.watch("estado")]);

  function handleSorting(e: string) {
    if (e === "default") return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e);
    router.push(`/stock/${slug}?${params.toString()}`);
  }

  return (
    <div className="w-full px-6 flex flex-col gap-8 max-w-[1920px] pt-10">
      <div className="flex gap-8">
        <div className="w-full min-h-full">
          <Card className="container mx-auto w-full min-h-screen">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Resultados</CardTitle>
              <div className="flex items-center gap-4">
                <Sheet>
                  <SheetTrigger className="text-sm transition-all cursor-pointer hover:underline">
                    Filtrar
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="flex flex-col items-center"
                  >
                    <SheetHeader className="w-full">
                      <SheetTitle>Escolha seus filtros</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="w-full h-[95%]">
                      <div className="w-full h-fit">
                        <CardHeader>
                          <div className="w-full">
                            <span className="font-medium">Filtros:</span>
                            <div className="w-full flex items-center gap-2">
                              <span className="flex items-center gap-2 bg-primary/10 p-2 w-fit rounded-md text-black/80 text-sm">
                                {slug[0]}
                                <Link href={`/stock/carros`}>
                                  <X className="h-4 w-4" />
                                </Link>
                              </span>
                              <span className="flex items-center gap-2 bg-primary/10 p-2 w-fit rounded-md text-black/80 text-sm">
                                {slug[1]}
                                <Link href={`/stock/${slug[0]}`}>
                                  <X className="h-4 w-4" />
                                </Link>
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Form {...form}>
                            <form
                              onSubmit={form.handleSubmit(onSubmit)}
                              className="space-y-5"
                            >
                              <FormField
                                control={form.control}
                                name="estado"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Estado</FormLabel>
                                    <FormControl>
                                      <Select
                                        {...field}
                                        onValueChange={field.onChange}
                                        name={field.name}
                                      >
                                        <SelectTrigger className="w-full">
                                          <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="default">
                                            Selecione
                                          </SelectItem>
                                          {QueryStates.data?.map((state) => (
                                            <SelectItem
                                              key={state.sigla}
                                              value={state.sigla.toString()}
                                            >
                                              {state.nome}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="cidade"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Cidade</FormLabel>
                                    <FormControl>
                                      <Select
                                        {...field}
                                        onValueChange={field.onChange}
                                        name={field.name}
                                      >
                                        <SelectTrigger className="w-full">
                                          <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="default">
                                            Selecione
                                          </SelectItem>
                                          {QueryCities.data?.map((city) => (
                                            <SelectItem
                                              key={city.id}
                                              value={city.nome}
                                            >
                                              {city.nome}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <div className="w-full flex flex-col gap-2">
                                <FormLabel>Buscar</FormLabel>
                                <FormField
                                  control={form.control}
                                  name="busca"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          placeholder="Buscar"
                                          type="text"
                                          {...field}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <div className="w-full flex gap-2 ">
                                <CustomInputValue
                                  form={form}
                                  label="R$"
                                  isPrice
                                  name="preco_min"
                                  placeholder="R$ 99.999.999"
                                />
                                <CustomInputValue
                                  form={form}
                                  isPrice
                                  label="Até"
                                  name="preco_max"
                                  placeholder="R$ 99.999.999"
                                />
                              </div>

                              <FormField
                                control={form.control}
                                name="modelo"
                                render={({ field }) => (
                                  <FormItem className="max-w-full">
                                    <FormLabel>Modelo</FormLabel>
                                    <Select
                                      {...field}
                                      onValueChange={field.onChange}
                                      name={field.name}
                                    >
                                      <SelectTrigger>
                                        <SelectValue
                                          placeholder={"Selecione"}
                                        />
                                      </SelectTrigger>
                                      <SelectContent className="max-w-full">
                                        <SelectItem value="default">
                                          Selecione
                                        </SelectItem>
                                        {models.map(
                                          (model: iModel, idx: number) => (
                                            <SelectItem
                                              value={model.name}
                                              key={idx}
                                              className="max-w-full text-sm"
                                            >
                                              {model.name}
                                            </SelectItem>
                                          )
                                        )}
                                      </SelectContent>
                                    </Select>
                                  </FormItem>
                                )}
                              />

                              <div className="w-full flex gap-2">
                                <div>
                                  <FormLabel>Ano</FormLabel>
                                  <FormField
                                    control={form.control}
                                    name="ano_modelo_min"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <Input
                                            placeholder="1970"
                                            type="number"
                                            {...field}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                <div>
                                  <FormLabel>Até</FormLabel>
                                  <FormField
                                    control={form.control}
                                    name="ano_modelo_max"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <Input
                                            placeholder="2025"
                                            type="number"
                                            {...field}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </div>

                              <div className="w-full flex flex-col gap-2">
                                <div className="w-full flex gap-2 ">
                                  <CustomInputValue
                                    form={form}
                                    label="Km"
                                    name="quilometragem_min"
                                    placeholder="0"
                                  />
                                  <CustomInputValue
                                    form={form}
                                    label="Até"
                                    name="quilometragem_max"
                                    placeholder="0"
                                  />
                                </div>
                              </div>
                              <FormField
                                control={form.control}
                                name="portas"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Portas</FormLabel>
                                    <FormControl>
                                      <Select
                                        {...field}
                                        onValueChange={field.onChange}
                                        name={field.name}
                                      >
                                        <SelectTrigger className="w-full">
                                          <SelectValue
                                            placeholder="Selecione"
                                            ref={field.ref}
                                          />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="default">
                                            Selecione
                                          </SelectItem>
                                          <SelectItem value="1">1</SelectItem>
                                          <SelectItem value="2">2</SelectItem>
                                          <SelectItem value="3">3</SelectItem>
                                          <SelectItem value="4">4</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <ScrollArea className="h-72 w-full rounded-md border p-2">
                                <FormField
                                  control={form.control}
                                  name="opcionais"
                                  render={() => (
                                    <FormItem>
                                      <FormLabel>Opcionais</FormLabel>
                                      {getOptionals.data?.map(
                                        (item: iOptional) => (
                                          <FormField
                                            key={item.name}
                                            control={form.control}
                                            name="opcionais"
                                            render={({ field }) => {
                                              return (
                                                <FormItem
                                                  key={item.name}
                                                  className="flex flex-row items-start space-x-3 space-y-0"
                                                >
                                                  <FormControl>
                                                    <Checkbox
                                                      checked={field.value?.includes(
                                                        item.name
                                                      )}
                                                      onCheckedChange={(
                                                        checked
                                                      ) => {
                                                        const currentItems =
                                                          form.getValues(
                                                            "opcionais"
                                                          ) || [];
                                                        if (checked) {
                                                          form.setValue(
                                                            "opcionais",
                                                            [
                                                              ...currentItems,
                                                              item.name,
                                                            ]
                                                          );
                                                        } else
                                                          form.setValue(
                                                            "opcionais",
                                                            currentItems.filter(
                                                              (value) =>
                                                                value !==
                                                                item.name
                                                            )
                                                          );
                                                      }}
                                                    />
                                                  </FormControl>
                                                  <FormLabel className="text-sm font-normal">
                                                    {item.name}
                                                  </FormLabel>
                                                </FormItem>
                                              );
                                            }}
                                          />
                                        )
                                      )}
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </ScrollArea>
                              <Button type="submit" variant={"outline"}>
                                Buscar
                              </Button>
                              <Button
                                type="button"
                                variant={"link"}
                                className="text-black"
                                onClick={() => form.reset()}
                              >
                                Limpar
                              </Button>
                            </form>
                          </Form>
                        </CardContent>
                      </div>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>
                <Select
                  onValueChange={(e) => handleSorting(e)}
                  value={sort || "default"}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Ordenar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={"default"}>Ordenar</SelectItem>
                    {sortingOptions.map((item, idx) => (
                      <SelectItem key={idx} value={item.key}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
              {status === "pending" ? (
                Array.from({ length: 24 }).map((_, index) => (
                  <Skeleton className="h-4 w-full" key={index} />
                ))
              ) : status === "error" ? (
                <p>Erro: {error.message}</p>
              ) : (
                <>
                  {data &&
                    data.pages.every((page) => page.data.length === 0) && (
                      <span className="m-auto text-sm text-muted-foreground">
                        Nenhum anúncio encontrado
                      </span>
                    )}
                  {data &&
                    data.pages
                      .flatMap((page) => page.data)
                      .map((advert, index) => {
                        return <CardAdvert data={advert} key={index} />;
                      })}
                </>
              )}
            </CardContent>
            <CardFooter className="w-full flex items-center justify-center mt-10">
              <div>
                <Button
                  variant={"outline"}
                  onClick={() => fetchNextPage()}
                  disabled={!hasNextPage || isFetchingNextPage}
                >
                  {isFetchingNextPage
                    ? "Buscando..."
                    : hasNextPage
                      ? "Buscar mais..."
                      : "Não há mais nada para buscar"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
