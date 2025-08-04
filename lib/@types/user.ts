export interface Group {
    id: string;
    name: string;
    permissions: {
        [key: string]: string[] | boolean;
    };
}

export interface User {
    id: string;
    email?: string;
    firstName: string;
    lastName: string;
    phone?: string;
    status?: 'active' | 'banned';
    permissions: {
        [key: string]: string[] | boolean;
    };
    groups: Group[];
}

export interface AnonymousUser {
    id: null;
    email: null;
    firstName: null;
    lastName: null;
    phone: null;
    permissions: {
        [key: string]: string[] | boolean;
    };
    groups: Group[];
}

export interface UpdateUser {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}