import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

/**
 * The site's own button, from the Figma button system (docs/BUTTONS.md).
 * Styles live in app/globals.css (.btn, .btn-primary, .btn-sm ...).
 * Library demos never use it: they keep their own looks.
 *
 *   <Button href="/docs" size="lg" trailing={<Arrow />}>Browse components</Button>
 *   <Button hierarchy="secondary" iconOnly aria-label="Close"><Cancel01Icon /></Button>
 */
export type ButtonHierarchy = "primary" | "secondary" | "tertiary" | "link" | "link-gray";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

type Own = {
  hierarchy?: ButtonHierarchy;
  size?: ButtonSize;
  /** Icon before the label. Replaced by the spinner while loading. */
  leading?: ReactNode;
  /** Icon after the label. Hidden while loading. */
  trailing?: ReactNode;
  /** Square button holding one icon (children). Needs an aria-label. Not for links. */
  iconOnly?: boolean;
  loading?: boolean;
  /** Label shown while loading. */
  loadingText?: ReactNode;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
};

type AsButton = Own & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof Own> & { href?: undefined };
type AsLink = Own & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof Own> & { href: string };

export function buttonClass({
  hierarchy = "primary",
  size = "md",
  iconOnly = false,
  className,
}: Pick<Own, "hierarchy" | "size" | "iconOnly" | "className"> = {}) {
  const link = hierarchy === "link" || hierarchy === "link-gray";
  return ["btn", `btn-${hierarchy}`, `btn-${size}`, iconOnly && !link && "btn-icon", className]
    .filter(Boolean)
    .join(" ");
}

export function Button(props: AsButton | AsLink) {
  const {
    hierarchy = "primary",
    size = "md",
    leading,
    trailing,
    iconOnly = false,
    loading = false,
    loadingText = "Impeccabling...",
    disabled = false,
    className,
    children,
    ...rest
  } = props;

  const cls = buttonClass({ hierarchy, size, iconOnly, className });
  const spinner = <span className="btn-spinner" aria-hidden="true" />;
  const inner = iconOnly ? (
    loading ? spinner : children
  ) : (
    <>
      {loading ? spinner : leading}
      <span className="btn-label">{loading ? loadingText : children}</span>
      {!loading && trailing}
    </>
  );
  const state = {
    "data-loading": loading ? "" : undefined,
    "aria-busy": loading || undefined,
  };

  if (typeof rest.href === "string") {
    const { href, ...a } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
    const off = disabled || loading;
    const external = /^(https?:)?\/\//.test(href) || href.startsWith("mailto:");
    const shared = {
      ...a,
      ...state,
      className: cls,
      "aria-disabled": off || undefined,
      tabIndex: off ? -1 : a.tabIndex,
    };
    if (off) return <a {...shared}>{inner}</a>;
    if (external || a.download !== undefined) {
      return (
        <a
          {...shared}
          href={href}
          target={a.target ?? (external ? "_blank" : undefined)}
          rel={a.rel ?? (external ? "noopener noreferrer" : undefined)}
        >
          {inner}
        </a>
      );
    }
    return (
      <Link {...shared} href={href}>
        {inner}
      </Link>
    );
  }

  const b = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button {...b} {...state} type={b.type ?? "button"} disabled={disabled || loading} className={cls}>
      {inner}
    </button>
  );
}
