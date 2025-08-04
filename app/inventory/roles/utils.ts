"use client";
import { permissions, scopeDescriptions } from "@/data";

export interface ScopeItem {
  action: string;
  label: string;
  description: string;
  checked: boolean;
}

export interface UpdateResponse {
  message: string;
}

export interface Scopes {
  [category: string]: {
    allChecked: boolean;
    items: ScopeItem[];
  };
}

export const initialScopes: Scopes = Object.fromEntries(
  permissions.map(({ scope, actions }) => [
    scope,
    {
      allChecked: false,
      items: actions.map((action) => ({
        action,
        label: action.charAt(0).toUpperCase() + action.slice(1),
        description: scopeDescriptions[`${scope}.${action}`],
        checked: false,
      })),
    },
  ])
);

export const populateScopes = (permissions: Record<string, boolean | string[]>) => {
  const newScopes = { ...initialScopes };
  Object.entries(permissions).forEach(([category, value]) => {
    if (typeof value === "boolean" && value) {
      newScopes[category] = {
        allChecked: true,
        items: newScopes[category].items.map((item) => ({
          ...item,
          checked: true,
        })),
      };
    } else if (Array.isArray(value)) {
      newScopes[category] = {
        allChecked: false,
        items: newScopes[category].items.map((item) => ({
          ...item,
          checked: value.includes(item.action),
        })),
      };
    }
  });
  return newScopes;
};
