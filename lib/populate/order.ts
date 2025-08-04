import { faker } from "@faker-js/faker";
import Buyer from "../inventory/models/buyer";
import Order, {orderStatusChoices, paymentMethodChoices} from "../inventory/models/order";
import { choice, randint, randDate } from "../utils";
import { addDays } from "date-fns";
import { OrderStatus } from "../@types/order";

export default async function populateOrders(number: number) {
    const orders = [];
    const buyers = await Buyer.find().select({ _id: 1 });
    const orderStatusChoices: OrderStatus[] = ["pending", "cancelled"];
    for (let i = 0; i < number; i++) {
        const buyer = choice(buyers);
        const createdAt = randDate(
            new Date(2020, 0, 1, 10),
            new Date(2032, 11, 31, 12)
            );
        const overdueLimit = randDate(
            addDays(createdAt, 1),
            addDays(createdAt, 30)
        );
        const status = new Date() > overdueLimit ? "overdue" : choice(orderStatusChoices);
        const cancelReason = status === "cancelled" ? faker.lorem.sentence({ min: 3, max: 10 }) : null;
        const order = new Order({
          status,
          overdueLimit,
          buyerId: buyer._id,
          discount: randint(0, 50),
          cancelReason,
          createdAt
        });
        await order.save();
        orders.push(order);
    }
    return orders;
};