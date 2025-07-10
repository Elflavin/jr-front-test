import React from "react";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { StatusEntry } from "../types/status";

// Necessary modules
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface Props {
  history: StatusEntry[];
}

const categoryColors: Record<StatusEntry['category'], string> = {
  '1xx': '#7FDBFF',
  '2xx': '#2ECC40',
  '3xx': '#FF851B',
  '4xx': '#FF4136',
  '5xx': '#B10DC9',
  'invalid': '#AAAAAA',
};

const StatusHistoryChart: React.FC<Props> = ({ history }) => {
  const labels = history.map((_, i) => `#${i + 1}`);
  const data = {
    labels,
    datasets: [
      {
        label: 'HTTP Status Code',
        data: history.map(h => h.code),
        backgroundColor: history.map(h => categoryColors[h.category]),
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 600,
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default StatusHistoryChart;