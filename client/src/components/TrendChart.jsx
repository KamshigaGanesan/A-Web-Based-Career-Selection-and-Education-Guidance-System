import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function TrendChart({ cutoffs = [], studentZScore, programName }) {
  const labels = cutoffs.map((c) => String(c.year));
  const cutoffValues = cutoffs.map((c) => c.cutoffZScore);

  const data = {
    labels,
    datasets: [
      {
        label: "Cutoff Z-Score",
        data: cutoffValues,
        borderColor: "#6366f1",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        borderWidth: 2.5,
        pointRadius: 5,
        pointBackgroundColor: "#6366f1",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        tension: 0.3,
        fill: true,
      },
      ...(studentZScore != null
        ? [
            {
              label: "Your Z-Score",
              data: labels.map(() => studentZScore),
              borderColor: "#f59e0b",
              backgroundColor: "transparent",
              borderWidth: 2,
              borderDash: [8, 4],
              pointRadius: 0,
              tension: 0,
              fill: false,
            },
          ]
        : []),
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: "bottom", labels: { usePointStyle: true, padding: 16, font: { size: 12 } } },
      title: {
        display: !!programName,
        text: programName ? `${programName} — 3-Year Cutoff Trend` : "",
        font: { size: 14, weight: "600" },
        padding: { bottom: 16 },
      },
      tooltip: {
        backgroundColor: "#1e293b",
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        title: { display: true, text: "Z-Score", font: { size: 12 } },
        ticks: { font: { size: 11 } },
        grid: { color: "rgba(0,0,0,0.04)" },
      },
      x: {
        title: { display: true, text: "Year", font: { size: 12 } },
        ticks: { font: { size: 11 } },
        grid: { display: false },
      },
    },
  };

  return (
    <div style={{ padding: "8px 0" }}>
      <Line data={data} options={options} />
    </div>
  );
}
