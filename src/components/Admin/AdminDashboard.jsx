import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import AIModelTester from './AIModelTester';
import FineTuningDataPanel from './FineTuningDataPanel';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    {
      id: 'overview',
      label: 'Overview',
      icon: '📊',
      description: 'Admin dashboard overview and quick actions'
    },
    {
      id: 'ai-testing',
      label: 'AI Model Testing',
      icon: '🧪',
      description: 'Test and analyze current AI model performance'
    },
    {
      id: 'fine-tuning',
      label: 'Fine-tuning Data',
      icon: '📈',
      description: 'Collect and manage training data for fine-tuning'
    }
  ];

  const QuickActionCard = ({ title, description, action, icon, color = 'blue' }) => (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={action}>
      <div className="flex items-center gap-3">
        <div className={`text-2xl ${color === 'blue' ? 'text-blue-500' : color === 'green' ? 'text-green-500' : 'text-purple-500'}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{title}</h3>
          <p className="text-xs text-gray-600">{description}</p>
        </div>
      </div>
    </Card>
  );

  const OverviewSection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Development tools for AI model management</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <QuickActionCard
          title="Test AI Model"
          description="Run comprehensive tests on current AI performance"
          icon="🧪"
          color="blue"
          action={() => setActiveSection('ai-testing')}
        />
        <QuickActionCard
          title="Manage Training Data"
          description="Collect and analyze fine-tuning data"
          icon="📈"
          color="green"
          action={() => setActiveSection('fine-tuning')}
        />
        <QuickActionCard
          title="Run Automated Test"
          description="Execute the test script from command line"
          icon="⚡"
          color="purple"
          action={() => {
            // This would trigger the script
            console.log('Run: node scripts/testCurrentAIModel.js');
            alert('Run this command in your terminal:\n\nnode scripts/testCurrentAIModel.js');
          }}
        />
        <QuickActionCard
          title="Generate Training Data"
          description="Create manual training examples"
          icon="✍️"
          color="orange"
          action={() => {
            // This would generate training data
            console.log('Generate training data');
            alert('Training data generation would happen here');
          }}
        />
      </div>

      {/* Development Info */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Development Information</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Environment:</span>
            <Badge variant={import.meta.env.MODE === 'development' ? 'default' : 'secondary'}>
              {import.meta.env.MODE}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>API URL:</span>
            <span className="text-gray-600">{import.meta.env.VITE_API_URL || 'http://localhost:5000'}</span>
          </div>
          <div className="flex justify-between">
            <span>Current Model:</span>
            <span className="text-gray-600">ft:gpt-4o-mini-2024-07-18:personal:dataset-metcon:Bryj0os9</span>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">15</div>
          <div className="text-sm text-gray-600">Test Scenarios</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">5</div>
          <div className="text-sm text-gray-600">Quality Metrics</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">50+</div>
          <div className="text-sm text-gray-600">Training Examples</div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              Development Only
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveSection('overview')}
          >
            Back to Overview
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveSection(section.id)}
              className="flex items-center gap-2"
            >
              <span>{section.icon}</span>
              <span>{section.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeSection === 'overview' && <OverviewSection />}
        {activeSection === 'ai-testing' && <AIModelTester />}
        {activeSection === 'fine-tuning' && <FineTuningDataPanel />}
      </div>
    </div>
  );
};

export default AdminDashboard; 