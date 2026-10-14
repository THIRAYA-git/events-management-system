// src/hooks/useChartTheme.ts
import { useTheme } from "@/context/ThemeContext";

export const useChartTheme = () => {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const text = dark ? "#94a3b8" : "#475569";
  const grid = dark ? "rgba(148,163,184,0.12)" : "rgba(15,23,42,0.08)";

  return {
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: text } }, title: { color: text } },
      scales: {
        x: { ticks: { color: text }, grid: { color: grid } },
        y: { ticks: { color: text }, grid: { color: grid } },
      },
    },
  };
};