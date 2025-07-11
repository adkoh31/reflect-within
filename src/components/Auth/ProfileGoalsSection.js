import React, { useState } from 'react';
import { useGoals } from '../../hooks/useGoals';
import GoalSettingStep from '../Onboarding/GoalSettingStep';
import { Edit3, CheckCircle } from 'lucide-react';

const ProfileGoalsSection = ({ user }) => {
  const { goals, saveGoals } = useGoals(user);
  const [isEditing, setIsEditing] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => setIsEditing(false);
  const handleSave = (goalData) => {
    saveGoals(goalData);
    setIsEditing(false);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  if (!user) return null;

  if (isEditing) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6 mt-6 max-h-[70vh] overflow-y-auto">
        <GoalSettingStep
          onComplete={handleSave}
          onBack={handleCancel}
          user={user}
        />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-base font-semibold text-foreground">My Goals</h4>
        <button
          onClick={handleEdit}
          className="flex items-center gap-1 px-3 py-2 text-sm bg-muted hover:bg-accent rounded-lg text-muted-foreground hover:text-accent-foreground transition-colors"
        >
          <Edit3 className="w-4 h-4" /> Edit
        </button>
      </div>
      {showSaved && (
        <div className="flex items-center gap-2 mb-3 text-green-600 bg-green-50 rounded-lg px-3 py-2">
          <CheckCircle className="w-4 h-4" />
          <span>Goals updated!</span>
        </div>
      )}
      {goals ? (
        <div className="space-y-4">
          <div>
            <span className="text-sm text-muted-foreground font-light">Focus Areas</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {goals.categories?.map((cat) => (
                <span key={cat} className="px-3 py-1 bg-cyan-500/10 text-cyan-700 rounded-full text-xs font-medium">
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-sm text-muted-foreground font-light">Metrics</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {Object.entries(goals.metrics || {}).map(([cat, metrics]) =>
                metrics.map((metric) => (
                  <span key={cat + '-' + metric} className="px-3 py-1 bg-blue-500/10 text-blue-700 rounded-full text-xs font-medium">
                    {metric.charAt(0).toUpperCase() + metric.slice(1)}
                  </span>
                ))
              )}
            </div>
          </div>
          <div>
            <span className="text-sm text-muted-foreground font-light">Personal Goals</span>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              {goals.goals?.length > 0 ? goals.goals.map((goal) => (
                <li key={goal.id} className="text-foreground text-sm">
                  <span className="font-medium">{goal.title}</span>
                  {goal.description && <span className="text-muted-foreground ml-2">{goal.description}</span>}
                </li>
              )) : <li className="text-muted-foreground text-sm">No personal goals set.</li>}
            </ul>
          </div>
          <div>
            <span className="text-sm text-muted-foreground font-light">Preferences</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {goals.preferences?.reminders?.map((r) => (
                <span key={r} className="px-2 py-1 bg-yellow-400/10 text-yellow-700 rounded-full text-xs">{r} reminder</span>
              ))}
              {goals.preferences?.aiFeatures?.map((f) => (
                <span key={f} className="px-2 py-1 bg-purple-400/10 text-purple-700 rounded-full text-xs">AI: {f}</span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-muted-foreground text-sm">No goals set yet. Click Edit to get started!</div>
      )}
    </div>
  );
};

export default ProfileGoalsSection; 