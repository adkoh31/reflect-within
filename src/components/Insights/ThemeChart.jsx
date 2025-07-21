import React, { useState, useEffect } from 'react';

// Remove static imports and use dynamic imports
// import { Bar } from 'react-chartjs-2';
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

const ThemeChart = ({ data, timeRange = '7d' }) => {
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadChart = async () => {
      try {
        setIsLoading(true);
        
        // Dynamically import Chart.js and react-chartjs-2
        const [
          { Chart: ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend },
          { Bar }
        ] = await Promise.all([
          import('chart.js'),
          import('react-chartjs-2')
        ]);

        // Register Chart.js components
        ChartJS.register(
          CategoryScale,
          LinearScale,
          BarElement,
          Title,
          Tooltip,
          Legend
        );

        // Process data and create chart
        const processedData = processThemeData(data, timeRange);
        setChartData(processedData);
      } catch (err) {
        console.error('Failed to load chart:', err);
        setError('Failed to load chart');
      } finally {
        setIsLoading(false);
      }
    };

    loadChart();
  }, [data, timeRange]);

  const processThemeData = (data, timeRange) => {
    if (!data || data.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Filter data based on time range
    const now = new Date();
    const filteredData = data.filter(entry => {
      const entryDate = new Date(entry.date);
      const daysAgo = (now - entryDate) / (1000 * 60 * 60 * 24);
      
      switch (timeRange) {
        case '7d': return daysAgo <= 7;
        case '30d': return daysAgo <= 30;
        case '90d': return daysAgo <= 90;
        default: return true;
      }
    });

    // Count themes
    const themeCounts = {};
    filteredData.forEach(entry => {
      if (entry.themes && Array.isArray(entry.themes)) {
        entry.themes.forEach(theme => {
          themeCounts[theme] = (themeCounts[theme] || 0) + 1;
        });
      }
    });

    // Sort by count and take top 10
    const sortedThemes = Object.entries(themeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    const labels = sortedThemes.map(([theme]) => theme);
    const counts = sortedThemes.map(([, count]) => count);

    return {
      labels,
      datasets: [
        {
          label: 'Theme Frequency',
          data: counts,
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }
      ]
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-slate-400">Loading chart...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-red-400 mb-2">⚠️</div>
          <div className="text-sm text-slate-400">{error}</div>
        </div>
      </div>
    );
  }

  if (!chartData || chartData.labels.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-slate-400 mb-2">📊</div>
          <div className="text-sm text-slate-400">No theme data available</div>
        </div>
      </div>
    );
  }

  // Dynamically import Bar component when needed
  const Bar = React.lazy(() => import('react-chartjs-2').then(module => ({ default: module.Bar })));

  return (
    <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-slate-50 mb-4">Reflection Themes</h3>
      <React.Suspense fallback={
        <div className="flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <div className="h-64 sm:h-80"> {/* Fixed height for better mobile experience */}
        <Bar 
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
              interaction: {
                mode: 'nearest',
                axis: 'y',
                intersect: false
              },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                titleColor: 'white',
                bodyColor: 'white',
                borderColor: 'rgba(34, 197, 94, 0.5)',
                  borderWidth: 1,
                  cornerRadius: 8,
                  displayColors: false,
                  titleFont: {
                    size: 14,
                    weight: 'bold'
                  },
                  bodyFont: {
                    size: 13
                  },
                  padding: 12,
                  // Mobile-friendly tooltip positioning
                  position: 'nearest'
              }
            },
            scales: {
              x: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                    drawBorder: false
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.7)',
                    font: {
                      size: 12
                    },
                    padding: 8
                }
              },
              y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                    drawBorder: false
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.7)',
                    font: {
                      size: 11
                    },
                    padding: 8,
                    // Limit label length for mobile
                    callback: function(value, index) {
                      const label = this.getLabelForValue(value);
                      return label.length > 15 ? label.substring(0, 15) + '...' : label;
                }
              }
            }
              },
              elements: {
                bar: {
                  borderRadius: 4,
                  borderSkipped: false,
                }
              }
            }}
        />
        </div>
      </React.Suspense>
    </div>
  );
};

export default ThemeChart; 