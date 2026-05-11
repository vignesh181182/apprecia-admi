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
 * EngageX brand mark. Loaded from /client/public/images/engagex-logo.svg.
 * Use anywhere the brand identity appears (sign-in, super admin, onboarding wizard).
 */
export function EngageXLogo({ size = 32, className, title = "EngageX" }: Props) {
  return (
    <img
      src="/images/engagex-logo.svg"
      alt={title}
      width={size}
      height={Math.round((size * 426) / 383)}
      className={cn("object-contain shrink-0", className)}
      draggable={false}
    />
  );
}
