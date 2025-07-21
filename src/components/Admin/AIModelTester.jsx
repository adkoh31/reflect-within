import { useState, useEffect } from 'react';
import { TEST_SCENARIOS, testAIModel, generateTestReport, analyzeResponseQuality } from '../../utils/aiModelAnalyzer';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

const AIModelTester = () => {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');
  const [manualTest, setManualTest] = useState('');
  const [manualResponse, setManualResponse] = useState('');
  const [manualAnalysis, setManualAnalysis] = useState(null);

  // Mock AI response function - replace with your actual AI call
  const mockAIResponse = async (messages) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // This is where you'd call your actual AI model
    // For now, we'll simulate responses based on the input
    const lastMessage = messages[messages.length - 1];
    const content = lastMessage.content.toLowerCase();
    
    // Simulate different response qualities based on input
    if (content.includes('fitness') || content.includes('workout')) {
      return "That's great that you're working on your fitness! Have you tried setting specific goals? What kind of results are you looking for?";
    } else if (content.includes('stress') || content.includes('overwhelmed')) {
      return "I understand that can be really challenging. What's been the most difficult part? Have you found anything that helps you manage stress?";
    } else if (content.includes('lonely')) {
      return "That sounds really hard. Loneliness can be so difficult to deal with. What kind of connection are you looking for right now?";
    } else if (content.includes('goal')) {
      return "Setting goals can be tricky. What areas of your life feel most important to focus on? And what would success look like to you?";
    } else {
      return "That's interesting. Can you tell me more about that? What's been on your mind?";
    }
  };

  const runFullTest = async () => {
    setIsRunning(true);
    setTestResults(null);
    
    try {
      const results = await testAIModel(TEST_SCENARIOS, mockAIResponse);
      const report = generateTestReport(results);
      setTestResults(report);
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runManualTest = () => {
    if (!manualTest.trim()) return;
    
    const analysis = analyzeResponseQuality(manualResponse, []);
    setManualAnalysis(analysis);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceColor = (performance) => {
    switch (performance) {
      case 'Excellent': return 'bg-green-100 text-green-800';
      case 'Good': return 'bg-blue-100 text-blue-800';
      case 'Fair': return 'bg-yellow-100 text-yellow-800';
      case 'Needs Improvement': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">AI Model Performance Tester</h1>
        <p className="text-gray-600">
          Test your current AI model against the new strategy requirements
        </p>
      </div>

      {/* Test Controls */}
      <Card className="p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div>
            <Button 
              onClick={runFullTest}
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRunning ? 'Running Tests...' : 'Run Full Model Test'}
            </Button>
            {isRunning && (
              <div className="mt-2 text-sm text-gray-600">
                Testing {Object.keys(TEST_SCENARIOS).length} categories...
              </div>
            )}
          </div>
          
          <div className="text-sm text-gray-600">
            {Object.values(TEST_SCENARIOS).flat().length} test scenarios
          </div>
        </div>
      </Card>

      {/* Manual Test Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Manual Test</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Test Input:</label>
            <textarea
              value={manualTest}
              onChange={(e) => setManualTest(e.target.value)}
              placeholder="Enter a test scenario..."
              className="w-full p-3 border rounded-lg"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">AI Response:</label>
            <textarea
              value={manualResponse}
              onChange={(e) => setManualResponse(e.target.value)}
              placeholder="Enter the AI response to analyze..."
              className="w-full p-3 border rounded-lg"
              rows={4}
            />
          </div>
          
          <Button onClick={runManualTest} disabled={!manualTest || !manualResponse}>
            Analyze Response
          </Button>
        </div>

        {/* Manual Test Results */}
        {manualAnalysis && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-3">Analysis Results</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <div className="text-sm text-gray-600">Overall Score</div>
                <div className={`text-xl font-bold ${getScoreColor(manualAnalysis.overallScore * 100)}`}>
                  {Math.round(manualAnalysis.overallScore * 100)}%
                </div>
              </div>
              {Object.entries(manualAnalysis.qualityScores).map(([quality, score]) => (
                <div key={quality}>
                  <div className="text-sm text-gray-600 capitalize">{quality}</div>
                  <div className={`text-lg font-semibold ${getScoreColor(score * 100)}`}>
                    {Math.round(score * 100)}%
                  </div>
                </div>
              ))}
            </div>
            
            {manualAnalysis.strengths.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium text-green-700">Strengths:</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {manualAnalysis.strengths.map((strength, index) => (
                    <Badge key={index} variant="default" className="bg-green-100 text-green-800">
                      {strength}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {manualAnalysis.weaknesses.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium text-red-700">Areas for Improvement:</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {manualAnalysis.weaknesses.map((weakness, index) => (
                    <Badge key={index} variant="secondary" className="bg-red-100 text-red-800">
                      {weakness}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Test Results */}
      {testResults && (
        <>
          {/* Overall Summary */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{testResults.summary.totalTests}</div>
                <div className="text-sm text-gray-600">Total Tests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{testResults.summary.passedTests}</div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{testResults.summary.failedTests}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(testResults.overallScore * 100)}`}>
                  {Math.round(testResults.overallScore * 100)}%
                </div>
                <div className="text-sm text-gray-600">Overall Score</div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="space-y-4">
              <h3 className="font-semibold">Category Performance</h3>
              {Object.entries(testResults.categoryBreakdown).map(([category, data]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium capitalize">{category}</span>
                    <Badge className={getPerformanceColor(data.performance)}>
                      {data.performance}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`font-semibold ${getScoreColor(data.score)}`}>
                      {data.score}%
                    </div>
                    <Progress value={data.score} className="w-24" />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Strengths and Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 text-green-700">Top Strengths</h3>
              <div className="space-y-2">
                {testResults.strengths.map((strength, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="capitalize">{strength.strength}</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      {strength.frequency}x
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4 text-red-700">Areas for Improvement</h3>
              <div className="space-y-2">
                {testResults.weaknesses.map((weakness, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="capitalize">{weakness.weakness}</span>
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      {weakness.frequency}x
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Recommendations */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Recommendations</h3>
            <div className="space-y-2">
              {testResults.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{recommendation}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Detailed Results */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Detailed Test Results</h3>
            <div className="space-y-6">
              {testResults.detailedResults.map((categoryResult) => (
                <div key={categoryResult.category}>
                  <h4 className="font-medium capitalize mb-3">{categoryResult.category}</h4>
                  <div className="space-y-3">
                    {categoryResult.scenarios.map((scenario, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">{scenario.scenario}</span>
                          <Badge variant={scenario.passed ? "default" : "secondary"}>
                            {scenario.passed ? "Passed" : "Failed"}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          <strong>Input:</strong> {typeof scenario.userInput === 'string' ? scenario.userInput : 'Multi-turn conversation'}
                        </div>
                        <div className="text-sm mb-2">
                          <strong>Response:</strong> {scenario.aiResponse}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm">
                            <strong>Score:</strong> {Math.round(scenario.analysis.overallScore * 100)}%
                          </span>
                          {scenario.analysis.strengths.length > 0 && (
                            <span className="text-sm text-green-600">
                              <strong>Strengths:</strong> {scenario.analysis.strengths.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default AIModelTester; 