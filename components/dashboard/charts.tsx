"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Legend, Tooltip);

export function SuccessFailureChart({
  successChecks,
  failureChecks,
}: {
  successChecks: number;
  failureChecks: number;
}) {
  return (
    <Doughnut
      data={{
        labels: ["Successful", "Failed"],
        datasets: [
          {
            data: [successChecks, failureChecks],
            backgroundColor: ["rgba(29,158,117,0.8)", "rgba(226,75,74,0.75)"],
            borderColor: ["#1d9e75", "#e24b4a"],
            borderWidth: 1,
          },
        ],
      }}
      options={{
        plugins: {
          legend: {
            labels: {
              color: "#d5daf5",
            },
          },
        },
      }}
    />
  );
}

export function ResponseTimeChart({
  average,
  minimum,
  maximum,
}: {
  average: number;
  minimum: number;
  maximum: number;
}) {
  return (
    <Bar
      data={{
        labels: ["Min", "Average", "Max"],
        datasets: [
          {
            label: "Response Time (seconds)",
            data: [minimum, average, maximum],
            backgroundColor: [
              "rgba(6,182,212,0.7)",
              "rgba(79,110,247,0.78)",
              "rgba(239,159,39,0.78)",
            ],
            borderRadius: 8,
          },
        ],
      }}
      options={{
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            ticks: {
              color: "#a7aec8",
            },
            grid: {
              color: "rgba(255,255,255,0.04)",
            },
          },
          y: {
            ticks: {
              color: "#a7aec8",
            },
            grid: {
              color: "rgba(255,255,255,0.04)",
            },
          },
        },
      }}
    />
  );
}
