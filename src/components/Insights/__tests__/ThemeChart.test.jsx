import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThemeChart from '../ThemeChart';

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Bar: ({ data, options }) => (
    <div data-testid="chart-bar" data-chart-data={JSON.stringify(data)} data-chart-options={JSON.stringify(options)}>
      Chart Component
    </div>
  ),
}));

// Mock chart.js
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: 'CategoryScale',
  LinearScale: 'LinearScale',
  BarElement: 'BarElement',
  Title: 'Title',
  Tooltip: 'Tooltip',
  Legend: 'Legend',
}));

describe('ThemeChart', () => {
  const mockInsights = {
    themes: [
      { name: 'Gratitude', count: 5 },
      { name: 'Stress', count: 3 },
      { name: 'Goals', count: 2 },
      { name: 'Relationships', count: 4 },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders with theme data', () => {
      render(<ThemeChart insights={mockInsights} />);
      
      expect(screen.getByText('Common Themes')).toBeInTheDocument();
      expect(screen.getByTestId('chart-bar')).toBeInTheDocument();
    });

    test('renders with empty themes array', () => {
      const emptyInsights = { themes: [] };
      render(<ThemeChart insights={emptyInsights} />);
      
      expect(screen.getByText('Common Themes')).toBeInTheDocument();
      expect(screen.getByTestId('chart-bar')).toBeInTheDocument();
    });

    test('renders with single theme', () => {
      const singleTheme = { themes: [{ name: 'Gratitude', count: 1 }] };
      render(<ThemeChart insights={singleTheme} />);
      
      expect(screen.getByText('Common Themes')).toBeInTheDocument();
      expect(screen.getByTestId('chart-bar')).toBeInTheDocument();
    });
  });

  describe('Chart Configuration', () => {
    test('passes correct data to chart component', () => {
      render(<ThemeChart insights={mockInsights} />);
      
      const chartElement = screen.getByTestId('chart-bar');
      const chartData = JSON.parse(chartElement.getAttribute('data-chart-data'));
      
      expect(chartData.labels).toEqual(['Gratitude', 'Stress', 'Goals', 'Relationships']);
      expect(chartData.datasets[0].data).toEqual([5, 3, 2, 4]);
      expect(chartData.datasets[0].label).toBe('Theme Frequency');
    });

    test('passes chart options with correct configuration', () => {
      render(<ThemeChart insights={mockInsights} />);
      
      const chartElement = screen.getByTestId('chart-bar');
      const chartOptions = JSON.parse(chartElement.getAttribute('data-chart-options'));
      
      expect(chartOptions.responsive).toBe(true);
      expect(chartOptions.plugins.title.display).toBe(true);
      expect(chartOptions.plugins.title.text).toBe('Common Themes');
      expect(chartOptions.scales.y.beginAtZero).toBe(true);
      expect(chartOptions.scales.y.ticks.stepSize).toBe(1);
    });

    test('configures chart styling correctly', () => {
      render(<ThemeChart insights={mockInsights} />);
      
      const chartElement = screen.getByTestId('chart-bar');
      const chartOptions = JSON.parse(chartElement.getAttribute('data-chart-options'));
      
      // Check font configuration
      expect(chartOptions.plugins.legend.labels.font.family).toBe('Inter');
      expect(chartOptions.plugins.legend.labels.font.weight).toBe('300');
      expect(chartOptions.plugins.title.font.family).toBe('Inter');
      expect(chartOptions.plugins.title.font.weight).toBe('300');
      
      // Check color configuration
      expect(chartOptions.plugins.legend.labels.color).toBe('hsl(var(--foreground))');
      expect(chartOptions.plugins.title.color).toBe('hsl(var(--foreground))');
    });
  });

  describe('Dataset Configuration', () => {
    test('configures dataset with correct styling', () => {
      render(<ThemeChart insights={mockInsights} />);
      
      const chartElement = screen.getByTestId('chart-bar');
      const chartData = JSON.parse(chartElement.getAttribute('data-chart-data'));
      const dataset = chartData.datasets[0];
      
      expect(dataset.backgroundColor).toBe('hsl(var(--primary) / 0.8)');
      expect(dataset.borderColor).toBe('hsl(var(--primary))');
      expect(dataset.borderWidth).toBe(1);
    });

    test('handles themes with zero count', () => {
      const insightsWithZero = {
        themes: [
          { name: 'Gratitude', count: 0 },
          { name: 'Stress', count: 3 },
        ],
      };
      render(<ThemeChart insights={insightsWithZero} />);
      
      const chartElement = screen.getByTestId('chart-bar');
      const chartData = JSON.parse(chartElement.getAttribute('data-chart-data'));
      
      expect(chartData.datasets[0].data).toEqual([0, 3]);
    });
  });

  describe('Container and Layout', () => {
    test('renders with correct container classes', () => {
      render(<ThemeChart insights={mockInsights} />);
      
      const container = screen.getByText('Common Themes').closest('div');
      expect(container).toHaveClass('bg-card', 'rounded-2xl', 'border', 'border-border', 'p-6');
    });

    test('renders chart with fixed height', () => {
      render(<ThemeChart insights={mockInsights} />);
      
      const chartContainer = screen.getByTestId('chart-bar').parentElement;
      expect(chartContainer).toHaveStyle({ height: '300px' });
    });

    test('renders heading with correct styling', () => {
      render(<ThemeChart insights={mockInsights} />);
      
      const heading = screen.getByText('Common Themes');
      expect(heading).toHaveClass('text-lg', 'font-light', 'text-foreground', 'mb-4');
    });
  });

  describe('Edge Cases', () => {
    test('handles missing insights prop gracefully', () => {
      render(<ThemeChart />);
      
      expect(screen.getByText('Common Themes')).toBeInTheDocument();
      expect(screen.getByTestId('chart-bar')).toBeInTheDocument();
    });

    test('handles insights with missing themes property', () => {
      render(<ThemeChart insights={{}} />);
      
      expect(screen.getByText('Common Themes')).toBeInTheDocument();
      expect(screen.getByTestId('chart-bar')).toBeInTheDocument();
    });

    test('handles themes with missing properties', () => {
      const incompleteThemes = {
        themes: [
          { name: 'Gratitude' }, // missing count
          { count: 3 }, // missing name
          { name: 'Goals', count: 2 },
        ],
      };
      render(<ThemeChart insights={incompleteThemes} />);
      
      expect(screen.getByText('Common Themes')).toBeInTheDocument();
      expect(screen.getByTestId('chart-bar')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has semantic heading structure', () => {
      render(<ThemeChart insights={mockInsights} />);
      
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Common Themes');
    });

    test('chart container has appropriate role', () => {
      render(<ThemeChart insights={mockInsights} />);
      
      const chartContainer = screen.getByTestId('chart-bar');
      expect(chartContainer).toBeInTheDocument();
    });
  });
}); 