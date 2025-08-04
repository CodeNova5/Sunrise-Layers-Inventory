import User from "../common/models/user";
import { faker } from "@faker-js/faker";
import UserDAO from "../common/dao/user";
import Group from "../common/models/group";
import GroupDAO from "../common/dao/group";

export default async function populateUsers(number: number) {
  const users = [];
  const allGroups = await Group.find().exec()

  for (let i = 0; i < number; i++) {
    const email = faker.internet.email();
    const user = await UserDAO.addUser({
      email,
      password: email,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      phone: "080" + faker.string.numeric(8),
    });
    users.push(user);
    const group = allGroups[Math.floor(Math.random() * allGroups.length)];
    await GroupDAO.addMember(group._id, user.id);
  }
  return users;
}
