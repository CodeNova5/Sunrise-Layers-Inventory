import mongoose from "mongoose";
import User from "@/lib/common/models/user";
import Group from "@/lib/common/models/group";
import Buyer from "@/lib/inventory/models/buyer";
import Order from "@/lib/inventory/models/order";
import Good from "@/lib/inventory/models/good";
import OrderItem from "@/lib/inventory/models/orderItem";
import OrderPayment from "@/lib/inventory/models/orderPayment";

export default async function tearDown() {
    console.log("Deleting all order payments");
    await OrderPayment.deleteMany({});
    console.log("Deleting all order items");
    await OrderItem.deleteMany({});
    console.log("Deleting all orders");
    await Order.deleteMany({});
    console.log("Deleting all goods");
    await Good.deleteMany({});
    console.log("Deleting all buyers");
    await Buyer.deleteMany({});
    console.log("Deleting all groups");
    await Group.deleteMany({});
    console.log("Deleting all users");
    await User.deleteMany({});
    // disconnect from the database
    console.log("Disconnecting from database");
    mongoose.disconnect().then(() => {
        console.log("Disconnected from database");
    });
}