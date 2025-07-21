import React, { useState, useMemo, useCallback } from 'react';

// Remove static imports and use dynamic imports
// import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   ArcElement,
//   RadialLinearScale,
//   Title,
//   Tooltip,
//   Legend,
//   Filler
// } from 'chart.js';

// Remove static registration
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   ArcElement,
//   RadialLinearScale,
//   Title,
//   Tooltip,
//   Legend,
//   Filler
// );

/**
 * Advanced Sentiment Trend Chart
 */
export const SentimentTrendChart = ({ sentimentData, timeRange = '7d' }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [chartComponents, setChartComponents] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamically load chart components
  React.useEffect(() => {
    const loadChartComponents = async () => {
      try {
        setIsLoading(true);
        
        const [
          { Chart: ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler },
          { Line, Bar, Doughnut, Radar }
        ] = await Promise.all([
          import('chart.js'),
          import('react-chartjs-2')
        ]);

        // Register Chart.js components
        ChartJS.register(
          CategoryScale,
          LinearScale,
          PointElement,
          LineElement,
          BarElement,
          ArcElement,
          RadialLinearScale,
          Title,
          Tooltip,
          Legend,
          Filler
        );

        setChartComponents({ Line, Bar, Doughnut, Radar });
      } catch (error) {
        console.error('Failed to load chart components:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChartComponents();
  }, []);

  const chartData = useMemo(() => {
    if (!sentimentData || sentimentData.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Filter data based on time range
    const now = new Date();
    const filteredData = sentimentData.filter(entry => {
      const entryDate = new Date(entry.date);
      const daysAgo = (now - entryDate) / (1000 * 60 * 60 * 24);
      
      switch (selectedTimeRange) {
        case '7d': return daysAgo <= 7;
        case '30d': return daysAgo <= 30;
        case '90d': return daysAgo <= 90;
        default: return true;
      }
    });

    // Group by date and calculate average sentiment
    const groupedData = filteredData.reduce((acc, entry) => {
      const date = new Date(entry.date).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { sum: 0, count: 0 };
      }
      acc[date].sum += entry.score;
      acc[date].count += 1;
      return acc;
    }, {});

    const labels = Object.keys(groupedData).sort();
    const scores = labels.map(date => 
      groupedData[date].sum / groupedData[date].count
    );

    return {
      labels,
      datasets: [
        {
          label: 'Sentiment Score',
          data: scores,
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
        }
      ]
    };
  }, [sentimentData, selectedTimeRange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-slate-400">Loading chart...</span>
        </div>
      </div>
    );
  }

  if (!chartComponents) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-red-400 mb-2">⚠️</div>
          <div className="text-sm text-slate-400">Failed to load chart</div>
        </div>
      </div>
    );
  }

  const { Line } = chartComponents;

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Sentiment Trends</h3>
        <select
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value)}
          className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>
      
      {chartData.labels.length > 0 ? (
        <Line 
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: 'white',
                bodyColor: 'white',
                borderColor: 'rgba(59, 130, 246, 0.5)',
                borderWidth: 1
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 10,
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                  color: 'rgba(255, 255, 255, 0.7)'
                }
              },
              x: {
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                  color: 'rgba(255, 255, 255, 0.7)'
                }
              }
            }
          }}
          height={300}
        />
      ) : (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-slate-400 mb-2">📊</div>
            <div className="text-sm text-slate-400">No sentiment data available</div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Topic Distribution Chart
 */
export const TopicDistributionChart = ({ topicData }) => {
  const chartData = useMemo(() => {
    if (!topicData || topicData.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Aggregate topics across all entries
    const topicCounts = {};
    topicData.forEach(entry => {
      entry.topics.forEach(topic => {
        topicCounts[topic.topic] = (topicCounts[topic.topic] || 0) + topic.relevance;
      });
    });

    const sortedTopics = Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8); // Top 8 topics

    return {
      labels: sortedTopics.map(([topic]) => topic.charAt(0).toUpperCase() + topic.slice(1)),
      datasets: [
        {
          data: sortedTopics.map(([, count]) => count),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }
      ]
    };
  }, [topicData]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true
        }
      },
      title: {
        display: true,
        text: 'Most Discussed Topics'
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Topic Distribution</h3>
      <div className="h-64">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

/**
 * Writing Patterns Radar Chart
 */
export const WritingPatternsRadar = ({ patterns }) => {
  const chartData = useMemo(() => {
    if (!patterns) {
      return {
        labels: [],
        datasets: []
      };
    }

    const metrics = {
      'Average Length': Math.min(patterns.averageLength / 100, 1),
      'Consistency': Math.min(patterns.consistency / 10, 1),
      'Complexity': Math.min(patterns.complexity / 50, 1),
      'Goal Focus': patterns.patterns?.includes('goal-focused') ? 0.8 : 0.2,
      'Reflection': patterns.patterns?.includes('reflective') ? 0.8 : 0.2,
      'Progress': patterns.patterns?.includes('progress-oriented') ? 0.8 : 0.2
    };

    return {
      labels: Object.keys(metrics),
      datasets: [
        {
          label: 'Your Patterns',
          data: Object.values(metrics),
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 2,
          pointBackgroundColor: 'rgb(75, 192, 192)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4
        }
      ]
    };
  }, [patterns]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Writing Pattern Analysis'
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 1,
        ticks: {
          stepSize: 0.2,
          callback: (value) => {
            if (value === 1) return 'High';
            if (value === 0.5) return 'Medium';
            if (value === 0) return 'Low';
            return '';
          }
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Writing Patterns</h3>
      <div className="h-64">
        <Radar data={chartData} options={options} />
      </div>
    </div>
  );
};

/**
 * Goal Progress Chart
 */
export const GoalProgressChart = ({ goalPrediction }) => {
  const chartData = useMemo(() => {
    if (!goalPrediction || !goalPrediction.factors) {
      return {
        labels: [],
        datasets: []
      };
    }

    const factors = goalPrediction.factors.slice(0, 5); // Top 5 factors

    return {
      labels: factors.map(f => f.factor.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())),
      datasets: [
        {
          label: 'Factor Score',
          data: factors.map(f => f.score),
          backgroundColor: factors.map((_, i) => 
            `hsl(${200 + i * 30}, 70%, 60%)`
          ),
          borderColor: factors.map((_, i) => 
            `hsl(${200 + i * 30}, 70%, 50%)`
          ),
          borderWidth: 1
        }
      ]
    };
  }, [goalPrediction]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: `Goal Achievement Likelihood: ${Math.round(goalPrediction?.likelihood * 100 || 0)}%`
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        ticks: {
          callback: (value) => `${Math.round(value * 100)}%`
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Goal Achievement Factors</h3>
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

/**
 * Personalized Dashboard
 */
export const PersonalizedDashboard = ({ userData, analytics }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const dashboardData = useMemo(() => {
    if (!analytics) return null;

    const { sentimentAnalysis, topicAnalysis, writingPatterns, goalPrediction, personalizedInsights } = analytics;

    return {
      sentimentAnalysis,
      topicAnalysis,
      writingPatterns,
      goalPrediction,
      personalizedInsights
    };
  }, [analytics]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'sentiment', label: 'Sentiment', icon: '😊' },
    { id: 'topics', label: 'Topics', icon: '🏷️' },
    { id: 'patterns', label: 'Patterns', icon: '📈' },
    { id: 'goals', label: 'Goals', icon: '🎯' }
  ];

  if (!dashboardData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📊</div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
              <h4 className="text-lg font-semibold mb-2">Average Sentiment</h4>
              <p className="text-3xl font-bold">
                {dashboardData.sentimentAnalysis.length > 0 
                  ? Math.round(dashboardData.sentimentAnalysis.reduce((sum, s) => sum + s.score, 0) / dashboardData.sentimentAnalysis.length * 100)
                  : 0}%
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg p-6 text-white">
              <h4 className="text-lg font-semibold mb-2">Writing Consistency</h4>
              <p className="text-3xl font-bold">
                {Math.round(dashboardData.writingPatterns?.consistency * 10) / 10}/10
              </p>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-lg p-6 text-white">
              <h4 className="text-lg font-semibold mb-2">Goal Likelihood</h4>
              <p className="text-3xl font-bold">
                {Math.round(dashboardData.goalPrediction?.likelihood * 100 || 0)}%
              </p>
            </div>

            {/* Insights */}
            <div className="md:col-span-2 lg:col-span-3">
              <h4 className="text-lg font-semibold mb-4">Personalized Insights</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData.personalizedInsights?.slice(0, 4).map((insight, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-2">{insight.title}</h5>
                    <p className="text-gray-600 text-sm">{insight.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sentiment' && (
          <SentimentTrendChart sentimentData={dashboardData.sentimentAnalysis} />
        )}

        {activeTab === 'topics' && (
          <TopicDistributionChart topicData={dashboardData.topicAnalysis} />
        )}

        {activeTab === 'patterns' && (
          <WritingPatternsRadar patterns={dashboardData.writingPatterns} />
        )}

        {activeTab === 'goals' && (
          <GoalProgressChart goalPrediction={dashboardData.goalPrediction} />
        )}
      </div>
    </div>
  );
};

/**
 * Interactive Analytics Widget
 */
export const InteractiveAnalyticsWidget = ({ data, onInsightClick }) => {
  const [selectedMetric, setSelectedMetric] = useState('sentiment');

  const metrics = [
    { id: 'sentiment', label: 'Sentiment', icon: '😊', color: 'blue' },
    { id: 'topics', label: 'Topics', icon: '🏷️', color: 'green' },
    { id: 'patterns', label: 'Patterns', icon: '📈', color: 'purple' },
    { id: 'goals', label: 'Goals', icon: '🎯', color: 'orange' }
  ];

  const renderMetricContent = () => {
    switch (selectedMetric) {
      case 'sentiment':
        return <SentimentTrendChart sentimentData={data?.sentimentAnalysis} />;
      case 'topics':
        return <TopicDistributionChart topicData={data?.topicAnalysis} />;
      case 'patterns':
        return <WritingPatternsRadar patterns={data?.writingPatterns} />;
      case 'goals':
        return <GoalProgressChart goalPrediction={data?.goalPrediction} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Metric Selector */}
      <div className="flex border-b border-gray-200">
        {metrics.map(metric => (
          <button
            key={metric.id}
            onClick={() => setSelectedMetric(metric.id)}
            className={`flex-1 py-3 px-4 text-center transition-colors ${
              selectedMetric === metric.id
                ? `bg-${metric.color}-50 border-b-2 border-${metric.color}-500 text-${metric.color}-700`
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-lg mr-2">{metric.icon}</span>
            <span className="font-medium">{metric.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {renderMetricContent()}
      </div>

      {/* Action Buttons */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <button
            onClick={() => onInsightClick?.('export')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Export Data
          </button>
          <button
            onClick={() => onInsightClick?.('share')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Share Insights
          </button>
        </div>
      </div>
    </div>
  );
}; 