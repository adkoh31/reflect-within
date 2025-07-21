import React, { useState, useEffect } from 'react';
import { analyzeConversationForTraining, convertToOpenAIFormat, generateTrainingDataReport } from '../../utils/fineTuningDataCollector';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

const FineTuningDataPanel = () => {
  const [conversations, setConversations] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [selectedConversations, setSelectedConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportData, setExportData] = useState(null);

  // Load conversations from localStorage or API
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    try {
      // Load conversations from localStorage (you can modify this to load from your API)
      const storedConversations = localStorage.getItem('reflectWithin_conversations');
      if (storedConversations) {
        const parsed = JSON.parse(storedConversations);
        setConversations(parsed);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeAllConversations = () => {
    if (conversations.length === 0) return;

    const report = generateTrainingDataReport(conversations);
    setAnalysis(report);
  };

  const selectHighQualityConversations = () => {
    if (!analysis) return;

    const highQuality = conversations.filter((_, index) => {
      const conversationAnalysis = analyzeConversationForTraining(conversations[index]);
      return conversationAnalysis.qualityScore > 0.8;
    });

    setSelectedConversations(highQuality.map((_, index) => index));
  };

  const exportTrainingData = () => {
    if (selectedConversations.length === 0) return;

    const selectedData = selectedConversations.map(index => conversations[index]);
    const report = generateTrainingDataReport(selectedData);
    const openAIFormat = convertToOpenAIFormat(report.trainingExamples);

    setExportData({
      report,
      openAIFormat,
      timestamp: new Date().toISOString()
    });
  };

  const downloadTrainingData = () => {
    if (!exportData) return;

    const dataStr = JSON.stringify(exportData.openAIFormat, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fine-tuning-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const ConversationCard = ({ conversation, index, isSelected, onToggle }) => {
    const analysis = analyzeConversationForTraining(conversation);
    const messageCount = conversation.messages?.length || 0;
    const userMessages = conversation.messages?.filter(msg => msg.sender === 'user').length || 0;
    const aiMessages = conversation.messages?.filter(msg => msg.sender === 'ai').length || 0;

    return (
      <Card className={`p-4 cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
      }`} onClick={() => onToggle(index)}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold">Conversation #{index + 1}</h3>
            <p className="text-sm text-gray-600">
              {messageCount} messages ({userMessages} user, {aiMessages} AI)
            </p>
          </div>
          <Badge variant={analysis.qualityScore > 0.8 ? 'default' : 'secondary'}>
            {Math.round(analysis.qualityScore * 100)}%
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">Quality Score:</span>
            <Progress value={analysis.qualityScore * 100} className="flex-1 h-2" />
          </div>

          <div className="text-xs text-gray-600">
            <div>Training Examples: {analysis.trainingExamples.length}</div>
            <div>Patterns: {analysis.patterns.length}</div>
            <div>Issues: {analysis.issues.length}</div>
          </div>

          {analysis.issues.length > 0 && (
            <div className="text-xs text-red-600">
              Issues: {analysis.issues.map(issue => issue.type).join(', ')}
            </div>
          )}
        </div>
      </Card>
    );
  };

  const toggleConversationSelection = (index) => {
    setSelectedConversations(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Fine-tuning Data Collection</h1>
        <p className="text-gray-600">
          Analyze and collect high-quality training data from existing conversations
        </p>
      </div>

      {/* Control Panel */}
      <Card className="p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4">
            <Button 
              onClick={analyzeAllConversations}
              disabled={conversations.length === 0 || loading}
            >
              {loading ? 'Loading...' : `Analyze ${conversations.length} Conversations`}
            </Button>
            
            <Button 
              variant="outline"
              onClick={selectHighQualityConversations}
              disabled={!analysis}
            >
              Select High Quality
            </Button>
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={exportTrainingData}
              disabled={selectedConversations.length === 0}
              variant="outline"
            >
              Export Training Data ({selectedConversations.length})
            </Button>
            
            {exportData && (
              <Button onClick={downloadTrainingData}>
                Download JSON
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Analysis Summary */}
      {analysis && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Analysis Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analysis.report.totalConversations}</div>
              <div className="text-sm text-gray-600">Total Conversations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{analysis.report.highQualityConversations}</div>
              <div className="text-sm text-gray-600">High Quality (&gt;80%)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{analysis.report.totalTrainingExamples}</div>
              <div className="text-sm text-gray-600">Training Examples</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(analysis.report.averageQualityScore * 100)}%
              </div>
              <div className="text-sm text-gray-600">Avg Quality Score</div>
            </div>
          </div>

          {/* Patterns and Issues */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Common Patterns</h3>
              <div className="space-y-1">
                {Object.entries(analysis.report.patterns).map(([type, patterns]) => (
                  <div key={type} className="text-sm">
                    <span className="font-medium">{type}:</span> {patterns.length} occurrences
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Quality Issues</h3>
              <div className="space-y-1">
                {Object.entries(analysis.report.issues).map(([type, data]) => (
                  <div key={type} className="text-sm text-red-600">
                    <span className="font-medium">{type}:</span> {data.count} instances across {data.total} conversations
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Export Data Preview */}
      {exportData && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Export Preview</h2>
          <div className="bg-gray-100 p-4 rounded-lg max-h-64 overflow-y-auto">
            <pre className="text-xs">
              {JSON.stringify(exportData.report, null, 2)}
            </pre>
          </div>
        </Card>
      )}

      {/* Conversations Grid */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Conversations ({conversations.length})
          </h2>
          <div className="text-sm text-gray-600">
            Selected: {selectedConversations.length}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {conversations.map((conversation, index) => (
            <ConversationCard
              key={index}
              conversation={conversation}
              index={index}
              isSelected={selectedConversations.includes(index)}
              onToggle={toggleConversationSelection}
            />
          ))}
        </div>

        {conversations.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No conversations found. Start chatting to collect training data!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FineTuningDataPanel; 