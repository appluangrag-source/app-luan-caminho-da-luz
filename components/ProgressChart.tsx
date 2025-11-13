import React, { useMemo } from 'react';
import { ConversationThread } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, Defs, Gradient, Stop } from 'recharts';

interface ProgressChartProps {
  entries: ConversationThread[];
}

const ProgressChart: React.FC<ProgressChartProps> = ({ entries }) => {
  const chartData = entries
    .map(entry => ({
      date: new Date(entry.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      pazInterior: entry.mood,
    }))
    .reverse();

  const peaceIndexTrend = useMemo(() => {
    if (chartData.length < 2) return { text: "Continue registrando para ver sua evolução.", color: "text-stone-500" };

    const firstHalfAvg = chartData.slice(0, Math.floor(chartData.length / 2)).reduce((acc, cur) => acc + cur.pazInterior, 0) / Math.floor(chartData.length / 2);
    const secondHalfAvg = chartData.slice(Math.floor(chartData.length / 2)).reduce((acc, cur) => acc + cur.pazInterior, 0) / Math.ceil(chartData.length / 2);

    if (secondHalfAvg > firstHalfAvg + 0.5) {
      return { text: "Seu índice de paz interior está crescendo. Continue cultivando a gratidão e a fé.", color: "text-green-600 dark:text-green-400" };
    }
    if (secondHalfAvg < firstHalfAvg - 0.5) {
      return { text: "Você enfrentou alguns dias de incerteza, mas a fé prevalece. Lembre-se: cada passo é um aprendizado.", color: "text-yellow-600 dark:text-yellow-400" };
    }
    return { text: "Você tem mantido um equilíbrio em sua jornada. A constância é uma virtude.", color: "text-sky-600 dark:text-sky-400" };
  }, [chartData]);


  return (
    <div className="space-y-4">
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <AreaChart
            data={chartData}
            margin={{
              top: 5,
              right: 20,
              left: -10,
              bottom: 5,
            }}
          >
            <defs>
                <linearGradient id="colorPaz" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(120, 113, 108, 0.2)" />
            <XAxis dataKey="date" tick={{ fill: 'currentColor', fontSize: 12 }} />
            <YAxis domain={[1, 10]} tick={{ fill: 'currentColor', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(28, 25, 23, 0.8)',
                borderColor: '#38bdf8',
                color: '#f5f5f4',
                borderRadius: '0.5rem',
              }}
              labelStyle={{ color: '#7dd3fc' }}
            />
            <Legend wrapperStyle={{fontSize: "14px"}}/>
            <Area type="monotone" dataKey="pazInterior" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorPaz)" strokeWidth={2} name="Índice de Paz Interior" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center px-4">
        <p className={`text-sm font-sans italic ${peaceIndexTrend.color}`}>{peaceIndexTrend.text}</p>
      </div>
    </div>
  );
};

export default ProgressChart;