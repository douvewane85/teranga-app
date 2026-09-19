"use client";

import React, { useState } from "react";

export default function MemberCampaignTabs({
  personal,
  history,
}: {
  personal: React.ReactNode;
  history: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<"personal" | "history">("personal");

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("personal")}
            className={`
              whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
              ${activeTab === "personal"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }
            `}
          >
            Ma situation
          </button>
          
          <button
            onClick={() => setActiveTab("history")}
            className={`
              whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
              ${activeTab === "history"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }
            `}
          >
            Historique & Versements
          </button>
        </nav>
      </div>

      <div className="mt-4">
        {activeTab === "personal" && personal}
        {activeTab === "history" && history}
      </div>
    </div>
  );
}
