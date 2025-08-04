import mongoose from 'mongoose';
import { BuyerModel, IBuyerDocument } from '../models/buyer';
import { OrderModel } from '../models/order';
import { FilterQuery } from 'mongoose';
import { PaginatedDocs } from '@/lib/@types/pagination';
import { Buyer } from '@/lib/@types/buyer';
import { EntityNotFound, IntegrityError, PageNotFound, ValueError } from '../../errors';

interface PaginatedBuyers extends PaginatedDocs {
    buyers: Buyer[];
}

async function addBuyer(params: Buyer) {
    const { name, phone, email } = params;

    // validate the buyer data

    const buyer = new BuyerModel({
        name,
        phone,
        email,
    });
    await buyer.save();
    return buyer;
}

async function getBuyers({
  filters,
  page = 1,
  limit = 10,
}: {
  filters: FilterQuery<IBuyerDocument>;
  page: number;
  limit: number;
}): Promise<PaginatedBuyers> {
  if (page < 1) {
    PageNotFound.throw(page, "Customer", { query: filters, limit });
  }
  if (limit < 1) {
    PageNotFound.throw(page, "Customer", { query: filters, limit });
  }

  const query = filters ? filters : {};
  const totalDocs = await BuyerModel.countDocuments(query).exec();
  const totalPages = Math.ceil(totalDocs / limit);
  if (page > 1 && page > totalPages) {
    PageNotFound.throw(page, "Customer", { query: filters, limit });
  }
  const skip = (page - 1) * limit;
  const buyers = await BuyerModel.find(query)
    .skip(skip)
    .sort({ name: 1 })
    .limit(limit)
    .lean()
    .exec();
  const next = page < totalPages ? page + 1 : null;
  const prev = page > 1 ? page - 1 : null;
  return {
    // @ts-ignore
    buyers: buyers.map((buyer) => ({ ...buyer, id: buyer._id.toString() })),
    totalDocs,
    limit,
    page,
    pageCount: totalPages,
    next,
    prev,
    hasPrevPage: prev !== null,
    hasNextPage: next !== null,
  };
}

async function getBuyer(id?: mongoose.Types.ObjectId, filters?: Partial<Buyer>) {
    let query = {};
    if (id) query = { _id: id };
    if (filters) query = { ...query, ...filters };
    if (!id && !filters) {
        ValueError.throw("Either id or filters must be provided");
    }
    const buyer = await BuyerModel.findOne(query).exec();
    if (!buyer) {
        EntityNotFound.throw("Customer", query);
    }
    return buyer;
}

async function updateBuyer(id: mongoose.Types.ObjectId, params: Partial<Buyer>, buyerData: Partial<Buyer>) {
    if (params.name) {
        IntegrityError.throw("Name can't be updated", {
            code: "name_update_error",
        });
      }
    let query = {};
    if (id) query = { _id: id };
    if (params) query = { ...query, ...params };
    const buyer = await BuyerModel.findOneAndUpdate(query, buyerData)
    if (!buyer) {
        EntityNotFound.throw("Customer", query);
    }
    return buyer
}

async function deleteBuyer(id: mongoose.Types.ObjectId) {
    const count = await OrderModel.countDocuments({ buyerId: id, $or: [{ status: 'pending' }, { status: 'error' }, { amountPaid: { $gt: 0 } }] });
    if (count > 0) {
      IntegrityError.throw("Buyer can't be deleted as he has pending business here", {
        code: "buyer_has_pending_orders",
        buyer_id: id.toString(),
      });
    }
    const buyer = await BuyerModel.findOneAndDelete({ _id: id });
    if (!buyer) {
        EntityNotFound.throw("Customer", id.toString());
    }
    return buyer;
}

const BuyerDAO = {
    addBuyer,
    getBuyers,
    getBuyer,
    updateBuyer,
    deleteBuyer
}
export default BuyerDAO