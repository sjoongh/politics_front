import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import useFetchData from "../hooks/useFetchData";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function TagChart() {
  const [data] = useFetchData("/api/statistics/tags");

  const chartData = {
    labels: data.map(d => d.tag),
    datasets: [{
      label: "태그별 발언 빈도",
      data: data.map(d => d.count),
      backgroundColor: "rgba(54, 162, 235, 0.6)"
    }]
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">태그 통계</h2>
      <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
    </div>
  );
}
