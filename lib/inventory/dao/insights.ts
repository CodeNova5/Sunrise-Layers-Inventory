import mongoose from "mongoose";
import { OrderItemModel } from "../models/orderItem";
import { OrderModel } from "../models/order";
import { GoodModel } from "../models/good";
import { BuyerModel } from "../models/buyer";
import {
  createBuyerRevenueByPeriodChart,
  createRevenueByBuyerChart,
  createRevenueByGoodChart,
  createRevenueByPeriodChart,
} from "../../core/insightsVisualizer";
import { ValueError } from "../../errors";

async function revenueByBuyer(visualize: boolean = false) {
  const results = await OrderModel.aggregate([
    {
      $lookup: {
        from: OrderItemModel.collection.name, // Automatically get the collection name
        localField: "_id", // Field in Order collection
        foreignField: "orderId", // Corresponding field in OrderItem collection
        as: "items", // Resultant array of joined documents
      },
    },
    { $unwind: "$items" }, // Flatten the array of items
    {
      $group: {
        _id: "$buyerId", // Group by buyerId
        totalRevenue: { $sum: "$items.sellingPrice" }, // Sum of selling prices for revenue
        totalCost: { $sum: "$items.costPrice" }, // Sum of cost prices for cost
      },
    },
    {
      $lookup: {
        from: "buyers", // Assuming 'buyers' is the collection name for BuyerModel
        localField: "_id",
        foreignField: "_id",
        as: "buyerDetails",
      },
    },
    { $unwind: "$buyerDetails" },
    {
      $project: {
        _id: 0,
        buyerName: "$buyerDetails.name",
        totalRevenue: 1,
        totalCost: 1,
        profit: { $subtract: ["$totalRevenue", "$totalCost"] }, // Calculate profit
      },
    },
    { $sort: { buyerName: 1 } },
  ]);
  if (visualize) {
    console.table(results);
    createRevenueByBuyerChart(results);
  } else return results;
}

async function revenueByGood(visualize: boolean = false) {
  const results = await OrderItemModel.aggregate([
    {
      $lookup: {
        from: OrderModel.collection.name, // Link OrderItem with Order
        localField: "orderId", // Field in OrderItem collection
        foreignField: "_id", // Corresponding field in Order collection
        as: "order", // Resultant array of joined documents
      },
    },
    { $unwind: "$order" }, // Flatten the array of orders
    {
      $match: {
        // Filter for only pending or paid orders
        "order.status": { $in: ["pending", "paid"] },
      },
    },
    {
      $lookup: {
        from: GoodModel.collection.name, // Automatically get the collection name
        localField: "goodId", // Field in OrderItem collection
        foreignField: "_id", // Corresponding field in Good collection
        as: "goodDetails", // Resultant array of joined documents
      },
    },
    { $unwind: "$goodDetails" }, // Flatten the array of goods
    {
      $group: {
        _id: "$goodId", // Group by goodId
        goodName: { $last: "$goodDetails.name" },
        totalRevenue: { $sum: { $multiply: ["$qty", "$sellingPrice"] } }, // Sum of revenue for each good
        totalCost: { $sum: { $multiply: ["$qty", "$costPrice"] } }, // Sum of cost prices for each good
        totalQuantitySold: { $sum: "$qty" }, // Total quantity sold for each good
      },
    },
    {
      $project: {
        _id: 0,
        goodName: 1,
        totalRevenue: 1,
        totalCost: 1,
        totalQuantitySold: 1,
        profit: { $subtract: ["$totalRevenue", "$totalCost"] }, // Calculate profit
      },
    },
    { $sort: { goodName: 1 } },
  ]);
  if (visualize) {
    console.table(results);
    createRevenueByGoodChart(results);
  } else return results;
}

async function revenueByPeriod(
  metric: "hour" | "day" | "month" | "year",
  before?: Date,
  after?: Date
) {
  const matchStage: any = { "order.status": { $in: ["paid", "pending"] } };
  if (before || after) {
    matchStage["order.createdAt"] = {};
    if (before) matchStage["order.createdAt"].$lte = before;
    if (after) matchStage["order.createdAt"].$gte = after;
  }
  let dateOperator;
  let range;
  switch (metric) {
    case "hour":
      dateOperator = { $hour: "$order.createdAt" };
      range = Array.from({ length: 24 }, (_, i) => i);
      break;
    case "day":
      dateOperator = { $subtract: [{ $dayOfWeek: "$order.createdAt" }, 1] };
      range = Array.from({ length: 7 }, (_, i) => i);
      break;
    case "month":
      dateOperator = { $subtract: [{ $month: "$order.createdAt" }, 1] };
      range = Array.from({ length: 12 }, (_, i) => i);
      break;
    case "year":
      dateOperator = { $year: "$order.createdAt" };
      const startYear = after
        ? after.getFullYear()
        : new Date().getFullYear() - 5;
      const endYear = before ? before.getFullYear() : new Date().getFullYear();
      range = Array.from(
        { length: endYear - startYear + 1 },
        (_, i) => startYear + i
      );
      break;
    default:
      ValueError.throw(`Invalid metric ${metric}`);
  }

  const pipeline = [
    {
      $lookup: {
        from: OrderModel.collection.name,
        localField: "orderId",
        foreignField: "_id",
        as: "order",
      },
    },
    { $unwind: "$order" },
    { $match: matchStage },
    {
      $group: {
        _id: dateOperator,
        totalRevenue: { $sum: { $multiply: ["$qty", "$sellingPrice"] } },
        totalCost: { $sum: { $multiply: ["$qty", "$costPrice"] } },
        totalQuantitySold: { $sum: "$qty" },
      },
    },
    {
      $project: {
        _id: 0,
        period: "$_id",
        totalRevenue: 1,
        totalCost: 1,
        totalQuantitySold: 1,
        profit: { $subtract: ["$totalRevenue", "$totalCost"] },
      },
    },
    // { $sort: { profit: 1} }
  ];

  const results = await OrderItemModel.aggregate(pipeline);

  // Pad the results with empty values for missing periods
  const paddedResults = range.map((period) => {
    const existingResult = results.find((r) => r.period === period);
    return (
      existingResult || {
        period,
        totalRevenue: 0,
        totalCost: 0,
        totalQuantitySold: 0,
        profit: 0,
      }
    );
  });

  // Query for order statistics
  const orderQuery: any = {};
  if (before || after) {
    orderQuery["createdAt"] = {};
    if (before) orderQuery["createdAt"].$lte = before;
    if (after) orderQuery["createdAt"].$gte = after;
  }

  const [pending, errors, paid, rest, cancelled] = await Promise.all([
    OrderModel.countDocuments({ status: "pending", ...orderQuery }),
    OrderModel.countDocuments({ status: "error", ...orderQuery }),
    OrderModel.countDocuments({ status: "paid", ...orderQuery }),
    OrderModel.countDocuments({ status: "rest", ...orderQuery }),
    OrderModel.countDocuments({ status: "cancelled", ...orderQuery }),
  ]);

  const total = pending + errors + paid + rest + cancelled;
  const summary = { pending, errors, paid, rest, cancelled, total };
  return { results: paddedResults, summary };
}
async function buyerRevenueByPeriod(
  metric: "day" | "month" | "year",
  visualize: boolean = false
) {
  const results = await OrderItemModel.aggregate([
    {
      $lookup: {
        from: OrderModel.collection.name, // Link OrderItem with Order
        localField: "orderId", // Field in OrderItem collection
        foreignField: "_id", // Corresponding field in Order collection
        as: "order", // Resultant array of joined documents
      },
    },
    { $unwind: "$order" }, // Flatten the array of orders
    {
      $match: {
        // Filter for only pending or paid orders
        "order.status": { $in: ["pending", "paid"] },
      },
    },
    {
      $lookup: {
        from: BuyerModel.collection.name, // Link Order with Buyer
        localField: "order.buyerId", // Field in Order collection
        foreignField: "_id", // Corresponding field in Buyer collection
        as: "buyer", // Resultant array of joined documents
      },
    },
    { $unwind: "$buyer" }, // Flatten the array of buyers
    {
      $group: {
        _id: {
          period: {
            $dateTrunc: {
              // Truncate date to specified metric
              date: "$order.createdAt", // Use the createdAt field
              unit: metric, // Dynamic metric (days, month, years)
            },
          },
          buyer: "$buyer.name", // Group additionally by buyer's name
        },
        totalRevenue: { $sum: { $multiply: ["$qty", "$sellingPrice"] } }, // Sum of revenue for each period and buyer
        totalCost: { $sum: { $multiply: ["$qty", "$costPrice"] } }, // Sum of cost for each period and buyer
        totalQuantitySold: { $sum: "$qty" }, // Total quantity sold for each period and buyer
      },
    },
    {
      $project: {
        _id: 0,
        period: "$_id.period",
        buyer: "$_id.buyer",
        totalRevenue: 1,
        totalCost: 1,
        totalQuantitySold: 1,
        profit: { $subtract: ["$totalRevenue", "$totalCost"] }, // Calculate profit
      },
    },
    { $sort: { period: 1, buyer: 1 } }, // Sort by period and buyer in ascending order
  ]);
  if (visualize) {
    console.table(results);
    createBuyerRevenueByPeriodChart(results);
  } else return results;
}

async function getTopTenOverdueOrders(before?: Date, after?: Date) {
  const matchStage: any = {
    overdueLimit: { $exists: true, $lt: new Date() },
    status: { $nin: ["paid", "cancelled"] },
  };

  if (before && after) {
    matchStage.createdAt = { $gte: new Date(after), $lte: new Date(before) };
  } else if (before) {
    matchStage.createdAt = { $lte: new Date(before) };
  } else if (after) {
    matchStage.createdAt = { $gte: new Date(after) };
  }

  const orders = await OrderModel.aggregate([
    {
      $match: matchStage,
    },
    {
      $lookup: {
        from: OrderItemModel.collection.name,
        localField: "_id",
        foreignField: "orderId",
        as: "orderItems",
      },
    },
    {
      $lookup: {
        from: BuyerModel.collection.name,
        localField: "buyerId",
        foreignField: "_id",
        as: "buyer",
      },
    },
    {
      $unwind: "$buyer",
    },
    {
      $project: {
        _id: 0,
        orderNo: "$orderNo",
        orderId: "$_id",
        orderAmount: {
          $sum: {
            $map: {
              input: "$orderItems",
              as: "item",
              in: { $multiply: ["$$item.sellingPrice", "$$item.qty"] },
            },
          },
        },
        buyers_name: "$buyer.name",
        dueDate: "$overdueLimit",
        amountPaid: "$amountPaid",
      },
    },
    {
      $sort: { dueDate: 1 },
    },
    {
      $limit: 10,
    },
  ]);

  return orders;
}

type TopSellingGood = {
  id: string;
  productId: string;
  name: string;
  category: string[];
  stock: number;
  costPrice: number;
  qtySold: number;
  revenue: number;
};

async function getTopTenSellingGoods(
  before?: Date,
  after?: Date
): Promise<TopSellingGood[]> {
  const matchStage: any = {
    "order.status": { $in: ["paid", "pending", "ongoing"] },
  };

  if (before && after) {
    matchStage.createdAt = { $gte: after, $lte: before };
  } else if (before) {
    matchStage.createdAt = { $lte: before };
  } else if (after) {
    matchStage.createdAt = { $gte: after };
  }

  const goods = await OrderItemModel.aggregate([
    {
      $lookup: {
        from: OrderModel.collection.name,
        localField: "orderId",
        foreignField: "_id",
        as: "order",
      },
    },
    {
      $match: matchStage,
    },
    {
      $group: {
        _id: "$goodId",
        qtySold: { $sum: "$qty" },
        revenue: { $sum: { $multiply: ["$qty", "$sellingPrice"] } },
      },
    },
    {
      $lookup: {
        from: "goods",
        localField: "_id",
        foreignField: "_id",
        as: "goodDetails",
      },
    },
    {
      $unwind: "$goodDetails",
    },
    {
      $project: {
        id: "$_id",
        _id: 0,
        productId: "$goodDetails._id",
        name: "$goodDetails.name",
        category: "$goodDetails.categories",
        stock: "$goodDetails.qty",
        costPrice: "$goodDetails.costPrice",
        qtySold: 1,
        revenue: 1,
      },
    },
    {
      $sort: { qtySold: -1 }, // Sorting by quantity sold in descending order
    },
    {
      $limit: 10,
    },
  ]);

  return goods.map((good: any) => ({
    ...good,
    productId: good.productId.toString(),
  })) as unknown as TopSellingGood[];
}
async function getMostValuableAndProfitableProducts(
  before?: Date,
  after?: Date
) {
  const matchStage: any = { "order.status": { $in: ["paid", "pending"] } };
  if (before && after) {
    matchStage["order.createdAt"] = { $gte: after, $lte: before };
  } else if (before) {
    matchStage["order.createdAt"] = { $lte: before };
  } else if (after) {
    matchStage["order.createdAt"] = { $gte: after };
  }

  const products = await OrderItemModel.aggregate([
    {
      $lookup: {
        from: OrderModel.collection.name,
        localField: "orderId",
        foreignField: "_id",
        as: "order",
      },
    },
    {
      $unwind: "$order",
    },
    {
      $match: matchStage,
    },
    {
      $group: {
        _id: "$goodId",
        qtySold: { $sum: "$qty" },
        revenue: { $sum: { $multiply: ["$qty", "$sellingPrice"] } },
        cost: { $sum: { $multiply: ["$qty", "$costPrice"] } },
        orderCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: GoodModel.collection.name,
        localField: "_id",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    {
      $unwind: "$productDetails",
    },
    {
      $project: {
        name: "$productDetails.name",
        id: "$_id",
        qtySold: 1,
        revenue: 1,
        cost: 1,
        profit: { $subtract: ["$revenue", "$cost"] },
        orderCount: 1,
      },
    },
    {
      $project: {
        name: 1,
        id: 1,
        qtySold: 1,
        revenue: 1,
        cost: 1,
        profit: 1,
        profitPercentage: {
          $divide: ["$profit", "$cost"],
        },
        orderCount: 1,
      },
    },
    {
      $facet: {
        mvp: [{ $sort: { revenue: -1 } }, { $limit: 1 }],
        mpp: [{ $sort: { profitPercentage: -1 } }, { $limit: 1 }],
      },
    },
  ]);

  const result = {
    mvp: products[0].mvp[0] || null,
    mpp: products[0].mpp[0] || null,
  };

  return result;
}

async function recentActions(before?: Date, after?: Date) {
  let startDate, endDate;

  if (before && after) {
    startDate = new Date(after);
    endDate = new Date(before);
  } else {
    endDate = new Date();
    startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 3);
  }

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  const newBuyers = await BuyerModel.find({
    createdAt: { $gte: startDate, $lte: endDate },
  }).lean();
  const buyersWithType = newBuyers.map((buyer) => ({
    ...buyer,
    type: "buyer",
  }));
  const newOrders = await OrderModel.find({
    createdAt: { $gte: startDate, $lte: endDate },
  }).lean();
  const ordersWithType = newOrders.map((order) => ({
    ...order,
    type: "order",
  }));
  const combinedResults = [...buyersWithType, ...ordersWithType].sort(
    (a: any, b: any) => b.createdAt - a.createdAt
  );

  return combinedResults;
}
const InsightsDAO = {
  revenueByBuyer,
  revenueByGood,
  revenueByPeriod,
  buyerRevenueByPeriod,
  getTopTenOverdueOrders,
  getTopTenSellingGoods,
  getMostValuableAndProfitableProducts,
  recentActions,
};

export default InsightsDAO;
