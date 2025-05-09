import { NextRequest, NextResponse } from "next/server";
import { normalizeText } from "@/lib/utils";

import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug: brand } = await params;

  try {
    const searchParams = request.nextUrl.searchParams;

    const filterAdvertsDto = {
      pageParam: searchParams.get("pageParam") || "1",
      min_year: searchParams.get("ano_modelo_max"),
      max_year: searchParams.get("ano_modelo_min"),
      transmission: searchParams.get("cambio"),
      model: searchParams.get("model"),
      search: searchParams.get("busca"),
      city: searchParams.get("cidade"),
      state: searchParams.get("estado"),
      color: searchParams.get("cor"),
      optionals: searchParams.get("opcionais")?.split(","),
      doors: searchParams.get("portas"),
      max_price: searchParams.get("preco_max"),
      min_price: searchParams.get("preco_min"),
      max_mileage: searchParams.get("quilometragem_max"),
      min_mileage: searchParams.get("quilometragem_min"),
      limit: searchParams.get("limit") || "10",
    };

    if (!brand) {
      return NextResponse.json(
        { error: "Marca não encontrada" },
        { status: 400 }
      );
    }

    const searchTerms = filterAdvertsDto.search?.split(" ");

    const skip =
      (Number(filterAdvertsDto.pageParam) - 1) * Number(filterAdvertsDto.limit);

    let optionalsRefactored: Array<string> = [];
    if (filterAdvertsDto.optionals) {
      optionalsRefactored = Array.isArray(filterAdvertsDto.optionals)
        ? filterAdvertsDto.optionals
        : [filterAdvertsDto.optionals];
    }

    const adverts = await prisma.adverts.findMany({
      skip,
      take: Number(filterAdvertsDto.limit),
      orderBy: { created_at: "asc" },
      where: {
        AND: [
          { status: "ACTIVE" },
          searchTerms
            ? {
                OR: searchTerms.flatMap((term) => [
                  {
                    color: {
                      contains: normalizeText(term),
                      mode: "insensitive",
                    },
                  },
                  {
                    transmission: {
                      contains: normalizeText(term),
                      mode: "insensitive",
                    },
                  },
                  {
                    brand: {
                      slug: {
                        contains: normalizeText(term),
                        mode: "insensitive",
                      },
                    },
                  },
                  {
                    model: {
                      slug: {
                        contains: normalizeText(term),
                        mode: "insensitive",
                      },
                    },
                  },
                  {
                    formatted_city: {
                      contains: normalizeText(term),
                      mode: "insensitive",
                    },
                  },
                  {
                    state: {
                      contains: normalizeText(term),
                      mode: "insensitive",
                    },
                  },
                ]),
              }
            : {},
          {
            brand: {
              slug: {
                equals: brand,
              },
            },
          },
          filterAdvertsDto.city
            ? {
                formatted_city: {
                  contains: filterAdvertsDto.city,
                  mode: "insensitive",
                },
              }
            : {},
          filterAdvertsDto.state
            ? {
                formatted_state: {
                  contains: filterAdvertsDto.state,
                  mode: "insensitive",
                },
              }
            : {},
          filterAdvertsDto.model
            ? {
                model: {
                  name: {
                    contains: filterAdvertsDto.model,
                    mode: "insensitive",
                  },
                },
              }
            : {},
          filterAdvertsDto.color
            ? {
                color: {
                  contains: filterAdvertsDto.color,
                  mode: "insensitive",
                },
              }
            : {},
          filterAdvertsDto.doors
            ? {
                doors: {
                  contains: filterAdvertsDto.doors,
                  mode: "insensitive",
                },
              }
            : {},
          filterAdvertsDto.transmission
            ? {
                transmission: {
                  contains: filterAdvertsDto.transmission,
                  mode: "insensitive",
                },
              }
            : {},
          filterAdvertsDto.min_price
            ? { price: { gte: parseInt(filterAdvertsDto.min_price, 10) } }
            : {},
          filterAdvertsDto.max_price
            ? {
                price: {
                  lte:
                    parseInt(filterAdvertsDto.max_price, 10) > 0
                      ? parseInt(filterAdvertsDto.max_price, 10)
                      : 9999999,
                },
              }
            : {},
          filterAdvertsDto.max_mileage
            ? {
                mileage: {
                  lte:
                    parseInt(filterAdvertsDto.max_mileage, 10) > 0
                      ? parseInt(filterAdvertsDto.max_mileage, 10)
                      : 9999999,
                },
              }
            : {},
          filterAdvertsDto.min_mileage
            ? {
                mileage: {
                  gte: parseInt(filterAdvertsDto.min_mileage, 10),
                },
              }
            : {},
          filterAdvertsDto.max_year
            ? { year_model: { lte: parseInt(filterAdvertsDto.max_year) } }
            : {},
          filterAdvertsDto.min_year
            ? { year_model: { gte: parseInt(filterAdvertsDto.min_year) } }
            : {},
          filterAdvertsDto.optionals
            ? { optionals: { some: { name: { in: optionalsRefactored } } } }
            : {},
        ],
      },
      include: {
        brand: true,
        model: true,
        images: { select: { url: true, id: true } },
        optionals: { select: { id: true, name: true } },
        user: {
          select: {
            id: true,
            name: true,
            lastname: true,
            image: true,
            email: true,
            phone: true,
            created_at: true,
          },
        },
      },
    });

    const total = await prisma.adverts.count({
      where: {
        AND: [
          { status: "ACTIVE" },
          searchTerms
            ? {
                OR: searchTerms.flatMap((term) => [
                  {
                    color: {
                      contains: normalizeText(term),
                      mode: "insensitive",
                    },
                  },
                  {
                    transmission: {
                      contains: normalizeText(term),
                      mode: "insensitive",
                    },
                  },
                  {
                    brand: {
                      slug: {
                        contains: normalizeText(term),
                        mode: "insensitive",
                      },
                    },
                  },
                  {
                    model: {
                      slug: {
                        contains: normalizeText(term),
                        mode: "insensitive",
                      },
                    },
                  },
                  {
                    formatted_city: {
                      contains: normalizeText(term),
                      mode: "insensitive",
                    },
                  },
                  {
                    state: {
                      contains: normalizeText(term),
                      mode: "insensitive",
                    },
                  },
                ]),
              }
            : {},
          {
            brand: {
              slug: {
                equals: brand,
              },
            },
          },
          filterAdvertsDto.city
            ? {
                formatted_city: {
                  contains: filterAdvertsDto.city,
                  mode: "insensitive",
                },
              }
            : {},
          filterAdvertsDto.state
            ? {
                formatted_state: {
                  contains: filterAdvertsDto.state,
                  mode: "insensitive",
                },
              }
            : {},
          filterAdvertsDto.model
            ? {
                model: {
                  name: {
                    contains: filterAdvertsDto.model,
                    mode: "insensitive",
                  },
                },
              }
            : {},
          filterAdvertsDto.color
            ? {
                color: {
                  contains: filterAdvertsDto.color,
                  mode: "insensitive",
                },
              }
            : {},
          filterAdvertsDto.doors
            ? {
                doors: {
                  contains: filterAdvertsDto.doors,
                  mode: "insensitive",
                },
              }
            : {},
          filterAdvertsDto.transmission
            ? {
                transmission: {
                  contains: filterAdvertsDto.transmission,
                  mode: "insensitive",
                },
              }
            : {},
          filterAdvertsDto.min_price
            ? { price: { gte: parseInt(filterAdvertsDto.min_price, 10) } }
            : {},
          filterAdvertsDto.max_price
            ? {
                price: {
                  lte:
                    parseInt(filterAdvertsDto.max_price, 10) > 0
                      ? parseInt(filterAdvertsDto.max_price, 10)
                      : 9999999,
                },
              }
            : {},
          filterAdvertsDto.max_mileage
            ? {
                mileage: {
                  lte:
                    parseInt(filterAdvertsDto.max_mileage, 10) > 0
                      ? parseInt(filterAdvertsDto.max_mileage, 10)
                      : 9999999,
                },
              }
            : {},
          filterAdvertsDto.min_mileage
            ? {
                mileage: {
                  gte: parseInt(filterAdvertsDto.min_mileage, 10),
                },
              }
            : {},
          filterAdvertsDto.max_year
            ? { year_model: { lte: parseInt(filterAdvertsDto.max_year) } }
            : {},
          filterAdvertsDto.min_year
            ? { year_model: { gte: parseInt(filterAdvertsDto.min_year) } }
            : {},
          filterAdvertsDto.optionals
            ? { optionals: { some: { name: { in: optionalsRefactored } } } }
            : {},
        ],
      },
    });

    const nextPage =
      skip + Number(filterAdvertsDto.limit) < total
        ? Number(filterAdvertsDto.pageParam) + 1
        : null;

    return NextResponse.json({
      data: adverts,
      currentPage: Number(filterAdvertsDto.pageParam),
      nextPage,
      total,
    });
  } catch (error) {
    console.error("Erro ao filtrar anúncios:", error);
    return NextResponse.json(
      { error: "Erro ao filtrar anúncios" },
      { status: 500 }
    );
  }
}
