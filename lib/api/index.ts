/** Shared API layer entry point. */

export { apiClient, http, setAuthFailureHandler } from "@/lib/api/client";
export { ApiError, messageFromData } from "@/lib/api/errors";
export { tokenStorage } from "@/lib/api/token-storage";
export { endpoints } from "@/lib/api/endpoints";
export { authApi } from "@/lib/api/auth";
export { usersApi } from "@/lib/api/users";
export { rolesApi } from "@/lib/api/roles";
export { permissionsApi } from "@/lib/api/permissions";
export * from "@/lib/api/mappers";
