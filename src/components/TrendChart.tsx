import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  type ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAppData } from '../context/AppDataContext';
import { getTrendPoints } from '../lib/gradeMath';
import { formatDate } from '../lib/dateUtils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

export function TrendChart() {
  const { courses } = useAppData();
  const points = getTrendPoints(courses);

  if (points.length === 0) {
    return (
      <div className="card">
        <h3>Grade trend</h3>
        <p className="muted">Add courses with a grade and a date to see your trendline.</p>
      </div>
    );
  }

  const data = {
    labels: points.map((p) => formatDate(p.date)),
    datasets: [
      {
        label: 'Grade',
        data: points.map((p) => p.grade),
        borderColor: '#5b8def',
        backgroundColor: '#5b8def',
        tension: 0.25,
        pointRadius: 4,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 17,
        max: 31,
        ticks: { stepSize: 1 },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          afterLabel: (ctx) => points[ctx.dataIndex]?.name ?? '',
        },
      },
    },
  };

  return (
    <div className="card">
      <h3>Grade trend</h3>
      <div style={{ height: '260px' }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
