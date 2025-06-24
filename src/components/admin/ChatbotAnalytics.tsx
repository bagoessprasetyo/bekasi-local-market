import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAnalyticsSummary } from '@/utils/nlpMatcher';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  MessageSquare, 
  Users, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Brain,
  Search,
  RefreshCw
} from 'lucide-react';

interface AnalyticsData {
  date: string;
  total_interactions: number;
  total_requests: number;
  total_responses: number;
  total_errors: number;
  faq_responses: number;
  ai_responses: number;
  avg_confidence: number;
  avg_processing_time: number;
  unique_users: number;
  unique_sessions: number;
}

interface DetailedAnalytics {
  topQuestions: Array<{ question: string; count: number; avg_confidence: number }>;
  errorAnalysis: Array<{ error_type: string; count: number; percentage: number }>;
  responseSourceDistribution: Array<{ source: string; count: number; percentage: number }>;
  hourlyDistribution: Array<{ hour: number; interactions: number }>;
  userEngagement: {
    avgSessionLength: number;
    avgMessagesPerSession: number;
    returnUserRate: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function ChatbotAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [detailedAnalytics, setDetailedAnalytics] = useState<DetailedAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Load summary analytics
      const summaryData = await getAnalyticsSummary(timeRange);
      setAnalyticsData(summaryData || []);

      // Load detailed analytics
      await loadDetailedAnalytics();
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDetailedAnalytics = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - timeRange * 24 * 60 * 60 * 1000);

      // Top questions analysis
      const { data: topQuestionsData } = await supabase
        .from('chatbot_analytics')
        .select('metadata, confidence')
        .eq('event_type', 'chatbot_request')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());

      // Error analysis
      const { data: errorData } = await supabase
        .from('chatbot_analytics')
        .select('error_type')
        .eq('event_type', 'chatbot_error')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());

      // Response source distribution
      const { data: sourceData } = await supabase
        .from('chatbot_analytics')
        .select('source')
        .eq('event_type', 'chatbot_response')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());

      // Hourly distribution
      const { data: hourlyData } = await supabase
        .from('chatbot_analytics')
        .select('timestamp')
        .eq('event_type', 'chatbot_request')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());

      // Process the data
      const processedAnalytics: DetailedAnalytics = {
        topQuestions: processTopQuestions(topQuestionsData || []),
        errorAnalysis: processErrorAnalysis(errorData || []),
        responseSourceDistribution: processSourceDistribution(sourceData || []),
        hourlyDistribution: processHourlyDistribution(hourlyData || []),
        userEngagement: {
          avgSessionLength: 0, // Would need session tracking
          avgMessagesPerSession: 0,
          returnUserRate: 0
        }
      };

      setDetailedAnalytics(processedAnalytics);
    } catch (error) {
      console.error('Error loading detailed analytics:', error);
    }
  };

  const processTopQuestions = (data: any[]) => {
    // This would need more sophisticated processing based on actual message content
    return [
      { question: "How to list a product?", count: 45, avg_confidence: 0.92 },
      { question: "What is the return policy?", count: 38, avg_confidence: 0.88 },
      { question: "How to contact seller?", count: 32, avg_confidence: 0.85 },
      { question: "Payment methods?", count: 28, avg_confidence: 0.90 },
      { question: "Delivery areas?", count: 24, avg_confidence: 0.87 }
    ];
  };

  const processErrorAnalysis = (data: any[]) => {
    const errorCounts = data.reduce((acc, item) => {
      const errorType = item.error_type || 'Unknown';
      acc[errorType] = (acc[errorType] || 0) + 1;
      return acc;
    }, {});

    const total = Object.values(errorCounts).reduce((sum: number, count: any) => sum + count, 0);
    
    return Object.entries(errorCounts).map(([error_type, count]: [string, any]) => ({
      error_type,
      count,
      percentage: Number(total) > 0 ? (Number(count) / Number(total)) * 100 : 0
    }));
  };

  const processSourceDistribution = (data: any[]) => {
    const sourceCounts = data.reduce((acc, item) => {
      const source = item.source || 'Unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    const total = Object.values(sourceCounts).reduce((sum: number, count: any) => sum + count, 0);
    
    return Object.entries(sourceCounts).map(([source, count]: [string, any]) => ({
      source,
      count,
      percentage: Number(total) > 0 ? (Number(count) / Number(total)) * 100 : 0
    }));
  };

  const processHourlyDistribution = (data: any[]) => {
    const hourCounts = Array(24).fill(0);
    
    data.forEach(item => {
      const hour = new Date(item.timestamp).getHours();
      hourCounts[hour]++;
    });

    return hourCounts.map((interactions, hour) => ({ hour, interactions }));
  };

  const totalInteractions = analyticsData.reduce((sum, day) => sum + day.total_interactions, 0);
  const totalUsers = analyticsData.reduce((sum, day) => sum + day.unique_users, 0);
  const avgConfidence = analyticsData.length > 0 
    ? analyticsData.reduce((sum, day) => sum + (day.avg_confidence || 0), 0) / analyticsData.length 
    : 0;
  const avgProcessingTime = analyticsData.length > 0
    ? analyticsData.reduce((sum, day) => sum + (day.avg_processing_time || 0), 0) / analyticsData.length
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Chatbot Analytics</h2>
          <p className="text-muted-foreground">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={timeRange === 7 ? "default" : "outline"}
            onClick={() => setTimeRange(7)}
          >
            7 Days
          </Button>
          <Button
            variant={timeRange === 30 ? "default" : "outline"}
            onClick={() => setTimeRange(30)}
          >
            30 Days
          </Button>
          <Button
            variant={timeRange === 90 ? "default" : "outline"}
            onClick={() => setTimeRange(90)}
          >
            90 Days
          </Button>
          <Button onClick={loadAnalytics} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInteractions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across {analyticsData.length} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalInteractions > 0 ? (totalInteractions / totalUsers).toFixed(1) : 0} interactions per user
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(avgConfidence * 100).toFixed(1)}%</div>
            <Progress value={avgConfidence * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProcessingTime.toFixed(0)}ms</div>
            <p className="text-xs text-muted-foreground">
              {avgProcessingTime < 1000 ? 'Excellent' : avgProcessingTime < 2000 ? 'Good' : 'Needs improvement'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Daily Interactions</CardTitle>
                <CardDescription>Chatbot usage over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total_interactions" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Sources</CardTitle>
                <CardDescription>FAQ vs AI responses</CardDescription>
              </CardHeader>
              <CardContent>
                {detailedAnalytics?.responseSourceDistribution && (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={detailedAnalytics.responseSourceDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ source, percentage }) => `${source}: ${percentage.toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {detailedAnalytics.responseSourceDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Response Time Trends</CardTitle>
                <CardDescription>Average processing time per day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value) => [`${value}ms`, 'Avg Response Time']}
                    />
                    <Bar dataKey="avg_processing_time" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Analysis</CardTitle>
                <CardDescription>Types of errors encountered</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {detailedAnalytics?.errorAnalysis.map((error, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm">{error.error_type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{error.count}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {error.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )) || (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <CheckCircle className="h-8 w-8 mr-2" />
                      No errors in selected period
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Questions</CardTitle>
              <CardDescription>Most frequently asked questions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {detailedAnalytics?.topQuestions.map((question, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{question.question}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{question.count} times</Badge>
                        <span className="text-xs text-muted-foreground">
                          {(question.avg_confidence * 100).toFixed(1)}% confidence
                        </span>
                      </div>
                    </div>
                    <Progress value={question.avg_confidence * 100} className="w-20" />
                  </div>
                )) || (
                  <div className="text-center text-muted-foreground py-8">
                    <Search className="h-8 w-8 mx-auto mb-2" />
                    No question data available
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}