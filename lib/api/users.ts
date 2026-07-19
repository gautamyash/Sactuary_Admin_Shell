import { http } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import {
  toPermission,
  toRole,
  toUser,
  toUserRole,
  type RawPermission,
  type RawRole,
  type RawUser,
  type RawUserRole,
} from "@/lib/api/mappers";
import type { Permission, Role, User, UserRole } from "@/types";

/** Input for POST /api/auth/users/ (admin-managed user creation). */
export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  roleId: number;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  isActive?: boolean;
}

/** Input for PATCH /api/auth/users/{id}/ (admin-managed edit). Every field is
 * optional — only what's provided is sent, mirroring the backend's
 * `AdminUpdateUserSerializer(partial=True)`. Email is deliberately absent:
 * it's read-only after creation, enforced server-side. */
export interface UpdateUserInput {
  name?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  isActive?: boolean;
  roleId?: number;
}

export const usersApi = {
  /** GET /api/auth/users/ — optionally scoped to search text and/or an RBAC
   * role name (e.g. `role: "Patient"`). The role filter joins through the
   * existing UserRole/Role relation server-side — it is not derived from
   * `is_staff`, which is Django's own admin-site flag and is false for every
   * role (staff and patients alike), so it can't be used to distinguish
   * them. */
  async list(search?: string, role?: string): Promise<User[]> {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (role) params.set("role", role);
    const qs = params.toString() ? `?${params.toString()}` : "";
    const data = await http.get<{ results: RawUser[] }>(`${endpoints.users.list}${qs}`);
    return data.results.map(toUser);
  },

  /** POST /api/auth/users/ — creates the account (reusing the existing auth
   * flow's password hashing) and assigns the selected role in one request,
   * gated server-side on "user.create". Same URL as list(), same pattern as
   * doctorsApi.create() posting to its own list endpoint.
   *
   * `profileMessages` (Phase: Automatic Staff Profile Linking) surfaces
   * StaffProfileProvisioningService's result — e.g. "Doctor profile
   * created" — when the assigned role has a linked hospital profile.
   * Empty for roles with no linked profile concept (Patient, Accountant,
   * Owner, Admin) or ones not yet implemented (Receptionist, Nurse,
   * Pharmacist, Lab Technician). */
  async create(
    input: CreateUserInput,
  ): Promise<{ user: User; role: Role | null; profileMessages: string[] }> {
    const body: Record<string, unknown> = {
      name: input.name,
      email: input.email,
      password: input.password,
      role: input.roleId,
      phone: input.phone ?? "",
      gender: input.gender ?? "",
      is_active: input.isActive ?? true,
    };
    if (input.dateOfBirth) body.date_of_birth = input.dateOfBirth;

    const data = await http.post<{
      user: RawUser;
      role: RawRole | null;
      profile_messages?: string[];
    }>(endpoints.users.list, body);
    return {
      user: toUser(data.user),
      role: data.role ? toRole(data.role) : null,
      profileMessages: data.profile_messages ?? [],
    };
  },

  async get(
    id: number,
  ): Promise<{ user: User; role: Role | null; permissions: Permission[] }> {
    const data = await http.get<{
      user: RawUser;
      role: RawRole | null;
      permissions: RawPermission[];
    }>(endpoints.users.detail(id));
    return {
      user: toUser(data.user),
      role: data.role ? toRole(data.role) : null,
      permissions: (data.permissions ?? []).map(toPermission),
    };
  },

  async assignRole(userId: number, roleId: number): Promise<UserRole> {
    const data = await http.post<RawUserRole>(endpoints.users.role(userId), {
      role: roleId,
    });
    return toUserRole(data);
  },

  /** PATCH /api/auth/users/{id}/ — admin-managed edit (name/phone/gender/
   * is_active/role), gated server-side on "user.edit". Also the single path
   * used to activate/deactivate an account — no separate endpoint exists or
   * is needed for that. */
  async update(
    userId: number,
    input: UpdateUserInput,
  ): Promise<{ user: User; role: Role | null }> {
    const body: Record<string, unknown> = {};
    if (input.name !== undefined) body.name = input.name;
    if (input.phone !== undefined) body.phone = input.phone;
    if (input.gender !== undefined) body.gender = input.gender;
    if (input.dateOfBirth !== undefined) body.date_of_birth = input.dateOfBirth;
    if (input.isActive !== undefined) body.is_active = input.isActive;
    if (input.roleId !== undefined) body.role = input.roleId;

    const data = await http.patch<{ user: RawUser; role: RawRole | null }>(
      endpoints.users.detail(userId),
      body,
    );
    return { user: toUser(data.user), role: data.role ? toRole(data.role) : null };
  },

  /** POST /api/auth/users/{id}/reset-password/ — admin-managed password
   * reset, gated server-side on "user.edit". Reuses Django's password
   * validation and the same hashing path as every other password write. */
  async resetPassword(userId: number, newPassword: string): Promise<void> {
    await http.post<{ detail: string }>(endpoints.users.resetPassword(userId), {
      new_password: newPassword,
    });
  },
};
