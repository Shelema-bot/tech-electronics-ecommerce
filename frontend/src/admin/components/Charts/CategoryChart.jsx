import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
);

function CategoryChart({ data }) {

    const chartData = {

        labels: data.map(item => item._id),

       datasets: [
  {
    label: "Products",

    data: data.map(item => item.value),

    backgroundColor: [
      "#2563eb",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#06b6d4"
    ],

    borderRadius: 8
  }
]

    };

    return <Bar data={chartData} />;
}

export default CategoryChart;