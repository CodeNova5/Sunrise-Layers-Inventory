import mongoose from "mongoose";
import populateGroups from "@/lib/populate/group";
import populateUsers from "@/lib/populate/user";
import populateBuyers from "@/lib/populate/buyer";
import populateGoods from "@/lib/populate/good";
import populateOrderItems from "@/lib/populate/orderItem";
import populateOrders from "@/lib/populate/order";
import populateOrderPayments from "@/lib/populate/orderPayment";

export default async function setUp() {
  // connect to the database
  console.log("Connecting to database:", process.env.MONGODB_URI!);
  mongoose.connect(process.env.MONGODB_URI!).then((db) => {
    console.log("Connected to database:", db.connection.name);
  });
  console.log("Populating groups");
  await populateGroups();
  console.log("Populating users");
  await populateUsers(10);
  console.log("Populating buyers");
  await populateBuyers(20);
  console.log("Populating goods");
  await populateGoods();
  console.log("Populating orders");
  await populateOrders(10);
  console.log("Populating order items");
  await populateOrderItems(50);
  console.log("Populating order payments");
  await populateOrderPayments(10, 2);
}
