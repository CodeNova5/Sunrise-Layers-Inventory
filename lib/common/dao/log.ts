import mongoose, { FilterQuery, SortOrder } from "mongoose";
import LogModel, { ILogDocument } from "../models/log";
import { PaginatedDocs } from "@/lib/@types/pagination";
import { EntityNotFound, PageNotFound } from "../../errors";

export interface logParams {
  display: string[];
  target: string;
  details?: { [key: string]: any };
  targetId: mongoose.Types.ObjectId;
  loggerId: mongoose.Types.ObjectId;
}
export interface PaginatedLogs extends PaginatedDocs {
  logs: (ILogDocument & { id: string })[];
}

async function logCreation(params: logParams) {
  const log = new LogModel({ ...params, action: "create" });
  return await log.save();
}

async function logModification(params: logParams) {
  const log = new LogModel({ ...params, action: "update" });
  return await log.save();
}
async function getLogs({
  filters,
  page = 1,
  limit = 10,
  order = -1,
}: {
  filters: FilterQuery<ILogDocument>;
  page: number;
  limit: number;
  order: SortOrder;
}): Promise<PaginatedLogs> {
  if (page < 1) {
    PageNotFound.throw(page, "Log", { query: filters, limit });
  }
  if (limit < 1) {
    PageNotFound.throw(page, "Log", { query: filters, limit });
  }
  if (![1, -1].includes(parseInt(order.toString()))) {
    order = -1
  }
  const query = filters ? filters : {};
  const totalDocs = await LogModel.countDocuments(query).exec();
  const totalPages = Math.ceil(totalDocs / limit);
  if (page > 1 && page > totalPages) {
    PageNotFound.throw(page, "Log", { query: filters, limit });
  }
  const skip = (page - 1) * limit;
  const logs = await LogModel.find(query).sort({ createdAt: order }).skip(skip).limit(limit).lean().exec();
  const next = logs.length === limit ? page + 1 : null;
  const prev = page > 1 ? page - 1 : null;
  return {
    // @ts-ignore
    logs: logs.map((log) => ({ ...log, id: log._id.toString() })),
    totalDocs,
    limit,
    page,
    totalPages,
    next,
    prev,
    hasPrevPage: prev !== null,
    hasNextPage: next !== null,
  };
}

async function logDeletion(params: logParams) {
  const log = new LogModel({ ...params, action: "delete" });
  return await log.save();
}

const LogDAO = {
  logCreation,
  logModification,
  logDeletion,
  getLogs,
};

export default LogDAO;
