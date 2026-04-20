type MonitorHealthSource = {
  status?: string | null;
  is_down?: boolean | null;
  is_paused?: boolean | null;
};

export type MonitorHealthState = "healthy" | "down" | "paused";

export function getMonitorHealthState(monitor: MonitorHealthSource): MonitorHealthState {
  if (monitor.is_paused) {
    return "paused";
  }

  if (monitor.is_down || (monitor.status || "").toUpperCase() === "DOWN") {
    return "down";
  }

  return "healthy";
}

export function summarizeMonitorHealth(monitors: MonitorHealthSource[]) {
  return monitors.reduce(
    (summary, monitor) => {
      const state = getMonitorHealthState(monitor);

      summary.total += 1;
      summary[state] += 1;

      if (state !== "paused") {
        summary.active += 1;
      }

      return summary;
    },
    {
      total: 0,
      healthy: 0,
      down: 0,
      paused: 0,
      active: 0,
    }
  );
}
