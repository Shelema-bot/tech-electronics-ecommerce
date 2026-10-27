import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from "chart.js";

import { Pie } from "react-chartjs-2";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

function OrdersChart({ data }) {

    const chartData = {

        labels: data.map(item => item._id || "Unknown"),

        datasets: [
  {
    data: data.map(item => item.value),

    backgroundColor: [
      "#2563eb",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#06b6d4"
    ],

    borderColor: "#ffffff",
    borderWidth: 2
  }
]

    };

    return <Pie data={chartData} />;
}

export default OrdersChart;