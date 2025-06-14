
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface SentimentData {
  label: 'POSITIVE' | 'NEGATIVE';
  score: number;
}

interface SentimentChartProps {
  data: SentimentData[];
}

const COLORS = {
  POSITIVE: '#22c55e', // green-500
  NEGATIVE: '#ef4444', // red-500
};

export function SentimentChart({ data }: SentimentChartProps) {
  const positiveCount = data.filter(d => d.label === 'POSITIVE').length;
  const negativeCount = data.filter(d => d.label === 'NEGATIVE').length;
  const total = positiveCount + negativeCount;

  if (total === 0) return null;

  const chartData = [
    { name: 'Positive', value: positiveCount },
    { name: 'Negative', value: negativeCount },
  ];

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            labelLine={false}
            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
              const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
              const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
              const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
              return (
                <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                  {`${(percent * 100).toFixed(0)}%`}
                </text>
              );
            }}
          >
            {chartData.map((entry) => (
              <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name.toUpperCase() as keyof typeof COLORS]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
