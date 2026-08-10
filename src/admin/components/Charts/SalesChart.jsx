import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const months = [
    "",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
];

function SalesChart({ data }) {

    const chartData = {

        labels: data.map(item => months[item._id]),

        datasets: [
  {
    label: "Sales (ETB)",

    data: data.map(item => item.total),

    borderColor: "#2563eb",

    backgroundColor: "rgba(37,99,235,0.25)",

    fill: true,

    tension: 0.4,

    pointRadius: 5,

    pointBackgroundColor: "#2563eb"
  }
]
    };

    return <Line data={chartData} />;
}

export default SalesChart;