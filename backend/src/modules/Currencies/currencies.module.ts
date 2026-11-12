import prisma from "@infrastructure/config/prisma/prisma.config.js";
import { PrismaCurrenciesRepository } from "./infrastructure/prisma-currencies.repository.js";
import { ListCurrenciesUseCase } from "./application/list-currencies.usecase.js";
import { CurrenciesController } from "./presentation/currencies.controller.js";

export const currenciesRepository = new PrismaCurrenciesRepository(prisma);

const listCurrenciesUseCase = new ListCurrenciesUseCase(currenciesRepository);

export const currenciesController = new CurrenciesController(listCurrenciesUseCase);
