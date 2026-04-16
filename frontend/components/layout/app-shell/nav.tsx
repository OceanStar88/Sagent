import type { ReactNode } from "react";

export type NavIconRenderer = (filled: boolean) => ReactNode;

export type NavItem = {
  href: string;
  label: string;
  renderIcon: NavIconRenderer;
};

export type AccountItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

function HomeIcon(filled: boolean) {
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 fill-current">
        <path d="M12 3.6 2.8 11.1c-.34.27-.53.68-.53 1.11v8.04c0 .83.67 1.5 1.5 1.5h5.73a1.5 1.5 0 0 0 1.5-1.5v-4.44h2v4.44a1.5 1.5 0 0 0 1.5 1.5h5.73c.83 0 1.5-.67 1.5-1.5v-8.04c0-.43-.2-.84-.53-1.11L12 3.6Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6">
      <path d="M3 11.5 12 4l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function AgentsIcon(filled: boolean) {
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 fill-current">
        <path d="M8.32 2.65h2.48c.82 0 1.52.6 1.64 1.42l.4 2.8c.11.73-.29 1.44-.97 1.77l-1.28.61a12.72 12.72 0 0 0 4.16 4.16l.61-1.28c.33-.68 1.04-1.08 1.77-.97l2.8.4c.82.12 1.42.82 1.42 1.64v2.48c0 .92-.72 1.68-1.63 1.74A16.99 16.99 0 0 1 6.58 4.28c.06-.91.82-1.63 1.74-1.63Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6">
      <path d="M7.7 3.8h2.8a1 1 0 0 1 1 .85l.45 3.15a1 1 0 0 1-.57 1.03l-1.67.8a14.2 14.2 0 0 0 4.68 4.68l.8-1.67a1 1 0 0 1 1.03-.57l3.15.45a1 1 0 0 1 .85 1v2.8a1 1 0 0 1-.93 1A16.5 16.5 0 0 1 6.7 4.73a1 1 0 0 1 1-.93Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function LeadsIcon(filled: boolean) {
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 fill-current">
        <path d="M12 2.75a9.25 9.25 0 1 0 8.56 12.77 1 1 0 1 0-1.85-.76A7.25 7.25 0 1 1 17.18 7H14.5a1 1 0 1 0 0 2H21V2.5a1 1 0 1 0-2 0v2.65A9.2 9.2 0 0 0 12 2.75Zm-.75 4.5a1 1 0 0 1 2 0v4.16l2.55 1.7a1 1 0 0 1-1.1 1.66l-3-2A1 1 0 0 1 11.25 12V7.25Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6">
      <path d="M12 7v5l3 2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M20 12a8 8 0 1 1-2.34-5.66" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M20 4v5h-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CallsIcon(filled: boolean) {
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 fill-current">
        <path d="M10.9 2.7a1 1 0 0 1 1.97 0l.36 2.15c.42.13.83.3 1.22.5l1.9-1.07a1 1 0 0 1 1.34.37l1.46 2.53a1 1 0 0 1-.25 1.28l-1.56 1.43c.03.27.05.54.05.81 0 .27-.02.54-.05.81l1.56 1.43a1 1 0 0 1 .25 1.28l-1.46 2.53a1 1 0 0 1-1.34.37l-1.9-1.07c-.39.2-.8.37-1.22.5l-.36 2.15a1 1 0 0 1-1.97 0l-.36-2.15a7.06 7.06 0 0 1-1.22-.5l-1.9 1.07a1 1 0 0 1-1.34-.37l-1.46-2.53a1 1 0 0 1 .25-1.28l1.56-1.43A6.81 6.81 0 0 1 6.75 12c0-.27.02-.54.05-.81L5.24 9.76a1 1 0 0 1-.25-1.28l1.46-2.53a1 1 0 0 1 1.34-.37l1.9 1.07c.39-.2.8-.37 1.22-.5l.36-2.15ZM11.9 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6">
      <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 1 0 12 8.5z" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="m19.4 15 .1-.21 1.43-2.47-1.87-3.24-2.83.1a6.93 6.93 0 0 0-1.12-.65L13.95 5h-3.9L8.9 8.53c-.4.16-.77.38-1.12.65l-2.82-.1-1.88 3.24 1.44 2.47.1.21-1.54 2.62L4.96 21l2.82-.11c.35.28.72.5 1.12.66L10.05 25h3.9l1.16-3.45c.4-.16.77-.38 1.12-.66l2.82.1 1.88-3.23z" transform="translate(0 -3)" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function AnalyticsIcon(filled: boolean) {
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 fill-current">
        <path d="M4 20h16a1 1 0 1 0 0-2h-1.5v-8.2a1 1 0 0 0-1-1h-2.7a1 1 0 0 0-1 1V18h-2.6V6.9a1 1 0 0 0-1-1H7.5a1 1 0 0 0-1 1V18H4a1 1 0 1 0 0 2Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6">
      <path d="M4 20h16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M7 18V7h3v11M14 18v-7h3v7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
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
  {
    href: "/profile",
    label: "Profile",
    icon: (
      <svg viewBox="0 0 24 24" className="size-[18px]">
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path d="M5 20a7 7 0 0 1 14 0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/preferences",
    label: "Preferences",
    icon: (
      <svg viewBox="0 0 24 24" className="size-[18px]">
        <path d="M12 3v3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M12 18v3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M3 12h3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M18 12h3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    ),
  },
  {
    href: "/subscription",
    label: "Subscription",
    icon: (
      <svg viewBox="0 0 24 24" className="size-[18px]">
        <path d="M4 7.5h16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <rect x="4" y="5" width="16" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8 15h3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
];