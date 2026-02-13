import { verify } from "jsonwebtoken";
import authConfig from "../config/auth";
import * as Yup from "yup";
import { Request, Response } from "express";
import AppError from "../errors/AppError";
import User from "../models/User";

import ListLicensesService from "../services/LicenseService/ListLicensesService";
import FindAllLicensesService from "../services/LicenseService/FindAllLicensesService";
import CreateLicenseService from "../services/LicenseService/CreateLicenseService";
import ShowLicenseService from "../services/LicenseService/ShowLicenseService";
import UpdateLicenseService from "../services/LicenseService/UpdateLicenseService";
import DeleteLicenseService from "../services/LicenseService/DeleteLicenseService";
import RegisterPaymentService from "../services/LicenseService/RegisterPaymentService";

interface TokenPayload {
  id: string;
  companyId: number;
  iat: number;
  exp: number;
}

type IndexQuery = {
  searchParam?: string;
  pageNumber?: string;
};

type LicenseData = {
  companyId: number;
  planId: number;
  status?: string;
  startDate: string;
  endDate?: string | null;
  amount?: string | null;
  recurrence?: string | null;
};

export const getRequestUser = async (req: Request) => {
  const authHeader = req.headers.authorization;
  const [, token] = (authHeader || "").split(" ");
  let requestUserCompanyId: number | undefined;
  let requestUserSuper = false;
  let requestUserId: number | undefined;
  if (token) {
    try {
      const decoded = verify(token, authConfig.secret) as TokenPayload;
      const requestUser = await User.findByPk(decoded.id);
      if (requestUser) {
        requestUserCompanyId = requestUser.companyId;
        requestUserSuper = requestUser.super === true;
        requestUserId = requestUser.id;
      }
    } catch {
      //
    }
  }
  return { requestUserCompanyId, requestUserSuper, requestUserId };
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber, companyId, status, planId } = req.query as IndexQuery & {
    companyId?: string;
    status?: string;
    planId?: string;
  };
  const { requestUserCompanyId, requestUserSuper } = await getRequestUser(req);

  const { licenses, count, hasMore } = await ListLicensesService({
    searchParam,
    pageNumber,
    requestUserCompanyId,
    requestUserSuper,
    companyId: companyId ? Number(companyId) : undefined,
    status,
    planId: planId ? Number(planId) : undefined
  });

  return res.json({ licenses, count, hasMore });
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { requestUserCompanyId, requestUserSuper } = await getRequestUser(req);

  const licenses = await FindAllLicensesService({
    requestUserCompanyId,
    requestUserSuper
  });

  return res.status(200).json(licenses);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { requestUserCompanyId, requestUserSuper } = await getRequestUser(req);

  const license = await ShowLicenseService({
    id,
    requestUserCompanyId,
    requestUserSuper
  });

  return res.status(200).json(license);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const data: LicenseData = req.body;

  const schema = Yup.object().shape({
    companyId: Yup.number().required(),
    planId: Yup.number().required(),
    startDate: Yup.string().required()
  });

  try {
    await schema.validate(data);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const { requestUserCompanyId, requestUserSuper } = await getRequestUser(req);

  const license = await CreateLicenseService({
    ...data,
    requestUserCompanyId,
    requestUserSuper
  });

  return res.status(200).json(license);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const data = req.body;

  const schema = Yup.object().shape({
    status: Yup.string(),
    startDate: Yup.string(),
    endDate: Yup.string().nullable(),
    amount: Yup.string().nullable(),
    recurrence: Yup.string().nullable()
  });

  try {
    await schema.validate(data);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const { requestUserCompanyId, requestUserSuper, requestUserId } = await getRequestUser(req);

  const license = await UpdateLicenseService({
    id,
    ...data,
    requestUserCompanyId,
    requestUserSuper,
    requestUserId
  });

  return res.status(200).json(license);
};

export const registerPayment = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { requestUserCompanyId, requestUserSuper, requestUserId } = await getRequestUser(req);

  const license = await RegisterPaymentService({
    licenseId: id,
    requestUserCompanyId,
    requestUserSuper,
    requestUserId
  });
  return res.status(200).json(license);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { requestUserCompanyId, requestUserSuper } = await getRequestUser(req);

  await DeleteLicenseService({
    id,
    requestUserCompanyId,
    requestUserSuper
  });

  return res.status(200).json({ message: "Licença excluída." });
};
