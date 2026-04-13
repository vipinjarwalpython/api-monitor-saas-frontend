"use client";

import { useRouter } from "next/navigation";
import { monitorAPI } from "@/lib/api";
import { DashboardPage, Card, ActionButton, Notice } from "@/components/dashboard/ui";
import { MonitorForm } from "@/components/monitors/MonitorForm";
import { extractApiError } from "@/lib/api/utils";
import { useState } from "react";

export default function AddMonitorPage() {
  const router = useRouter();
  const [pageError, setPageError] = useState("");

  return (
    <DashboardPage
      eyebrow="Create"
      title="Add a new monitor"
      subtitle="Configure request details, expected responses, alert settings, and optional metadata in one flow."
      actions={
        <>
          <ActionButton tone="ghost" onClick={() => router.push("/dashboard/apis")}>
            Back to monitors
          </ActionButton>
        </>
      }
    >
      {pageError ? <Notice tone="error">{pageError}</Notice> : null}

      <Card
        title="Monitor configuration"
        subtitle="This form matches the current backend create payload, including headers, request body, status codes, retry policy, notification channels, and tags."
      >
        <MonitorForm
          mode="create"
          submitLabel="Create monitor"
          onSubmit={async (payload) => {
            try {
              await monitorAPI.createMonitor(payload);
              router.push("/dashboard/apis");
            } catch (error) {
              const message = extractApiError(error, "Unable to create monitor.");
              setPageError(message);
              throw new Error(message);
            }
          }}
        />
      </Card>
    </DashboardPage>
  );
}
