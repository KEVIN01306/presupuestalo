import type { NextFunction, Request, Response } from "express";
import BaseController from "@presentation/base.controller.js";
import ResponseHttp from "@app/http/response.http.js";
import type { ListCurrenciesUseCase } from "../application/list-currencies.usecase.js";

export class CurrenciesController extends BaseController {
    constructor(private readonly listCurrenciesUseCase: ListCurrenciesUseCase) {
        super();
    }

    list = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await this.listCurrenciesUseCase.execute();
            res.status(200).json(ResponseHttp.success("Monedas obtenidas con éxito", data));
        } catch (error) {
            next(error);
        }
    };
}
