import type { ReactNode } from "react";

export type NavIconRenderer = () => ReactNode;

export type NavItem = {
  href: string;
  label: string;
  renderIcon: NavIconRenderer;
};

export type AccountItem = {
  href: string;
  label: string;
  renderIcon: () => ReactNode;
};

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6">
      <path d="M3 11.5 12 4l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function AgentsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6">
      {/* Head */}
      <circle
        cx="12"
        cy="10"
        r="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      {/* Headset band */}
      <path
        d="M4.5 10a7.5 7.5 0 0 1 15 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      {/* Ear pads */}
      <rect
        x="4.5"
        y="10"
        width="2.5"
        height="3.5"
        rx="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <rect
        x="17"
        y="10"
        width="2.5"
        height="3.5"
        rx="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      {/* Mic */}
      <path
        d="M14.5 13h2.5a1 1 0 0 1 1 1v1.2a1.3 1.3 0 0 1-1.3 1.3H15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Shoulders */}
      <path
        d="M6 19a6 3 0 0 1 12 0v1H6v-1Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LeadsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6">
      {/* Magnet outer */}
      <path
        d="M3.5 4.5v9a8.5 8.5 0 0 0 17 0v-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Magnet inner */}
      <path
        d="M6 4.5v9a6 6 0 0 0 12 0v-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Magnet caps */}
      <path
        d="M3.5 4.5h3.5M17 4.5h3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      {/* Head */}
      <circle
        cx="12"
        cy="10"
        r="2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      {/* Shoulders */}
      <path
        d="M8.5 15.8a3.5 3.5 0 0 1 7 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      {/* Headset */}
      <path
        d="M9.5 9.5a3 3 0 0 1 5 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CallsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6">
      {/* Receiver — traced contour */}
      <path
        d="M6.1 2.9
           C5 3.6 4.2 5.5 4.2 8.3
           c0 5 3.2 9.4 8.1 11.9
           c1.1.6 2.4.4 3.2-.6
           l1.2-1.2
           c.6-.6.7-1.6.3-2.3
           l-1.3-2
           c-.4-.7-1.3-1-2-.7
           l-1.6.7
           c-1.8-1-3.5-2.7-4.5-4.5
           l.7-1.6
           c.3-.7 0-1.6-.7-2
           L7.7 3.2
           c-.7-.4-1.6-.3-2.3.3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />

      {/* Inner receiver cut (traced) */}
      <path
        d="M7.6 7.4
           c-.5 1.1-.2 2.8 1.3 4.3
           c1.5 1.5 3.2 1.8 4.3 1.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />

      {/* Right bars — exact layout */}
      <path
        d="M14.8 6h5.2
           M14.8 9.6h5.2
           M14.8 13.2h5.2
           M14.8 16.8h5.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6">
      <path d="M4 20h16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M7 18V7h3v11M14 18v-7h3v7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5 20a7 7 0 0 1 14 0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function PreferencesIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]">
      <path d="M12 3v3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12 18v3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M3 12h3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M18 12h3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function SubscriptionIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]">
      <path d="M4 7.5h16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <rect x="4" y="5" width="16" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 15h3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/home", label: "Home", renderIcon: HomeIcon },
  { href: "/agents", label: "Agents", renderIcon: AgentsIcon },
  { href: "/leads", label: "Leads", renderIcon: LeadsIcon },
  { href: "/calls", label: "Calls", renderIcon: CallsIcon },
  { href: "/analytics", label: "Analytics", renderIcon: AnalyticsIcon },
];

export const ACCOUNT_ITEMS: AccountItem[] = [
  {href: "/profile", label: "Profile", renderIcon: ProfileIcon,},
  {href: "/preferences", label: "Preferences", renderIcon: PreferencesIcon, },
  {href: "/subscription", label: "Subscription", renderIcon: SubscriptionIcon, },
];