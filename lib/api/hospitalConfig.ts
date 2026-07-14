/**
 * Hospital Configuration API (Django `hospital_config` app).
 *
 * Talks to the RBAC-gated admin endpoints only — never the public
 * /api/config/hospital/, /api/config/features/, or /api/config/bootstrap/
 * endpoints, which are for unauthenticated mobile-app startup and are not
 * relevant to the admin panel. No backend endpoints are added here; this
 * file only speaks the existing contract:
 *
 *   GET/PATCH /api/config/admin/hospital/
 *   GET/POST  /api/config/admin/features/
 *   PATCH     /api/config/admin/features/{key}/
 */

import { http } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

/* ---------------------------------------------------------------- Hospital Profile --- */

export interface HospitalProfile {
  name: string;
  shortName: string;
  logo: string | null;
  email: string;
  phone: string;
  address: string;
  website: string;
  gstNumber: string;
  registrationNumber: string;
  timezone: string;
  currency: string;
  primaryColor: string;
  secondaryColor: string;
  updatedAt: string;
}

interface RawHospitalProfile {
  name: string;
  short_name: string;
  logo: string | null;
  email: string;
  phone: string;
  address: string;
  website: string;
  gst_number: string;
  registration_number: string;
  timezone: string;
  currency: string;
  primary_color: string;
  secondary_color: string;
  updated_at: string;
}

function toHospitalProfile(r: RawHospitalProfile): HospitalProfile {
  return {
    name: r.name,
    shortName: r.short_name,
    logo: r.logo,
    email: r.email,
    phone: r.phone,
    address: r.address,
    website: r.website,
    gstNumber: r.gst_number,
    registrationNumber: r.registration_number,
    timezone: r.timezone,
    currency: r.currency,
    primaryColor: r.primary_color,
    secondaryColor: r.secondary_color,
    updatedAt: r.updated_at,
  };
}

/** Partial update payload — every field optional so each Settings section can
 * PATCH only the fields it owns without clobbering the others. */
export interface HospitalProfileInput {
  name?: string;
  shortName?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  gstNumber?: string;
  registrationNumber?: string;
  timezone?: string;
  currency?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

function toRawInput(input: HospitalProfileInput): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body.name = input.name;
  if (input.shortName !== undefined) body.short_name = input.shortName;
  if (input.email !== undefined) body.email = input.email;
  if (input.phone !== undefined) body.phone = input.phone;
  if (input.address !== undefined) body.address = input.address;
  if (input.website !== undefined) body.website = input.website;
  if (input.gstNumber !== undefined) body.gst_number = input.gstNumber;
  if (input.registrationNumber !== undefined) body.registration_number = input.registrationNumber;
  if (input.timezone !== undefined) body.timezone = input.timezone;
  if (input.currency !== undefined) body.currency = input.currency;
  if (input.primaryColor !== undefined) body.primary_color = input.primaryColor;
  if (input.secondaryColor !== undefined) body.secondary_color = input.secondaryColor;
  return body;
}

export const hospitalProfileApi = {
  async get(): Promise<HospitalProfile> {
    const data = await http.get<RawHospitalProfile>(endpoints.config.hospitalAdmin);
    return toHospitalProfile(data);
  },

  /** Plain JSON PATCH — used by sections that never touch the logo file. */
  async update(input: HospitalProfileInput): Promise<HospitalProfile> {
    const data = await http.patch<RawHospitalProfile>(endpoints.config.hospitalAdmin, toRawInput(input));
    return toHospitalProfile(data);
  },

  /** Multipart PATCH — used by Branding when a new logo file is attached.
   * The Django view has no explicit parser_classes restriction, so DRF's
   * default parsers (which include MultiPartParser) already accept this;
   * no backend change is needed. Non-file fields are sent alongside the
   * file in the same FormData so color changes and a logo swap can be
   * saved together in one request. */
  async updateWithLogo(input: HospitalProfileInput, file: File): Promise<HospitalProfile> {
    const form = new FormData();
    for (const [key, value] of Object.entries(toRawInput(input))) {
      form.append(key, String(value));
    }
    form.append("logo", file);
    const data = await http.patch<RawHospitalProfile>(endpoints.config.hospitalAdmin, form);
    return toHospitalProfile(data);
  },
};

/* ------------------------------------------------------- Configuration Values --- */

export type ConfigurationValueType = "boolean" | "string" | "integer" | "json";

export type ConfigurationValueData = boolean | string | number | Record<string, unknown> | unknown[] | null;

export interface ConfigurationValue {
  id: number;
  key: string;
  value: ConfigurationValueData;
  valueType: ConfigurationValueType;
  label: string;
  description: string;
  category: string;
  displayOrder: number;
  updatedAt: string;
}

interface RawConfigurationValue {
  id: number;
  key: string;
  value: ConfigurationValueData;
  value_type: ConfigurationValueType;
  label: string;
  description: string;
  category: string;
  display_order: number;
  updated_at: string;
}

function toConfigurationValue(r: RawConfigurationValue): ConfigurationValue {
  return {
    id: r.id,
    key: r.key,
    value: r.value,
    valueType: r.value_type,
    label: r.label,
    description: r.description,
    category: r.category,
    displayOrder: r.display_order,
    updatedAt: r.updated_at,
  };
}

export interface ConfigurationValueInput {
  key: string;
  value: ConfigurationValueData;
  valueType: ConfigurationValueType;
  label?: string;
  description?: string;
  category?: string;
  displayOrder?: number;
}

function toRawCreateInput(input: ConfigurationValueInput) {
  return {
    key: input.key,
    value: input.value,
    value_type: input.valueType,
    label: input.label ?? "",
    description: input.description ?? "",
    category: input.category ?? "",
    display_order: input.displayOrder ?? 0,
  };
}

export interface ConfigurationValueUpdateInput {
  value?: ConfigurationValueData;
  valueType?: ConfigurationValueType;
  label?: string;
  description?: string;
  category?: string;
  displayOrder?: number;
}

function toRawUpdateInput(input: ConfigurationValueUpdateInput): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (input.value !== undefined) body.value = input.value;
  if (input.valueType !== undefined) body.value_type = input.valueType;
  if (input.label !== undefined) body.label = input.label;
  if (input.description !== undefined) body.description = input.description;
  if (input.category !== undefined) body.category = input.category;
  if (input.displayOrder !== undefined) body.display_order = input.displayOrder;
  return body;
}

interface RawPage<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const configurationValuesApi = {
  /** Follows DRF pagination to return the *complete* catalog. The admin UI
   * must be able to edit every configuration key, not just the first
   * page — and the backend paginates at 20 per page by default. `next` is
   * a full URL; axios ignores its own baseURL when given an absolute one,
   * so passing it straight to `http.get` works for both relative and
   * absolute values. */
  async list(): Promise<ConfigurationValue[]> {
    const all: RawConfigurationValue[] = [];
    let url: string | null = endpoints.config.featuresAdminList;
    while (url) {
      const page: RawPage<RawConfigurationValue> = await http.get<RawPage<RawConfigurationValue>>(url);
      all.push(...page.results);
      url = page.next;
    }
    return all.map(toConfigurationValue);
  },

  async create(input: ConfigurationValueInput): Promise<ConfigurationValue> {
    const data = await http.post<RawConfigurationValue>(
      endpoints.config.featuresAdminList,
      toRawCreateInput(input),
    );
    return toConfigurationValue(data);
  },

  async update(key: string, input: ConfigurationValueUpdateInput): Promise<ConfigurationValue> {
    const data = await http.patch<RawConfigurationValue>(
      endpoints.config.featureAdminDetail(key),
      toRawUpdateInput(input),
    );
    return toConfigurationValue(data);
  },
};
