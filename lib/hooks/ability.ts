import { User } from "../@types/user";
import { defineAbilityFor } from "../permissions/ability";
import { useAuthStore } from "../providers/auth-store-provider";

export function useAbility() {
  const user = useAuthStore((s) => s);
  const ability = defineAbilityFor(user as User);
  return ability;
}
