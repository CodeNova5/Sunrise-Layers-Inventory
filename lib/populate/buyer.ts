import { faker } from "@faker-js/faker";
import Buyer from "../inventory/models/buyer";


export default async function populateBuyers(number: number) {
    const buyers = [];
    for (let i = 0; i < number; i++) {
        const buyer = new Buyer({
            name: faker.person.fullName(),
            email: faker.internet.email(),
            phone: "+23480" + faker.string.numeric(8),
        });
        await buyer.save();
        buyers.push(buyer);
    }
    return buyers;
}