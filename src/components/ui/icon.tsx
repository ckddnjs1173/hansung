import type { ReactNode, SVGProps } from "react";
export type IconName = "alert"|"bell"|"building"|"calendar"|"chart"|"check"|"chevron"|"clock"|"document"|"folder"|"help"|"home"|"info"|"plus"|"receipt"|"search"|"settings"|"swap"|"users";
const paths: Record<IconName, ReactNode> = {
  home:<><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/></>,
  users:<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
  building:<><path d="M3 21h18M6 21V5l6-2v18M18 21V9l-6-2"/><path d="M9 9h.01M9 13h.01M9 17h.01M15 13h.01M15 17h.01"/></>,
  document:<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></>,
  calendar:<><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></>,
  swap:<><path d="M7 7h11l-3-3M17 17H6l3 3"/><path d="m18 7-3 3M6 17l3-3"/></>, receipt:<><path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2Z"/><path d="M9 7h6M9 11h6M9 15h3"/></>,
  folder:<path d="M3 5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Z"/>, chart:<><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
  settings:<><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.12-1.3l2-1.55-2-3.46-2.45 1a7 7 0 0 0-2.25-1.3L13.8 3h-4l-.38 2.4a7 7 0 0 0-2.25 1.3l-2.45-1-2 3.46 2 1.55A7 7 0 0 0 4.6 12c0 .44.04.87.12 1.3l-2 1.55 2 3.46 2.45-1a7 7 0 0 0 2.25 1.3l.38 2.4h4l.38-2.4a7 7 0 0 0 2.25-1.3l2.45 1 2-3.46-2-1.55c.08-.43.12-.86.12-1.3Z"/></>,
  search:<><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>, help:<><circle cx="12" cy="12" r="10"/><path d="M9.5 9a2.7 2.7 0 1 1 4.7 1.8c-1.2 1-2.2 1.4-2.2 3.2M12 18h.01"/></>,
  bell:<><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></>, chevron:<path d="m9 18 6-6-6-6"/>, plus:<path d="M12 5v14M5 12h14"/>,
  alert:<><path d="M10.3 3.6 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></>, info:<><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></>,
  clock:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>, check:<path d="m5 12 4 4L19 6"/>,
};
export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
