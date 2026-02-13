"use client";

import { useEffect, useState } from "react";
import AgentCard from "@/components/AgentCard";
import StatsCard from "@/components/StatsCard";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import type { Agent, CronJob } from "@/lib/types";

export default function DashboardPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [agentsRes, cronRes] = await Promise.allSettled([
          fetch("/api/agents"),
          fetch("/api/cron"),
        ]);

        if (agentsRes.status === "fulfilled" && agentsRes.value.ok) {
          const data = await agentsRes.value.json();
          setAgents(Array.isArray(data) ? data : data.agents || []);
        }

        if (cronRes.status === "fulfilled" && cronRes.value.ok) {
          const data = await cronRes.value.json();
          setCronJobs(Array.isArray(data) ? data : data.jobs || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Connection Error"
        description={error}
        icon={
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        }
      />
    );
  }

  const activeAgents = agents.filter((a) => a.status === "online").length;
  const activeCronJobs = cronJobs.filter((j) => j.enabled).length;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your OpenClaw agents and jobs"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="Agents"
          value={agents.length}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatsCard
          label="Active"
          value={activeAgents}
          accent
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
        <StatsCard
          label="Cron Jobs"
          value={cronJobs.length}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          label="Active Jobs"
          value={activeCronJobs}
          accent
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Agents Grid */}
      <div className="mb-2">
        <h2 className="text-[15px] font-semibold text-text-primary mb-4">Agents</h2>
      </div>

      {agents.length === 0 ? (
        <EmptyState
          title="No agents found"
          description="Make sure the OpenClaw Gateway is running and agents are configured."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </>
  );
}
