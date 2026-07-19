"use client";

import { X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { useCreateDoctor, useSpecialtyOptions, useUpdateDoctor } from "@/components/doctors/queries";
import { Spinner } from "@/components/common/spinner";
import { Button } from "@/components/ui/button";
import type { Doctor, DoctorInput } from "@/lib/api/doctors";
import { ApiError } from "@/lib/api/errors";

interface FormState {
  name: string;
  specialtyId: string;
  hospital: string;
  address: string;
  wing: string;
  floor: string;
  room: string;
  yearsExperience: string;
  fee: string;
  photo: string;
  about: string;
  onDuty: boolean;
  onLeave: boolean;
}

function emptyForm(): FormState {
  return {
    name: "",
    specialtyId: "",
    hospital: "",
    address: "",
    wing: "",
    floor: "",
    room: "",
    yearsExperience: "",
    fee: "",
    photo: "",
    about: "",
    onDuty: false,
    onLeave: false,
  };
}

function fromDoctor(doctor: Doctor, specialtyId: string): FormState {
  return {
    name: doctor.name,
    specialtyId,
    hospital: doctor.hospital,
    address: doctor.address,
    wing: doctor.wing,
    floor: doctor.floor,
    room: doctor.room,
    yearsExperience: String(doctor.yearsExperience || ""),
    fee: String(doctor.fee || ""),
    photo: doctor.photo ?? "",
    about: doctor.about,
    onDuty: doctor.onDuty,
    onLeave: doctor.onLeave,
  };
}

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-ring";
const labelClass = "text-sm font-medium text-foreground";

/**
 * Onboard / edit dialog. Shares one form for both flows since the fields are
 * identical — the only difference is which mutation fires on submit.
 */
export function DoctorFormDialog({
  doctor,
  open,
  onOpenChange,
}: {
  /** null = onboarding a new doctor; set = editing this doctor. */
  doctor: Doctor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const specialties = useSpecialtyOptions();
  const createDoctor = useCreateDoctor();
  const updateDoctor = useUpdateDoctor();
  const [form, setForm] = useState<FormState>(emptyForm());
  const [error, setError] = useState<string | null>(null);

  const isEdit = doctor != null;
  const pending = createDoctor.isPending || updateDoctor.isPending;

  const resetDeps = [open, doctor, specialties.data];
  const [prevResetDeps, setPrevResetDeps] = useState(resetDeps);
  if (resetDeps[0] && resetDeps.some((v, i) => !Object.is(v, prevResetDeps[i]))) {
    setPrevResetDeps(resetDeps);
    setError(null);
    if (doctor) {
      const match = specialties.data?.find((s) => s.name === doctor.specialty);
      setForm(fromDoctor(doctor, match ? String(match.id) : ""));
    } else {
      setForm(emptyForm());
    }
  }

  if (!open) return null;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.specialtyId || !form.hospital.trim()) {
      setError("Name, specialty, and hospital are required.");
      return;
    }
    const input: DoctorInput = {
      name: form.name.trim(),
      specialtyId: Number(form.specialtyId),
      hospital: form.hospital.trim(),
      address: form.address.trim(),
      wing: form.wing.trim(),
      floor: form.floor.trim(),
      room: form.room.trim(),
      yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : 0,
      fee: form.fee ? Number(form.fee) : 0,
      photo: form.photo.trim(),
      about: form.about.trim(),
      onDuty: form.onDuty,
      onLeave: form.onLeave,
    };
    try {
      if (isEdit && doctor) {
        await updateDoctor.mutateAsync({ id: doctor.id, input });
        toast.success(`${input.name} updated.`);
      } else {
        await createDoctor.mutateAsync(input);
        toast.success(`${input.name} onboarded.`);
      }
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save this doctor.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-foreground/40" onClick={() => onOpenChange(false)} />
      <div className="relative flex max-h-full w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-muted"
        >
          <X className="size-4" />
        </button>

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="space-y-5 overflow-y-auto p-6 pr-8">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {isEdit ? "Edit Doctor" : "Onboard New Doctor"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isEdit
                  ? "Update this doctor's profile, status, and location."
                  : "Add a new doctor to the directory."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <label className={labelClass}>Full name</label>
                <input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  required
                  className={inputClass}
                  placeholder="Dr. Jane Doe"
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Specialty</label>
                <select
                  value={form.specialtyId}
                  onChange={(e) => set("specialtyId", e.target.value)}
                  required
                  disabled={specialties.isLoading}
                  className={inputClass}
                >
                  <option value="" disabled>
                    {specialties.isLoading ? "Loading…" : "Select a specialty"}
                  </option>
                  {specialties.data?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Hospital</label>
                <input
                  value={form.hospital}
                  onChange={(e) => set("hospital", e.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <label className={labelClass}>Address</label>
                <input
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Floor</label>
                <input
                  value={form.floor}
                  onChange={(e) => set("floor", e.target.value)}
                  className={inputClass}
                  placeholder="4"
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Wing</label>
                <input
                  value={form.wing}
                  onChange={(e) => set("wing", e.target.value)}
                  className={inputClass}
                  placeholder="B"
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Room</label>
                <input
                  value={form.room}
                  onChange={(e) => set("room", e.target.value)}
                  className={inputClass}
                  placeholder="12"
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Years experience</label>
                <input
                  type="number"
                  min={0}
                  value={form.yearsExperience}
                  onChange={(e) => set("yearsExperience", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Consultation fee</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.fee}
                  onChange={(e) => set("fee", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <label className={labelClass}>Photo URL</label>
                <input
                  value={form.photo}
                  onChange={(e) => set("photo", e.target.value)}
                  className={inputClass}
                  placeholder="https://…"
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <label className={labelClass}>About</label>
                <textarea
                  value={form.about}
                  onChange={(e) => set("about", e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-ring"
                />
              </div>

              <label className="col-span-2 flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={form.onDuty}
                  onChange={(e) => set("onDuty", e.target.checked)}
                  className="size-4 rounded border-border"
                />
                On duty right now
              </label>
              <label className="col-span-2 flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={form.onLeave}
                  onChange={(e) => set("onLeave", e.target.checked)}
                  className="size-4 rounded border-border"
                />
                Currently on leave
              </label>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="flex justify-end gap-2 border-t border-border p-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Spinner className="text-primary-foreground" />}
              {isEdit ? "Save changes" : "Onboard doctor"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
