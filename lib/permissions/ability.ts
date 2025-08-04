// caslAbility.ts
import {
  AbilityBuilder,
  createMongoAbility,
  MongoAbility,
} from "@casl/ability";
import { User } from "../@types/user";

export type Actions = "create" | "read" | "update" | "delete" | "manage";
export type Subjects =
  | "user"
  | "customer"
  | "product"
  | "order"
  | "payment"
  | "permission"
  | "log"
  | "dashboard"
  | "all";

export type Ability = MongoAbility<[Actions, Subjects]>;
export const ability = createMongoAbility<[Actions, Subjects]>();

export function defineAbilityFor(user: User): Ability {
  const { can, cannot, build } = new AbilityBuilder<Ability>(
    createMongoAbility
  );

  if (user.status === "banned") {
    cannot(["create", "read", "update", "delete"], "all");
  }

can("read", "dashboard");
can(["read"], ["product", "order", "payment", "permission", "log", "customer", "user"]);

  // Convert existing permissions to CASL format
  Object.entries(user.permissions).forEach(([subject, actions]) => {
    if (actions === true) {
      can(["create", "read", "update", "delete"], subject as Subjects);
    } else if (Array.isArray(actions)) {
      can(actions as Actions[], subject as Subjects);
    }
  });

  user.groups.forEach((group) => {
    Object.entries(group.permissions).forEach(([subject, actions]) => {
      if (actions === true) {
        can(["create", "read", "update", "delete"], subject as Subjects);
      } else if (Array.isArray(actions)) {
        can(actions as Actions[], subject as Subjects);
      }
    });
  });

  return build();
}
