import type { InviteOrAssignRoleDto } from '@repo/api/generated/types';

export type Role = 'OWNER' | 'ADMIN' | 'CHEF' | 'CASHIER' | 'SERVER';

export type UserStatus = 'active' | 'suspended' | 'pending';

export interface StaffMember {
  id: string;
  email: string;
  name?: string;
  role: Role;
  status: UserStatus;
  joinedAt?: Date;
  suspendedAt?: Date;
  suspensionReason?: string;
}

export interface StaffFilters {
  role?: Role | '';
  status?: UserStatus | '';
  search?: string;
}

export interface InviteStaffFormValues {
  email: string;
  role: Role;
}

export interface ChangeRoleFormValues {
  role: Role;
}

export interface SuspendUserFormValues {
  reason: string;
}

export { InviteOrAssignRoleDto };
