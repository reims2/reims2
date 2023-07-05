export interface Role {
    id?: number;
    name: string;
}

export interface User {
    id?: number;
    roles: Array<Role>;
    username: string;
}
