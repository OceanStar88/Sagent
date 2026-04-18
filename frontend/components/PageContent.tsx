"use client";

import { useState } from "react";
import { pageStackClass, sectionTitleClass, triPanelClass, triPanelLayoutClass, ledeClass, mutedClass } from "@/lib/ui";
import { useCurrentNavItem } from "@/contexts/NavContext";

// Mock data—replace with real API data
const MOCK_MAIN_ITEMS = [
  { id: "1", name: "Item One", count: 5 },
  { id: "2", name: "Item Two", count: 3 },
  { id: "3", name: "Item Three", count: 8 },
];

const MOCK_SUB_ITEMS: Record<string, Array<{ id: string; name: string }>> = {
  "1": [
    { id: "1a", name: "Sub Item 1A" },
    { id: "1b", name: "Sub Item 1B" },
  ],
  "2": [
    { id: "2a", name: "Sub Item 2A" },
    { id: "2b", name: "Sub Item 2B" },
    { id: "2c", name: "Sub Item 2C" },
  ],
  "3": [
    { id: "3a", name: "Sub Item 3A" },
  ],
};

interface PageContentProps {
  children?: never;
}

export function PageContent({ ...props }: PageContentProps) {
  const currentNavItem = useCurrentNavItem();
  const [mainSelected, setMainSelected] = useState<string>("1");
  const [subSelected, setSubSelected] = useState<string>("1a");

  const mainPanelHeader = currentNavItem?.label || "Main Panel";
  const subPanelHeader = mainSelected 
    ? MOCK_MAIN_ITEMS.find(item => item.id === mainSelected)?.name || "Sub Panel"
    : "Sub Panel";
  
  const detailPanelHeader = subSelected
    ? MOCK_SUB_ITEMS[mainSelected]?.find(item => item.id === subSelected)?.name || "Detail Panel"
    : "Detail Panel";

  const subItems = MOCK_SUB_ITEMS[mainSelected] || [];

  return (
    <div className={pageStackClass}>
      <div className={triPanelLayoutClass}>
        {/* Main Panel: Sidebar items list */}
        <article className={triPanelClass}>
          <div className="flex items-center gap-2.5 mb-4">
            {currentNavItem?.renderIcon && <div className="size-5 flex-shrink-0 text-indigo-600 dark:text-indigo-400">{currentNavItem.renderIcon()}</div>}
            <h2 className={sectionTitleClass}>{mainPanelHeader}</h2>
          </div>
          <div className="flex flex-col gap-2 overflow-y-auto min-h-0">
            {MOCK_MAIN_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setMainSelected(item.id);
                  // Auto-select first sub-item
                  const firstSubItem = MOCK_SUB_ITEMS[item.id]?.[0];
                  if (firstSubItem) setSubSelected(firstSubItem.id);
                }}
                className={`text-left px-3 py-2 rounded transition ${
                  mainSelected === item.id
                    ? "bg-indigo-500/20 border border-indigo-600/30 dark:bg-indigo-400/15 dark:border-indigo-400/30"
                    : "border border-transparent hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                }`}
              >
                <div className="font-medium text-sm">{item.name}</div>
                <div className={`${mutedClass} text-xs`}>{item.count} items</div>
              </button>
            ))}
          </div>
        </article>

        {/* Sub Panel: Detail items for selected main item */}
        <article className={triPanelClass}>
          <h2 className={sectionTitleClass}>{subPanelHeader}</h2>
          <div className="flex flex-col gap-2 overflow-y-auto min-h-0">
            {subItems.length > 0 ? (
              subItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSubSelected(item.id)}
                  className={`text-left px-3 py-2 rounded transition text-sm ${
                    subSelected === item.id
                      ? "bg-indigo-500/20 border border-indigo-600/30 dark:bg-indigo-400/15 dark:border-indigo-400/30"
                      : "border border-transparent hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  {item.name}
                </button>
              ))
            ) : (
              <div className={ledeClass}>No items</div>
            )}
          </div>
        </article>

        {/* Detail Panel: Context/metadata for selected sub item */}
        <article className={triPanelClass}>
          <h2 className={sectionTitleClass}>{detailPanelHeader}</h2>
          <div className={ledeClass}>
            <p className="mb-3">Selected item details go here.</p>
            <ul className="space-y-2 text-xs">
              <li><strong>Main:</strong> {MOCK_MAIN_ITEMS.find(item => item.id === mainSelected)?.name}</li>
              <li><strong>Sub:</strong> {MOCK_SUB_ITEMS[mainSelected]?.find(item => item.id === subSelected)?.name}</li>
              <li><strong>ID:</strong> {subSelected}</li>
            </ul>
          </div>
        </article>
      </div>
    </div>
  );
}
