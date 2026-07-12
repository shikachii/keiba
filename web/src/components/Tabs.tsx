import { useState, type ReactNode } from 'react';

export interface TabDef {
  key: string;
  label: string;
  disabled?: boolean;
  disabledReason?: string;
  content: ReactNode;
}

export function Tabs({ tabs, defaultKey }: { tabs: TabDef[]; defaultKey: string }) {
  const [active, setActive] = useState(defaultKey);
  const activeTab = tabs.find((t) => t.key === active) ?? tabs[0];

  return (
    <div>
      <div className="tab-bar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab-button${tab.key === activeTab.key ? ' active' : ''}`}
            disabled={tab.disabled}
            title={tab.disabled ? tab.disabledReason : undefined}
            onClick={() => setActive(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tab-content">{activeTab.content}</div>
    </div>
  );
}
