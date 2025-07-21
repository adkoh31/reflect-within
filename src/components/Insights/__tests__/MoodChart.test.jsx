import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { jest, describe, it, expect } from '@jest/globals';
import MoodChart from '../MoodChart';

// Mock Chart.js components
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  BarElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
}));

jest.mock('react-chartjs-2', () => ({
  Bar: ({ data, options }) => (
    <div data-testid="bar-chart">
      <div>Chart Title: {options?.plugins?.title?.text || 'Mood Trends'}</div>
      <div>Labels: {data?.labels?.join(', ') || ''}</div>
      <div>Data: {data?.datasets?.[0]?.data?.join(', ') || ''}</div>
    </div>
  ),
}));

describe('MoodChart Component', () => {
  it('renders chart with correct title and labels', async () => {
    const insights = {
      moods: [
        { mood: 'happy', count: 5 },
        { mood: 'stressed', count: 3 }
      ]
    };
    
    render(<MoodChart insights={insights} />);
    
    // Wait for the chart to load
    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Chart Title: Mood Trends')).toBeInTheDocument();
    expect(screen.getByText('Labels: Happy, Stressed')).toBeInTheDocument();
  });

  it('renders with empty moods data', async () => {
    const insights = { moods: [] };
    render(<MoodChart insights={insights} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
    
    expect(screen.getByText((content) => content.trim().startsWith('Labels:'))).toBeInTheDocument();
    expect(screen.getByText((content) => content.trim().startsWith('Data:'))).toBeInTheDocument();
  });

  it('renders without insights prop', async () => {
    render(<MoodChart />);
    
    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });
}); 