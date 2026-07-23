import { cn } from "@/lib/utils";

type Props = {
  /** Width (and proportional height) of the logo. Defaults to 32px. */
  size?: number;
  /** Optional extra classes for the wrapper. */
  className?: string;
  /** Title for screen readers. */
  title?: string;
};

/**
 * Hip Hip Hoor brand mark. Loaded from /client/public/images/hhh-logo.png.
 * Use anywhere the brand identity appears (sign-in, super admin, onboarding wizard).
 * Export name kept as `EngageXLogo` for backwards compatibility with existing imports.
 */
export function EngageXLogo({ size = 32, className, title = "Hip Hip Hoor" }: Props) {
  return (
    <img
      src="/images/hhh-logo.png"
      alt={title}
      width={size}
      height={Math.round((size * 40) / 43)}
      className={cn("object-contain shrink-0", className)}
      draggable={false}
    />
  );
}
