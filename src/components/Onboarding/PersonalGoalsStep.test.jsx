import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PersonalGoalsStep from './PersonalGoalsStep';

function setup(props = {}) {
  const onDataUpdate = jest.fn();
  render(
    <PersonalGoalsStep
      onDataUpdate={onDataUpdate}
      user={{ id: 'user1' }}
      {...props}
    />
  );
  return { onDataUpdate };
}

describe('PersonalGoalsStep', () => {
  it('renders empty state when no goals', () => {
    setup();
    expect(screen.getByText('No goals added yet. Add your first goal to get started!')).toBeInTheDocument();
    expect(screen.getByText('Add a goal')).toBeInTheDocument();
  });

  it('renders goals list when goals exist', () => {
    const goals = [
      { id: 1, title: 'Improve mood', description: 'Stay positive' },
      { id: 2, title: 'Exercise daily' }
    ];
    setup({ initialData: { personalGoals: goals } });
    expect(screen.getByText('Improve mood')).toBeInTheDocument();
    expect(screen.getByText('Stay positive')).toBeInTheDocument();
    expect(screen.getByText('Exercise daily')).toBeInTheDocument();
  });

  it('defaults to empty goals if no initialData', () => {
    setup();
    expect(screen.getByText('No goals added yet. Add your first goal to get started!')).toBeInTheDocument();
  });

  it('uses initialData if provided', () => {
    const goals = [{ id: 1, title: 'Test goal' }];
    setup({ initialData: { personalGoals: goals } });
    expect(screen.getByText('Test goal')).toBeInTheDocument();
  });

  it('shows add goal form when button is clicked', () => {
    setup();
    const addButton = screen.getByText('Add a goal');
    fireEvent.click(addButton);
    expect(screen.getByLabelText('Goal Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description (optional)')).toBeInTheDocument();
  });

  it('has form inputs with proper labels', () => {
    setup();
    const addButton = screen.getByText('Add a goal');
    fireEvent.click(addButton);
    expect(screen.getByLabelText('Goal Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description (optional)')).toBeInTheDocument();
  });

  it('Add Goal button is disabled when title is empty', () => {
    setup();
    const addButton = screen.getByText('Add a goal');
    fireEvent.click(addButton);
    const addGoalButton = screen.getByText('Add Goal');
    expect(addGoalButton).toBeDisabled();
  });

  it('Add Goal button is enabled when title is filled', () => {
    setup();
    const addButton = screen.getByText('Add a goal');
    fireEvent.click(addButton);
    const titleInput = screen.getByLabelText('Goal Title');
    fireEvent.change(titleInput, { target: { value: 'Test goal' } });
    const addGoalButton = screen.getByText('Add Goal');
    expect(addGoalButton).not.toBeDisabled();
  });

  it('adds goal and calls onDataUpdate with correct data', () => {
    const { onDataUpdate } = setup();
    const addButton = screen.getByText('Add a goal');
    fireEvent.click(addButton);
    
    const titleInput = screen.getByLabelText('Goal Title');
    const descriptionInput = screen.getByLabelText('Description (optional)');
    
    fireEvent.change(titleInput, { target: { value: 'Test goal' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } });
    
    const addGoalButton = screen.getByText('Add Goal');
    fireEvent.click(addGoalButton);
    
    expect(onDataUpdate).toHaveBeenCalledWith({
      personalGoals: expect.arrayContaining([
        expect.objectContaining({
          title: 'Test goal',
          description: 'Test description'
        })
      ])
    });
  });

  it('removes goal and calls onDataUpdate', () => {
    const goals = [{ id: 1, title: 'Test goal' }];
    const { onDataUpdate } = setup({ initialData: { personalGoals: goals } });
    
    // Find and click the remove button (X)
    const removeButton = screen.getByRole('button', { name: /remove goal: test goal/i });
    fireEvent.click(removeButton);
    
    expect(onDataUpdate).toHaveBeenCalledWith({ personalGoals: [] });
  });

  it('cancel button hides form and resets inputs', () => {
    setup();
    const addButton = screen.getByText('Add a goal');
    fireEvent.click(addButton);
    
    const titleInput = screen.getByLabelText('Goal Title');
    const descriptionInput = screen.getByLabelText('Description (optional)');
    
    fireEvent.change(titleInput, { target: { value: 'Test goal' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } });
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(screen.queryByLabelText('Goal Title')).not.toBeInTheDocument();
    expect(screen.getByText('Add a goal')).toBeInTheDocument();
  });

  it('shows correct helper text for no goals', () => {
    setup();
    expect(screen.getByText('You can always add goals later in your profile')).toBeInTheDocument();
  });

  it('shows correct helper text for single goal', () => {
    const goals = [{ id: 1, title: 'Test goal' }];
    setup({ initialData: { personalGoals: goals } });
    expect(screen.getByText('1 goal added')).toBeInTheDocument();
  });

  it('shows correct helper text for multiple goals', () => {
    const goals = [
      { id: 1, title: 'Goal 1' },
      { id: 2, title: 'Goal 2' }
    ];
    setup({ initialData: { personalGoals: goals } });
    expect(screen.getByText('2 goals added')).toBeInTheDocument();
  });

  it('handles empty initialData gracefully', () => {
    setup({ initialData: {} });
    expect(screen.getByText('No goals added yet. Add your first goal to get started!')).toBeInTheDocument();
  });

  it('handles goals without descriptions', () => {
    const goals = [{ id: 1, title: 'Goal without description' }];
    setup({ initialData: { personalGoals: goals } });
    expect(screen.getByText('Goal without description')).toBeInTheDocument();
  });

  it('all buttons are accessible', () => {
    setup();
    const addButton = screen.getByText('Add a goal').closest('button');
    expect(addButton).toBeInTheDocument();
    expect(addButton.tagName).toBe('BUTTON');
  });
}); 