export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export const RoleLabels: Record<Role, string> = {
  [Role.USER]: 'Customer',
  [Role.ADMIN]: 'Admin',
};