import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"

/**
 * Toggle switch built on @base-ui/react, matching the construction pattern
 * already used by ui/button.tsx (data-slot + cn()-merged Tailwind classes
 * over a Base UI primitive, no separate Radix dependency). This is the one
 * new primitive this codebase needed — everywhere else (text/number inputs)
 * reuses the existing hand-rolled `<input>` + shared class-name convention
 * already established by components/doctors/doctor-form-dialog.tsx.
 */
function Switch({
  className,
  ...props
}: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent bg-muted transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:bg-primary",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-4 translate-x-0.5 rounded-full bg-background shadow-sm transition-transform data-[checked]:translate-x-[18px]"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
