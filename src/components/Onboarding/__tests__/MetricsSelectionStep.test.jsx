import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MetricsSelectionStep from '../MetricsSelectionStep.jsx';

const metricsByCategory = {
  physical: ['Weight', 'Workouts', 'Sleep', 'Nutrition'],
  mental: ['Mood', 'Stress', 'Energy', 'Meditation'],
  growth: ['Goals', 'Habits', 'Learning', 'Productivity'],
  lifestyle: ['Routine', 'Social', 'Creative', 'Balance']
};

describe('MetricsSelectionStep', () => {
  const mockOnDataUpdate = jest.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows empty state if no focus areas selected', () => {
    render(<MetricsSelectionStep onDataUpdate={mockOnDataUpdate} initialData={{ focusAreas: [] }} />);
    expect(screen.getByText('No Focus Areas Selected')).toBeInTheDocument();
    expect(screen.getByText('Please go back and select at least one focus area to see relevant metrics.')).toBeInTheDocument();
  });

  test('renders metrics for selected focus areas', () => {
    render(<MetricsSelectionStep onDataUpdate={mockOnDataUpdate} initialData={{ focusAreas: ['physical', 'mental'] }} />);
    // Category headers
    expect(screen.getByText('Physical Health')).toBeInTheDocument();
    expect(screen.getByText('Mental Wellness')).toBeInTheDocument();
    // Some metrics
    expect(screen.getByText('Weight')).toBeInTheDocument();
    expect(screen.getByText('Mood')).toBeInTheDocument();
  });

  test('shows correct selection count per category', async () => {
    render(<MetricsSelectionStep onDataUpdate={mockOnDataUpdate} initialData={{ focusAreas: ['physical'] }} />);
    expect(screen.getByText('0 of 4 selected')).toBeInTheDocument();
    // Select a metric
    await user.click(screen.getByRole('button', { name: /weight/i }));
    expect(screen.getByText('1 of 4 selected')).toBeInTheDocument();
  });

  test('toggles metric selection and calls onDataUpdate', async () => {
    render(<MetricsSelectionStep onDataUpdate={mockOnDataUpdate} initialData={{ focusAreas: ['physical'] }} />);
    const weightBtn = screen.getByRole('button', { name: /weight/i });
    // Select
    await user.click(weightBtn);
    expect(mockOnDataUpdate).toHaveBeenCalledWith({ selectedMetrics: { physical: ['weight'] } });
    // Deselect
    await user.click(weightBtn);
    expect(mockOnDataUpdate).toHaveBeenCalledWith({ selectedMetrics: { physical: [] } });
  });

  test('can select multiple metrics in a category', async () => {
    render(<MetricsSelectionStep onDataUpdate={mockOnDataUpdate} initialData={{ focusAreas: ['physical'] }} />);
    const weightBtn = screen.getByRole('button', { name: /weight/i });
    const sleepBtn = screen.getByRole('button', { name: /sleep/i });
    await user.click(weightBtn);
    await user.click(sleepBtn);
    expect(mockOnDataUpdate).toHaveBeenLastCalledWith({ selectedMetrics: { physical: ['weight', 'sleep'] } });
    expect(screen.getByText('2 of 4 selected')).toBeInTheDocument();
  });

  test('can select metrics in multiple categories', async () => {
    render(<MetricsSelectionStep onDataUpdate={mockOnDataUpdate} initialData={{ focusAreas: ['physical', 'mental'] }} />);
    const weightBtn = screen.getByRole('button', { name: /weight/i });
    const moodBtn = screen.getByRole('button', { name: /mood/i });
    await user.click(weightBtn);
    await user.click(moodBtn);
    expect(mockOnDataUpdate).toHaveBeenLastCalledWith({ selectedMetrics: { physical: ['weight'], mental: ['mood'] } });
  });

  test('shows correct helper text for 0, 1, and multiple selected metrics', async () => {
    render(<MetricsSelectionStep onDataUpdate={mockOnDataUpdate} initialData={{ focusAreas: ['physical'] }} />);
    expect(screen.getByText('Select at least one metric to continue')).toBeInTheDocument();
    const weightBtn = screen.getByRole('button', { name: /weight/i });
    await user.click(weightBtn);
    expect(screen.getByText('1 metric selected')).toBeInTheDocument();
    const sleepBtn = screen.getByRole('button', { name: /sleep/i });
    await user.click(sleepBtn);
    expect(screen.getByText('2 metrics selected')).toBeInTheDocument();
  });

  test('renders all metrics for all focus areas', () => {
    render(<MetricsSelectionStep onDataUpdate={mockOnDataUpdate} initialData={{ focusAreas: ['physical', 'mental', 'growth', 'lifestyle'] }} />);
    Object.values(metricsByCategory).flat().forEach(metric => {
      expect(screen.getByText(metric)).toBeInTheDocument();
    });
  });

  test('preserves initial selected metrics', () => {
    render(
      <MetricsSelectionStep
        onDataUpdate={mockOnDataUpdate}
        initialData={{
          focusAreas: ['physical', 'mental'],
          selectedMetrics: { physical: ['weight'], mental: ['mood', 'stress'] }
        }}
      />
    );
    // Check selection counts
    expect(screen.getByText('1 of 4 selected')).toBeInTheDocument(); // physical
    expect(screen.getByText('2 of 4 selected')).toBeInTheDocument(); // mental
  });

  test('metric buttons are accessible and have correct labels', () => {
    render(<MetricsSelectionStep onDataUpdate={mockOnDataUpdate} initialData={{ focusAreas: ['physical'] }} />);
    expect(screen.getByRole('button', { name: /weight/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /workouts/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sleep/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /nutrition/i })).toBeInTheDocument();
  });

  test('category headers are accessible', () => {
    render(<MetricsSelectionStep onDataUpdate={mockOnDataUpdate} initialData={{ focusAreas: ['growth'] }} />);
    expect(screen.getByText('Personal Growth')).toBeInTheDocument();
    expect(screen.getByText('0 of 4 selected')).toBeInTheDocument();
  });

  test('handles edge case: all metrics selected then deselected', async () => {
    render(<MetricsSelectionStep onDataUpdate={mockOnDataUpdate} initialData={{ focusAreas: ['physical'] }} />);
    const buttons = ['weight', 'workouts', 'sleep', 'nutrition'].map(m => screen.getByRole('button', { name: new RegExp(m, 'i') }));
    // Select all
    for (const btn of buttons) await user.click(btn);
    expect(screen.getByText('4 of 4 selected')).toBeInTheDocument();
    // Deselect all
    for (const btn of buttons) await user.click(btn);
    expect(screen.getByText('0 of 4 selected')).toBeInTheDocument();
  });
}); 