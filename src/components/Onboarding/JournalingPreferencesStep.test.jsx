import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import JournalingPreferencesStep from './JournalingPreferencesStep';

const frequencyTitles = ['Daily', 'Weekly', 'When Inspired'];
const frequencyDescriptions = [
  'Journal every day for consistent reflection',
  'Reflect once or twice a week',
  'Journal when you feel motivated',
];
const reminderLabels = ['Daily reminders', 'Weekly summaries', 'Progress insights'];

function setup(props = {}) {
  const onDataUpdate = jest.fn();
  render(
    <JournalingPreferencesStep
      onDataUpdate={onDataUpdate}
      user={{ id: 'user1' }}
      {...props}
    />
  );
  return { onDataUpdate };
}

describe('JournalingPreferencesStep', () => {
  it('renders all frequency options with correct titles and descriptions', () => {
    setup();
    frequencyTitles.forEach((title) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
    frequencyDescriptions.forEach((desc) => {
      expect(screen.getByText(desc)).toBeInTheDocument();
    });
  });

  it('renders all reminder options with correct labels', () => {
    setup();
    reminderLabels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('defaults to daily frequency and daily reminder if no initialData', () => {
    setup();
    const dailyCard = screen.getByText('Daily').closest('button');
    expect(dailyCard).toHaveClass('border-cyan-400');
    const dailyReminder = screen.getByText('Daily reminders').closest('button');
    expect(dailyReminder).toHaveClass('border-cyan-400');
  });

  it('uses initialData if provided', () => {
    setup({ initialData: { journalingFrequency: 'weekly', reminders: ['weekly', 'insights'] } });
    const weeklyCard = screen.getByText('Weekly').closest('button');
    expect(weeklyCard).toHaveClass('border-cyan-400');
    expect(screen.getByText('Weekly summaries').closest('button')).toHaveClass('border-cyan-400');
    expect(screen.getByText('Progress insights').closest('button')).toHaveClass('border-cyan-400');
    // Daily should not be selected
    expect(screen.getByText('Daily').closest('button')).not.toHaveClass('border-cyan-400');
  });

  it('calls onDataUpdate with correct frequency when a frequency is selected', () => {
    const { onDataUpdate } = setup();
    const weeklyCard = screen.getByText('Weekly').closest('button');
    fireEvent.click(weeklyCard);
    expect(onDataUpdate).toHaveBeenLastCalledWith({ journalingFrequency: 'weekly', reminders: ['daily'] });
  });

  it('only allows one frequency to be selected at a time', () => {
    setup();
    const dailyCard = screen.getByText('Daily').closest('button');
    const weeklyCard = screen.getByText('Weekly').closest('button');
    fireEvent.click(weeklyCard);
    expect(weeklyCard).toHaveClass('border-cyan-400');
    expect(dailyCard).not.toHaveClass('border-cyan-400');
  });

  it('shows "Recommended" badge only for Daily', () => {
    setup();
    expect(screen.getByText('Recommended')).toBeInTheDocument();
    expect(screen.getByText('Recommended').closest('button')).toEqual(screen.getByText('Daily').closest('button'));
  });

  it('toggles reminders and calls onDataUpdate with correct reminders array', () => {
    const { onDataUpdate } = setup();
    const weeklyReminder = screen.getByText('Weekly summaries').closest('button');
    fireEvent.click(weeklyReminder);
    expect(onDataUpdate).toHaveBeenLastCalledWith({ journalingFrequency: 'daily', reminders: ['daily', 'weekly'] });
    // Toggle off daily
    const dailyReminder = screen.getByText('Daily reminders').closest('button');
    fireEvent.click(dailyReminder);
    expect(onDataUpdate).toHaveBeenLastCalledWith({ journalingFrequency: 'daily', reminders: ['weekly'] });
  });

  it('allows multiple reminders to be selected', () => {
    setup();
    const weeklyReminder = screen.getByText('Weekly summaries').closest('button');
    const insightsReminder = screen.getByText('Progress insights').closest('button');
    fireEvent.click(weeklyReminder);
    fireEvent.click(insightsReminder);
    expect(weeklyReminder).toHaveClass('border-cyan-400');
    expect(insightsReminder).toHaveClass('border-cyan-400');
  });

  it('visual state matches reminders selection', () => {
    setup({ initialData: { reminders: ['weekly'] } });
    const weeklyReminder = screen.getByText('Weekly summaries').closest('button');
    expect(weeklyReminder).toHaveClass('border-cyan-400');
    const dailyReminder = screen.getByText('Daily reminders').closest('button');
    expect(dailyReminder).not.toHaveClass('border-cyan-400');
  });

  it('handles empty initialData gracefully', () => {
    setup({ initialData: {} });
    expect(screen.getByText('Daily').closest('button')).toHaveClass('border-cyan-400');
    expect(screen.getByText('Daily reminders').closest('button')).toHaveClass('border-cyan-400');
  });

  it('handles all reminders toggled off', () => {
    setup({ initialData: { reminders: [] } });
    reminderLabels.forEach((label) => {
      expect(screen.getByText(label).closest('button')).not.toHaveClass('border-cyan-400');
    });
  });

  it('all frequency and reminder buttons are focusable', () => {
    setup();
    frequencyTitles.forEach((title) => {
      expect(screen.getByText(title).closest('button')).toHaveAttribute('tabindex');
    });
    reminderLabels.forEach((label) => {
      expect(screen.getByText(label).closest('button')).toHaveAttribute('tabindex');
    });
  });

  it('calls onDataUpdate on every change', () => {
    const { onDataUpdate } = setup();
    const weeklyCard = screen.getByText('Weekly').closest('button');
    fireEvent.click(weeklyCard);
    expect(onDataUpdate).toHaveBeenCalledWith({ journalingFrequency: 'weekly', reminders: ['daily'] });
    const insightsReminder = screen.getByText('Progress insights').closest('button');
    fireEvent.click(insightsReminder);
    expect(onDataUpdate).toHaveBeenLastCalledWith({ journalingFrequency: 'weekly', reminders: ['daily', 'insights'] });
  });
}); 