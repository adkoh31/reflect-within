import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FocusAreasStep from './FocusAreasStep';

const focusAreaTitles = ['Physical Health', 'Mental Wellness', 'Personal Growth', 'Lifestyle & Habits'];
const focusAreaDescriptions = [
  'Track workouts, nutrition, sleep, and body metrics',
  'Monitor mood, stress, energy, and emotional patterns',
  'Focus on goals, habits, learning, and self-improvement',
  'Track routines, balance, relationships, and daily patterns',
];

function setup(props = {}) {
  const onDataUpdate = jest.fn();
  render(
    <FocusAreasStep
      onDataUpdate={onDataUpdate}
      user={{ id: 'user1' }}
      {...props}
    />
  );
  return { onDataUpdate };
}

describe('FocusAreasStep', () => {
  it('renders all focus areas with correct titles and descriptions', () => {
    setup();
    focusAreaTitles.forEach((title) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
    focusAreaDescriptions.forEach((desc) => {
      expect(screen.getByText(desc)).toBeInTheDocument();
    });
  });

  it('shows helper text prompting selection when none selected', () => {
    setup();
    expect(screen.getByText('Select at least one area to continue')).toBeInTheDocument();
  });

  it('defaults to empty selection if no initialData', () => {
    setup();
    focusAreaTitles.forEach((title) => {
      expect(screen.getByText(title).closest('button')).not.toHaveClass('border-cyan-400');
    });
  });

  it('uses initialData if provided', () => {
    setup({ initialData: { focusAreas: ['physical', 'mental'] } });
    expect(screen.getByText('Physical Health').closest('button')).toHaveClass('border-cyan-400');
    expect(screen.getByText('Mental Wellness').closest('button')).toHaveClass('border-cyan-400');
    expect(screen.getByText('Personal Growth').closest('button')).not.toHaveClass('border-cyan-400');
  });

  it('toggles area selection and calls onDataUpdate with correct array', () => {
    const { onDataUpdate } = setup();
    const physicalButton = screen.getByText('Physical Health').closest('button');
    fireEvent.click(physicalButton);
    expect(onDataUpdate).toHaveBeenLastCalledWith({ focusAreas: ['physical'] });
    // Toggle off
    fireEvent.click(physicalButton);
    expect(onDataUpdate).toHaveBeenLastCalledWith({ focusAreas: [] });
  });

  it('allows multiple areas to be selected', () => {
    const { onDataUpdate } = setup();
    const physicalButton = screen.getByText('Physical Health').closest('button');
    const mentalButton = screen.getByText('Mental Wellness').closest('button');
    fireEvent.click(physicalButton);
    fireEvent.click(mentalButton);
    expect(onDataUpdate).toHaveBeenLastCalledWith({ focusAreas: ['physical', 'mental'] });
  });

  it('visual state matches area selection', () => {
    setup({ initialData: { focusAreas: ['growth'] } });
    expect(screen.getByText('Personal Growth').closest('button')).toHaveClass('border-cyan-400');
    expect(screen.getByText('Physical Health').closest('button')).not.toHaveClass('border-cyan-400');
  });

  it('shows correct helper text for single area selected', () => {
    setup({ initialData: { focusAreas: ['physical'] } });
    expect(screen.getByText('1 area selected')).toBeInTheDocument();
  });

  it('shows correct helper text for multiple areas selected', () => {
    setup({ initialData: { focusAreas: ['physical', 'mental', 'growth'] } });
    expect(screen.getByText('3 areas selected')).toBeInTheDocument();
  });

  it('handles empty initialData gracefully', () => {
    setup({ initialData: {} });
    expect(screen.getByText('Select at least one area to continue')).toBeInTheDocument();
    focusAreaTitles.forEach((title) => {
      expect(screen.getByText(title).closest('button')).not.toHaveClass('border-cyan-400');
    });
  });

  it('handles all areas toggled off', () => {
    setup({ initialData: { focusAreas: [] } });
    expect(screen.getByText('Select at least one area to continue')).toBeInTheDocument();
    focusAreaTitles.forEach((title) => {
      expect(screen.getByText(title).closest('button')).not.toHaveClass('border-cyan-400');
    });
  });

  it('all focus area buttons are focusable', () => {
    setup();
    focusAreaTitles.forEach((title) => {
      expect(screen.getByText(title).closest('button')).toHaveAttribute('tabindex');
    });
  });

  it('calls onDataUpdate on every change', () => {
    const { onDataUpdate } = setup();
    const physicalButton = screen.getByText('Physical Health').closest('button');
    const mentalButton = screen.getByText('Mental Wellness').closest('button');
    fireEvent.click(physicalButton);
    expect(onDataUpdate).toHaveBeenCalledWith({ focusAreas: ['physical'] });
    fireEvent.click(mentalButton);
    expect(onDataUpdate).toHaveBeenLastCalledWith({ focusAreas: ['physical', 'mental'] });
  });
}); 