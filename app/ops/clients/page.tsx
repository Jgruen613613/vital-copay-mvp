"use client";

import { useState, useEffect, useMemo } from "react";
import { getClients, type Client } from "@/lib/ops-mock-data";

const TIER_LABELS: Record<string, { label: string; color: string }> = {
  starter: { label: "Starter", color: "bg-gray-700 text-gray-300" },
  growth: { label: "Growth", color: "bg-blue-500/20 text-blue-400" },
  scale: { label: "Scale", color: "bg-purple-500/20 text-purple-400" },
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-500/10 text-green-400",
  paused: "bg-yellow-500/10 text-yellow-400",
  churned: "bg-red-500/10 text-red-400",
};

type SortKey = "companyName" | "monthlyRate" | "totalRevenue" | "satisfaction" | "status";

function formatMoney(n: number): string {
  return `$${n.toLocaleString()}`;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("companyName");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    setClients(getClients());
  }, []);

  const sorted = useMemo(() => {
    return [...clients].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "companyName") cmp = a.companyName.localeCompare(b.companyName);
      else if (sortKey === "monthlyRate") cmp = a.monthlyRate - b.monthlyRate;
      else if (sortKey === "totalRevenue") cmp = a.totalRevenue - b.totalRevenue;
      else if (sortKey === "satisfaction") cmp = a.satisfaction - b.satisfaction;
      else if (sortKey === "status") cmp = a.status.localeCompare(b.status);
      return sortAsc ? cmp : -cmp;
    });
  }, [clients, sortKey, sortAsc]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  }

  const activeClients = clients.filter((c) => c.status === "active");
  const mrr = activeClients.reduce((s, c) => s + c.monthlyRate, 0);
  const avgSatisfaction = activeClients.length > 0
    ? (activeClients.reduce((s, c) => s + c.satisfaction, 0) / activeClients.length).toFixed(1)
    : "0";
  const churnRate = clients.length > 0
    ? ((clients.filter((c) => c.status === "churned").length / clients.length) * 100).toFixed(0)
    : "0";

  const tierCounts = clients.reduce<Record<string, number>>((acc, c) => {
    acc[c.packageTier] = (acc[c.packageTier] || 0) + 1;
    return acc;
  }, {});

  const SortIcon = ({ active, asc }: { active: boolean; asc: boolean }) => (
    <span className={`ml-1 text-[10px] ${active ? "text-blue-400" : "text-gray-700"}`}>
      {active ? (asc ? "\u25B2" : "\u25BC") : "\u25B2"}
    </span>
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">MRR</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{formatMoney(mrr)}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Clients</p>
          <p className="text-2xl font-bold text-white mt-1">{clients.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Avg Satisfaction</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{avgSatisfaction}/10</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Churn Rate</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{churnRate}%</p>
        </div>
      </div>

      {/* Package Tier Breakdown */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-white mb-3">Package Tiers</h2>
        <div className="grid grid-cols-3 gap-4">
          {(["starter", "growth", "scale"] as const).map((tier) => {
            const info = TIER_LABELS[tier];
            const count = tierCounts[tier] || 0;
            return (
              <div key={tier} className="bg-gray-800/50 rounded-lg p-3 text-center">
                <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${info.color}`}>
                  {info.label}
                </span>
                <p className="text-2xl font-bold text-white mt-2">{count}</p>
                <p className="text-xs text-gray-500">clients</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Client Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                {([
                  { key: "companyName" as SortKey, label: "Company" },
                  { key: null, label: "Contact" },
                  { key: null, label: "Vertical" },
                  { key: null, label: "Package" },
                  { key: "monthlyRate" as SortKey, label: "Monthly" },
                  { key: null, label: "Deliverables" },
                  { key: "totalRevenue" as SortKey, label: "Revenue" },
                  { key: "satisfaction" as SortKey, label: "Satisfaction" },
                  { key: "status" as SortKey, label: "Status" },
                ] as const).map(({ key, label }) => (
                  <th
                    key={label}
                    className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap ${
                      key ? "cursor-pointer hover:text-gray-300" : ""
                    }`}
                    onClick={key ? () => handleSort(key) : undefined}
                  >
                    {label}
                    {key && <SortIcon active={sortKey === key} asc={sortAsc} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((client) => (
                <>
                  <tr
                    key={client.id}
                    className="border-b border-gray-800/50 hover:bg-gray-800/30 cursor-pointer transition-colors"
                    onClick={() => setExpandedId(expandedId === client.id ? null : client.id)}
                  >
                    <td className="px-4 py-3 font-medium text-white whitespace-nowrap">{client.companyName}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                      <div>{client.contactName}</div>
                      <div className="text-[10px] text-gray-600">{client.contactTitle}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">{client.vertical}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${TIER_LABELS[client.packageTier]?.color}`}>
                        {TIER_LABELS[client.packageTier]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white font-mono">{formatMoney(client.monthlyRate)}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {client.deliverablesCompleted}/{client.deliverablesTotal}
                      <div className="w-16 h-1.5 bg-gray-800 rounded-full mt-1">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${(client.deliverablesCompleted / client.deliverablesTotal) * 100}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-green-400 font-mono">{formatMoney(client.totalRevenue)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-white font-mono">{client.satisfaction}</span>
                        <span className="text-xs text-gray-600">/10</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[client.status]}`}>
                        {client.status}
                      </span>
                    </td>
                  </tr>
                  {expandedId === client.id && (
                    <tr key={`${client.id}-detail`} className="bg-gray-800/20">
                      <td colSpan={9} className="px-4 py-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Notes</h4>
                            <p className="text-sm text-gray-300">{client.notes || "No notes"}</p>
                            <p className="text-xs text-gray-600 mt-2">Started {client.startDate}</p>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Timeline</h4>
                            <div className="space-y-2">
                              {client.timeline.map((entry, i) => (
                                <div key={i} className="flex items-start gap-3">
                                  <div className="flex flex-col items-center">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                                    {i < client.timeline.length - 1 && (
                                      <div className="w-px h-4 bg-gray-700" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">{entry.date}</p>
                                    <p className="text-sm text-gray-300">{entry.event}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
