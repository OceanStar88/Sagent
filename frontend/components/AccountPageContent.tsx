"use client";

import { useEffect } from "react";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useCurrentNavItem } from "@/contexts/NavContext";
import { usePanelPath } from "@/contexts/PanelPathContext";
import { ledeClass, pageStackClass, sectionTitleClass, triPanelClass, triPanelLayoutClass } from "@/lib/ui";
import { AvatarUploadDetail } from "@/components/account/AvatarUploadDetail";
import { NameEditDetail } from "@/components/account/NameEditDetail";
import { EmailDisplayDetail } from "@/components/account/EmailDisplayDetail";
import { PasswordChangeDetail } from "@/components/account/PasswordChangeDetail";
import { ThemeSelectorDetail } from "@/components/account/ThemeSelectorDetail";

type AccountSectionItem = {
  id: string;
  label: string;
  summary: string;
};

type AccountActionItem = {
  id: string;
  label: string;
  description: string;
};

type AccountDetail = {
  heading: string;
  description: string;
  bullets: string[];
};

const SECTION_ITEMS: Record<string, AccountSectionItem[]> = {
  profile: [
    { id: "avatar", label: "Avatar", summary: "Public profile image controls" },
    { id: "identity", label: "Identity", summary: "Display and ownership information" },
    { id: "security", label: "Security", summary: "Credentials and session protection" },
  ],
  preferences: [
    { id: "appearance", label: "Appearance", summary: "Theme and layout density" },
    { id: "shortcuts", label: "Keyboard", summary: "Hotkeys and navigation flow" },
    { id: "notifications", label: "Notifications", summary: "Alert and reminder defaults" },
  ],
  subscription: [
    { id: "plan", label: "Plan", summary: "Tier and included capabilities" },
    { id: "billing", label: "Billing", summary: "Invoices and payment methods" },
    { id: "usage", label: "Usage", summary: "Seat and activity consumption" },
  ],
};

const ACTION_ITEMS: Record<string, AccountActionItem[]> = {
  identity: [
    { id: "name", label: "Display Name", description: "Primary account name shown to teammates." },
    { id: "email", label: "Email", description: "Primary email" },
  ],
  security: [
    { id: "password", label: "Password", description: "Rotate password and enforce policy." },
    { id: "sessions", label: "Sessions", description: "Review and revoke active sessions." },
  ],
  avatar: [
    { id: "upload", label: "Upload", description: "Update profile image and crop settings." },
    { id: "visibility", label: "Visibility", description: "Control where avatar is displayed." },
  ],
  appearance: [
    { id: "theme", label: "Theme", description: "Dark/light mode and system sync." },
    { id: "density", label: "Density", description: "Compact or comfortable spacing." },
  ],
  shortcuts: [
    { id: "bindings", label: "Key Bindings", description: "Customize shortcut combinations." },
    { id: "navigation", label: "Quick Navigation", description: "Switcher and jump behavior." },
  ],
  notifications: [
    { id: "channels", label: "Channel Alerts", description: "Choose notification channels." },
    { id: "quiet-hours", label: "Quiet Hours", description: "Set schedules and snooze windows." },
  ],
  plan: [
    { id: "tier", label: "Tier", description: "Current plan and upgrade options." },
    { id: "addons", label: "Add-ons", description: "Optional feature package controls." },
  ],
  billing: [
    { id: "method", label: "Payment Method", description: "Card and billing profile updates." },
    { id: "invoices", label: "Invoices", description: "History, download, and tax docs." },
  ],
  usage: [
    { id: "seats", label: "Seats", description: "Assigned users and seat availability." },
    { id: "limits", label: "Limits", description: "Quota consumption and forecasting." },
  ],
};

const DETAIL_CONTENT: Record<string, AccountDetail> = {
  name: {
    heading: "Display Name",
    description: "Manage the primary label used across calls, comments, and ownership tags.",
    bullets: ["Set preferred public display name", "Configure alternate pronunciation hint", "Preview rendering in shared views"],
  },
  password: {
    heading: "Password Security",
    description: "Keep credentials compliant and protected.",
    bullets: ["Rotate password", "Enable stronger policy", "Review password age"],
  },
  sessions: {
    heading: "Session Management",
    description: "Audit devices and close unexpected sessions.",
    bullets: ["View active sessions", "Revoke stale sessions", "Require re-authentication"],
  },
  upload: {
    heading: "Avatar Upload",
    description: "Update and crop avatar images for profile visibility.",
    bullets: ["Upload PNG/JPG", "Crop focal area", "Preview in sidebar"],
  },
  visibility: {
    heading: "Avatar Visibility",
    description: "Control where profile imagery appears in the product.",
    bullets: ["Internal only visibility", "Public workspace visibility", "Hide in external exports"],
  },
  theme: {
    heading: "Theme",
    description: "Set global visual mode preferences.",
    bullets: ["Light mode", "Dark mode", "Follow system"],
  },
  density: {
    heading: "Density",
    description: "Tune information density for lists and panels.",
    bullets: ["Compact spacing", "Comfortable spacing", "Remember per device"],
  },
  bindings: {
    heading: "Key Bindings",
    description: "Adjust keyboard shortcuts for your workflow.",
    bullets: ["Customize command keys", "Reset defaults", "Export/import bindings"],
  },
  navigation: {
    heading: "Quick Navigation",
    description: "Improve speed of movement between sections.",
    bullets: ["Enable command palette", "Tune jump behavior", "Recent destination ordering"],
  },
  channels: {
    heading: "Channel Alerts",
    description: "Choose where and how you receive account alerts.",
    bullets: ["Email notifications", "In-app banners", "Webhook relay"],
  },
  "quiet-hours": {
    heading: "Quiet Hours",
    description: "Suppress non-critical alerts during selected windows.",
    bullets: ["Set daily schedules", "Weekend overrides", "Emergency bypass contacts"],
  },
  tier: {
    heading: "Plan Tier",
    description: "Review current tier and upgrade pathways.",
    bullets: ["Current tier benefits", "Compare available plans", "Estimate upgrade impact"],
  },
  addons: {
    heading: "Add-ons",
    description: "Enable optional capabilities for your subscription.",
    bullets: ["Call intelligence add-on", "Advanced analytics add-on", "Priority support add-on"],
  },
  method: {
    heading: "Payment Method",
    description: "Update default charge method and billing identity.",
    bullets: ["Replace card", "Set backup method", "Verify billing details"],
  },
  invoices: {
    heading: "Invoices",
    description: "Access billing history and downloadable records.",
    bullets: ["View invoice timeline", "Download PDFs", "Tax breakdown summary"],
  },
  seats: {
    heading: "Seat Allocation",
    description: "Manage available and assigned seats for teammates.",
    bullets: ["Assigned seat list", "Pending invites", "Seat reclaim actions"],
  },
  limits: {
    heading: "Usage Limits",
    description: "Track consumption against quotas and thresholds.",
    bullets: ["Monthly call quota", "Forecast overage risk", "Threshold notifications"],
  },
};

function fallbackMainId(accountPageId: string) {
  return SECTION_ITEMS[accountPageId]?.[0]?.id ?? "";
}

function fallbackSubId(mainId: string) {
  return ACTION_ITEMS[mainId]?.[0]?.id ?? "";
}

export function AccountPageContent({ initialMainId }: { initialMainId: string }) {
  const pathname = usePathname();
  const currentNavItem = useCurrentNavItem();
  const { setPanelPath } = usePanelPath();
  const routePageId = pathname?.replace("/", "") || initialMainId;
  const accountPageId = SECTION_ITEMS[routePageId] ? routePageId : initialMainId;
  const initialSectionId = fallbackMainId(accountPageId);
  const initialSubId = fallbackSubId(initialSectionId);

  const [mainSelected, setMainSelected] = useState<string>(initialSectionId);
  const [subSelected, setSubSelected] = useState<string>(initialSubId);
  const [tabletStep, setTabletStep] = useState<"lists" | "detail">("lists");
  const [mobileStep, setMobileStep] = useState<"main" | "sub" | "detail">("main");
  const [viewport, setViewport] = useState<"mobile" | "tablet" | "desktop">("desktop");

  const mainItems = useMemo(() => SECTION_ITEMS[accountPageId] ?? [], [accountPageId]);

  const currentMain = useMemo(() => mainItems.find((item) => item.id === mainSelected) ?? mainItems[0], [mainItems, mainSelected]);

  const subItems = useMemo(() => ACTION_ITEMS[currentMain?.id ?? ""] ?? [], [currentMain?.id]);

  const currentSub = useMemo(() => subItems.find((item) => item.id === subSelected) ?? subItems[0], [subItems, subSelected]);

  const mainPanelHeader = currentNavItem?.label ?? "Account";
  const subPanelHeader = currentMain?.label ?? "Sub Section";
  const detailPanelHeader = currentSub?.label ?? "Detail";

  useEffect(() => {
    const mediaDesktop = window.matchMedia("(min-width: 1024px)");
    const mediaTablet = window.matchMedia("(min-width: 768px)");

    const syncViewport = () => {
      if (mediaDesktop.matches) {
        setViewport("desktop");
        return;
      }
      if (mediaTablet.matches) {
        setViewport("tablet");
        return;
      }
      setViewport("mobile");
    };

    syncViewport();
    mediaDesktop.addEventListener("change", syncViewport);
    mediaTablet.addEventListener("change", syncViewport);
    return () => {
      mediaDesktop.removeEventListener("change", syncViewport);
      mediaTablet.removeEventListener("change", syncViewport);
    };
  }, []);

  useEffect(() => {
    const mainName = currentMain?.label ?? subPanelHeader;
    const subName = currentSub?.label ?? detailPanelHeader;

    if (viewport === "desktop") {
      setPanelPath({
        headerLabel: `${mainPanelHeader} > ${mainName}`,
        titleLabel: `${subName} | ${mainName} | ${mainPanelHeader} | Sagent`,
      });
      return;
    }

    if (viewport === "tablet") {
      if (tabletStep === "detail") {
        setPanelPath({
          headerLabel: `${mainPanelHeader} > ${mainName}`,
          titleLabel: `${subName} | ${mainName} | ${mainPanelHeader} | Sagent`,
        });
        return;
      }

      setPanelPath({
        headerLabel: mainPanelHeader,
        titleLabel: `${mainName} | ${mainPanelHeader} | Sagent`,
      });
      return;
    }

    if (mobileStep === "detail") {
      setPanelPath({
        headerLabel: `${mainPanelHeader} > ${mainName}`,
        titleLabel: `${subName} | ${mainName} | ${mainPanelHeader} | Sagent`,
      });
      return;
    }

    if (mobileStep === "sub") {
      setPanelPath({
        headerLabel: mainPanelHeader,
        titleLabel: `${mainName} | ${mainPanelHeader} | Sagent`,
      });
      return;
    }

    setPanelPath({
      headerLabel: mainPanelHeader,
      titleLabel: `${mainPanelHeader} | Sagent`,
    });
  }, [currentMain?.label, currentSub?.label, detailPanelHeader, mainPanelHeader, mobileStep, setPanelPath, subPanelHeader, tabletStep, viewport]);

  useEffect(() => {
    return () => {
      setPanelPath(null);
    };
  }, [setPanelPath]);

  function handleMainSelect(itemId: string) {
    setMainSelected(itemId);
    setSubSelected(fallbackSubId(itemId));
    setTabletStep("lists");
    setMobileStep("sub");
  }

  function handleSubSelect(itemId: string) {
    setSubSelected(itemId);
    setTabletStep("detail");
    setMobileStep("detail");
  }

  return (
    <div className={pageStackClass}>
      <div className={`${triPanelLayoutClass} hidden lg:grid`}>
        <article className={triPanelClass}>
          <div className="mb-4 flex items-center gap-2.5">
            {currentNavItem?.renderIcon ? (
              <div className="size-5 flex-shrink-0 text-indigo-600 dark:text-indigo-400">{currentNavItem.renderIcon()}</div>
            ) : null}
            <h2 className={sectionTitleClass}>{mainPanelHeader}</h2>
          </div>
          <div className="flex min-h-0 flex-col gap-2 overflow-y-auto">
            {mainItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleMainSelect(item.id)}
                className={
                  mainSelected === item.id
                    ? "rounded-none border border-indigo-600/30 bg-indigo-500/14 px-3 py-2 text-left"
                    : "rounded-none border border-transparent px-3 py-2 text-left hover:bg-slate-200/55 dark:hover:bg-slate-700/45"
                }
              >
                <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">{item.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.summary}</p>
              </button>
            ))}
          </div>
        </article>

        <article className={triPanelClass}>
          <h2 className={sectionTitleClass}>{subPanelHeader}</h2>
          <div className="flex min-h-0 flex-col gap-2 overflow-y-auto">
            {subItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSubSelect(item.id)}
                className={
                  subSelected === item.id
                    ? "rounded-none border border-indigo-600/30 bg-indigo-500/14 px-3 py-2 text-left"
                    : "rounded-none border border-transparent px-3 py-2 text-left hover:bg-slate-200/55 dark:hover:bg-slate-700/45"
                }
              >
                <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">{item.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
              </button>
            ))}
          </div>
        </article>

        <article className={triPanelClass}>
          <h2 className={sectionTitleClass}>{detailPanelHeader}</h2>
          {currentSub ? (
            <DetailPanel actionId={currentSub.id} />
          ) : (
            <p className={ledeClass}>Select a section to view details.</p>
          )}
        </article>
      </div>

      <div className="hidden md:grid lg:hidden">
        {tabletStep === "lists" ? (
          <div className="grid grid-cols-2 gap-0">
            <article className={triPanelClass}>
              <div className="mb-4 flex items-center gap-2.5">
                {currentNavItem?.renderIcon ? (
                  <div className="size-5 flex-shrink-0 text-indigo-600 dark:text-indigo-400">{currentNavItem.renderIcon()}</div>
                ) : null}
                <h2 className={sectionTitleClass}>{mainPanelHeader}</h2>
              </div>
              <div className="flex min-h-0 flex-col gap-2 overflow-y-auto">
                {mainItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleMainSelect(item.id)}
                    className={
                      mainSelected === item.id
                        ? "rounded-none border border-indigo-600/30 bg-indigo-500/14 px-3 py-2 text-left"
                        : "rounded-none border border-transparent px-3 py-2 text-left hover:bg-slate-200/55 dark:hover:bg-slate-700/45"
                    }
                  >
                    <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">{item.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.summary}</p>
                  </button>
                ))}
              </div>
            </article>

            <article className={triPanelClass}>
              <h2 className={sectionTitleClass}>{subPanelHeader}</h2>
              <div className="flex min-h-0 flex-col gap-2 overflow-y-auto">
                {subItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSubSelect(item.id)}
                    className={
                      subSelected === item.id
                        ? "rounded-none border border-indigo-600/30 bg-indigo-500/14 px-3 py-2 text-left"
                        : "rounded-none border border-transparent px-3 py-2 text-left hover:bg-slate-200/55 dark:hover:bg-slate-700/45"
                    }
                  >
                    <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">{item.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                  </button>
                ))}
              </div>
            </article>
          </div>
        ) : (
          <article className={triPanelClass}>
            <div className="mb-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setTabletStep("lists")}
                className="rounded-none border border-slate-900/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700 dark:border-white/10 dark:text-slate-200"
              >
                Back
              </button>
              <h2 className={sectionTitleClass}>{detailPanelHeader}</h2>
            </div>
            {currentSub ? <DetailPanel actionId={currentSub.id} /> : <p className={ledeClass}>Select a section to view details.</p>}
          </article>
        )}
      </div>

      <div className="md:hidden">
        {mobileStep === "main" ? (
          <article className={triPanelClass}>
            <div className="mb-4 flex items-center gap-2.5">
              {currentNavItem?.renderIcon ? (
                <div className="size-5 flex-shrink-0 text-indigo-600 dark:text-indigo-400">{currentNavItem.renderIcon()}</div>
              ) : null}
              <h2 className={sectionTitleClass}>{mainPanelHeader}</h2>
            </div>
            <div className="flex min-h-0 flex-col gap-2 overflow-y-auto">
              {mainItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleMainSelect(item.id)}
                  className={
                    mainSelected === item.id
                      ? "rounded-none border border-indigo-600/30 bg-indigo-500/14 px-3 py-2 text-left"
                      : "rounded-none border border-transparent px-3 py-2 text-left hover:bg-slate-200/55 dark:hover:bg-slate-700/45"
                  }
                >
                  <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">{item.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.summary}</p>
                </button>
              ))}
            </div>
          </article>
        ) : null}

        {mobileStep === "sub" ? (
          <article className={triPanelClass}>
            <div className="mb-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileStep("main")}
                className="rounded-none border border-slate-900/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700 dark:border-white/10 dark:text-slate-200"
              >
                Back
              </button>
              <h2 className={sectionTitleClass}>{subPanelHeader}</h2>
            </div>
            <div className="flex min-h-0 flex-col gap-2 overflow-y-auto">
              {subItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSubSelect(item.id)}
                  className={
                    subSelected === item.id
                      ? "rounded-none border border-indigo-600/30 bg-indigo-500/14 px-3 py-2 text-left"
                      : "rounded-none border border-transparent px-3 py-2 text-left hover:bg-slate-200/55 dark:hover:bg-slate-700/45"
                  }
                >
                  <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">{item.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                </button>
              ))}
            </div>
          </article>
        ) : null}

        {mobileStep === "detail" ? (
          <article className={triPanelClass}>
            <div className="mb-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileStep("sub")}
                className="rounded-none border border-slate-900/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700 dark:border-white/10 dark:text-slate-200"
              >
                Back
              </button>
              <h2 className={sectionTitleClass}>{detailPanelHeader}</h2>
            </div>
            {currentSub ? <DetailPanel actionId={currentSub.id} /> : <p className={ledeClass}>Select a section to view details.</p>}
          </article>
        ) : null}
      </div>
    </div>
  );
}

function DetailPanel({ actionId }: { actionId: string }) {
  switch (actionId) {
    case "upload":
      return <AvatarUploadDetail />;
    case "name":
      return <NameEditDetail />;
    case "email":
      return <EmailDisplayDetail />;
    case "password":
      return <PasswordChangeDetail />;
    case "theme":
      return <ThemeSelectorDetail />;
    default: {
      const detail = DETAIL_CONTENT[actionId];
      if (!detail) return null;
      return (
        <div className={ledeClass}>
          <p className="font-medium text-slate-900 dark:text-zinc-100">{detail.heading}</p>
          <p className="mt-2">{detail.description}</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
            {detail.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      );
    }
  }
}
