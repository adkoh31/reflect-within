import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ThemeChart = ({ insights }) => {
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'Inter',
            weight: '300'
          },
          color: 'hsl(var(--foreground))'
        }
      },
      title: {
        display: true,
        text: 'Common Themes',
        color: 'hsl(var(--foreground))',
        font: {
          size: 16,
          weight: '300',
          family: 'Inter'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            family: 'Inter',
            weight: '300'
          },
          color: 'hsl(var(--muted-foreground))'
        },
        grid: {
          color: 'hsl(var(--border))'
        }
      },
      x: {
        ticks: {
          font: {
            family: 'Inter',
            weight: '300'
          },
          color: 'hsl(var(--muted-foreground))'
        },
        grid: {
          color: 'hsl(var(--border))'
        }
      }
    }
  };

  const themesData = {
    labels: insights.themes.map(t => t.name),
    datasets: [
      {
        label: 'Theme Frequency',
        data: insights.themes.map(t => t.count),
        backgroundColor: 'hsl(var(--primary) / 0.8)',
        borderColor: 'hsl(var(--primary))',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <h3 className="text-lg font-light text-foreground mb-4">Common Themes</h3>
      <div style={{ height: '300px' }}>
        <Bar data={themesData} options={chartOptions} />
      </div>
    </div>
  );
};

export default ThemeChart; 