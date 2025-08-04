import OrderModel from "../inventory/models/order";
import OrderPaymentModel from "../inventory/models/orderPayment";
import { paymentMethodChoices } from "../@types/order";
import { choice, randint } from "../utils";
import User from "../common/models/user";
import OrderPaymentDAO from "../inventory/dao/orderPayment";

export default async function populateOrderPayments(
  numOrders: number,
  maxPaymentsPerOrder: number
) {
  const orderPayments = [];
  const userIds = await User.find()
    .select({ _id: 1 })
    .exec()
    .then((users) => {
      return users.map((user) => user._id);
    });
  const orders = await OrderModel.aggregate([
    { $match: { status: { $in: ["pending", "ongoing"] } } },
    {
      $lookup: {
        from: "orderitems",
        localField: "_id",
        foreignField: "orderId",
        as: "orderItems",
      },
    },
    {
      $addFields: {
        amountDue: {
          $reduce: {
            input: "$orderItems",
            initialValue: 0,
            in: {
              $add: [
                "$$value",
                { $multiply: ["$$this.sellingPrice", "$$this.qty"] },
              ],
            },
          },
        },
      },
    },
    { $project: { amountDue: 1, discount: 1, amountPaid: 1, buyerId: 1 } },
  ])
    .limit(numOrders)
    .exec();
  for (let order of orders) {
    const total: number = order.amountDue;
    let amountPaid: number = order.amountPaid;
    const discountPercentage: number = order.discount;
    const discount: number = total * (discountPercentage / 100);
    const amountDue: number = total - discount;
    const numPayments = randint(1, maxPaymentsPerOrder);
    for (let i = 0; i < numPayments; i++) {
      // amount can be a random number that is from 10% to 190% of the amount due
      const due = amountDue - amountPaid;
      if (due <= 0) {
        break;
      }
      let amount = randint(due * 0.1, due * 1.9);
      amount = Math.min(amount, due);
      const payment = await OrderPaymentDAO.createOrderPayment(order, {
        amount,
        paymentMethod: choice(paymentMethodChoices),
        confirmedBy: choice(userIds).toHexString(),
        customer: order.buyerId.toHexString(),
      });
      amountPaid += amount;
      orderPayments.push(payment);
    }
  }
  return orderPayments;
}
