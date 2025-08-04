export const companyName = "Sunrise Layers";
export const appTitle = "Sunrise Layers inventory";
export const appDescription = "Sunrise Layers inventory management system";
export const companyRegion = "Lagos";
export const companyCountry = "Nigeria";
export const companyStreetAddress = "Adjacent azkol Oil, langbasa road, Ajah";
export const companyAddress = `${companyStreetAddress}, ${companyRegion}, ${companyCountry}`;
export const companyPhoneNumber = "+2349090060060";
export const companyEmail = "codenova02@gmail.com";
export const companyVatId = "123456789";

export type Permissions = {
  [key: string]: string[] | boolean;
};

export interface Group {
  name: string;
  description: string;
  permissions: Permissions;
}

export const permissions = [
  {
    scope: "user",
    actions: ["create", "read", "update", "delete"],
  },
  {
    scope: "customer",
    actions: ["create", "read", "update", "delete"],
  },
  {
    scope: "product",
    actions: ["create", "read", "update", "delete"],
  },
  {
    scope: "order",
    actions: ["create", "read", "update", "delete"],
  },
  {
    scope: "payment",
    actions: ["create", "read", "update", "delete"],
  },
  {
    scope: "permission",
    actions: ["read", "update"],
  },
  {
    scope: "log",
    actions: ["read"],
  },
];

export const groupPermissions: {
  [key: string]: Permissions;
} = {
  Admin: {
    user: true,
    customer: true,
    product: true,
    order: true,
    payment: true,
    permission: true,
    log: true,
  },
  Owner: {
    user: true,
    customer: true,
    product: true,
    order: true,
    payment: true,
    permission: true,
    log: true,
  },
  Mechanic: {
    user: false,
    customer: ["read"],
    product: ["read"],
    order: ["read"],
    payment: ["read"],
    permission: false,
    log: false,
  },
  Teller: {
    user: ["read"],
    customer: true,
    product: true,
    order: true,
    payment: true,
    permission: false,
    log: false,
  },
};

export const scopeDescriptions: {[key: string]: string} = {
  // user
  "user.create": "Register a new staff",
  "user.read": "View staff data and actions",
  "user.update": "Update staff details",
  "user.delete": "Deactivate a staff's account",
  // customer
  "customer.create": "Register a new customer",
  "customer.read": "View customer data and actions",
  "customer.update": "Update customer details",
  "customer.delete": "Remove a customer from the system",
  // product
  "product.create": "List a new product",
  "product.read": "View product details",
  "product.update": "Modify product details, restock, or change price",
  "product.delete": "Remove a product from the system",
  // order
  "order.create": "Create an order for a customer",
  "order.read": "View all orders, print invoices & receipts",
  "order.update": "Update order details",
  "order.delete": "Delete an invoice",
  // payment
  "payment.create": "Record a customer's payment",
  "payment.read": "View payment history of customers",
  "payment.update": "Update payment details",
  "payment.delete": "Delete a payment record",
  // permission
  "permission.read": "View all roles and permissions",
  "permission.update": "Modify a role's data and permissions",
  // log
  "log.read": "View system logs",
};

export const groups: Group[] = [
  {
    name: "Owner",
    description:
      "Owners use the CRM to monitor overall business performance, analyze trends in service demand, and identify opportunities for growth or improvement.",
    permissions: groupPermissions.Owner,
  },
  {
    name: "Admin",
    description:
      "The admin is responsible for overseeing and managing the entire CRM system.",
    permissions: groupPermissions.Admin,
  },
  {
    name: "Mechanic",
    description: "The mechanic is responsible for managing the workshop.",
    permissions: groupPermissions.Mechanic,
  },
  {
    name: "Teller",
    description:
      "The teller is responsible for processing payments, managing customer accounts, and generating invoices.",
    permissions: groupPermissions.Teller,
  },
];

// validate that all actions for a permission scope have descriptions
const missingDescriptions = permissions
  .map((permission) =>
    permission.actions.map((action) =>
      `${permission.scope}.${action}` in scopeDescriptions
        ? null
        : `${permission.scope}.${action}`
    )
  )
  .flat()
  .filter((x) => x !== null);

if (missingDescriptions.length > 0) {
  throw new Error(
    `Missing descriptions for the following permissions: ${missingDescriptions.join(
      ", "
    )}`
  );
}

// validate that all groups have every permission set
const missingPermissions = groups
  .map((group) =>
    permissions.map((permission) =>
      permission.scope in group.permissions
        ? null
        : `${group.name} is missing permission ${permission.scope}`
    )
  )
  .flat()
  .filter((x) => x !== null);

if (missingPermissions.length > 0) {
  throw new Error(
    `Missing permissions: \n- ${missingPermissions.join("\n- ")}`
  );
}
