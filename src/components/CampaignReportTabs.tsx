"use client";

import React, { useState } from "react";

export default function CampaignReportTabs({
  overview,
  validations,
  members,
  transactions,
  memberSearch,
  pendingValidationsCount = 0,
}: {
  overview: React.ReactNode;
  validations: React.ReactNode;
  members: React.ReactNode;
  transactions: React.ReactNode;
  memberSearch: React.ReactNode;
  pendingValidationsCount?: number;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "validations" | "members" | "transactions" | "member_search">("overview");

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("overview")}
            className={`
              whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
              ${activeTab === "overview"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }
            `}
          >
            Vue d'ensemble
          </button>

          <button
            onClick={() => setActiveTab("validations")}
            className={`
              whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center
              ${activeTab === "validations"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }
            `}
          >
            Validation des Paiements
            {pendingValidationsCount > 0 && (
              <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs font-semibold">
                {pendingValidationsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("members")}
            className={`
              whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
              ${activeTab === "members"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }
            `}
          >
            Membres de la campagne
          </button>

          <button
            onClick={() => setActiveTab("transactions")}
            className={`
              whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
              ${activeTab === "transactions"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }
            `}
          >
            Historique des paiements
          </button>

          <button
            onClick={() => setActiveTab("member_search")}
            className={`
              whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
              ${activeTab === "member_search"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }
            `}
          >
            Recherche Membre (360°)
          </button>
        </nav>
      </div>

      <div className="mt-4">
        {activeTab === "overview" && overview}
        {activeTab === "validations" && validations}
        {activeTab === "members" && members}
        {activeTab === "transactions" && transactions}
        {activeTab === "member_search" && memberSearch}
      </div>
    </div>
  );
}
