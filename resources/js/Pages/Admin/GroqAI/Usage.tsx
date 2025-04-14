import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { 
  ArrowLeft, 
  BarChart, 
  Clock,
  Zap, 
  ChartPie
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface UsagePeriodButtonProps {
  active: boolean;
  period: string;
  label: string;
  onClick: (period: string) => void;
}

const UsagePeriodButton: React.FC<UsagePeriodButtonProps> = ({ active, period, label, onClick }) => (
  <Button 
    variant={active ? "default" : "outline"} 
    size="sm" 
    onClick={() => onClick(period)}
    className="mr-2"
  >
    {label}
  </Button>
);

interface UsageDataItem {
  date: string;
  request_count: number;
  tokens_used: number;
  avg_processing_time: number | null;
}

interface OperationItem {
  operation_type: string;
  count: number;
}

interface SuccessFailureData {
  success: number;
  failure: number;
}

interface GroqAIUsageProps {
  usageData: UsageDataItem[];
  topOperations: OperationItem[];
  successVsFailure: SuccessFailureData;
  period?: string;
}

const GroqAIUsage: React.FC<GroqAIUsageProps> = ({
  usageData,
  topOperations,
  successVsFailure,
  period
}) => {
  const [activePeriod, setActivePeriod] = useState<string>(period || 'week');
  
  const handlePeriodChange = (newPeriod: string) => {
    window.location.href = route('admin.groq-ai.usage', { period: newPeriod });
  };

  // Format data for pie chart
  const operationChartData = topOperations.map((op, index) => ({
    name: op.operation_type,
    value: op.count,
    color: COLORS[index % COLORS.length]
  }));
  
  const successChartData = [
    { name: 'Success', value: successVsFailure.success, color: '#10b981' },
    { name: 'Failure', value: successVsFailure.failure, color: '#ef4444' }
  ];

  return (
    <AdminLayout title="Groq AI Usage">
      <Head title="Groq AI Usage" />

      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href={route('admin.groq-ai.index')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Groq AI Center
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <BarChart className="h-6 w-6 mr-2 text-primary" />
          Groq AI Usage Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Detailed analytics on API usage patterns and performance metrics
        </p>
      </div>

      {/* Period selector */}
      <div className="mb-6 flex items-center">
        <p className="text-sm text-muted-foreground mr-3">Time Period:</p>
        <UsagePeriodButton 
          active={activePeriod === 'day'} 
          period="day" 
          label="Day" 
          onClick={handlePeriodChange} 
        />
        <UsagePeriodButton 
          active={activePeriod === 'week'} 
          period="week" 
          label="Week" 
          onClick={handlePeriodChange} 
        />
        <UsagePeriodButton 
          active={activePeriod === 'month'} 
          period="month" 
          label="Month" 
          onClick={handlePeriodChange} 
        />
        <UsagePeriodButton 
          active={activePeriod === 'year'} 
          period="year" 
          label="Year" 
          onClick={handlePeriodChange} 
        />
      </div>

      {/* Main metrics */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-primary" />
              API Requests
            </CardTitle>
            <CardDescription>
              Number of requests over time
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={usageData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="request_count" 
                  name="Requests" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary" />
              Processing Time
            </CardTitle>
            <CardDescription>
              Average processing time in seconds
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={usageData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="avg_processing_time" 
                  name="Avg. Time (s)" 
                  stroke="#82ca9d" 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Secondary metrics */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ChartPie className="h-5 w-5 mr-2 text-primary" />
              API Operations
            </CardTitle>
            <CardDescription>
              Distribution of operations
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            {operationChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={operationChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {operationChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ChartPie className="h-5 w-5 mr-2 text-primary" />
              Success vs Failure
            </CardTitle>
            <CardDescription>
              API call success rate
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            {successChartData.some(item => item.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={successChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {successChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Raw data */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Data</CardTitle>
          <CardDescription>
            Raw usage data per time period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Requests</TableHead>
                <TableHead>Tokens Used</TableHead>
                <TableHead>Avg. Processing Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usageData.length > 0 ? (
                usageData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.request_count}</TableCell>
                    <TableCell>{item.tokens_used.toLocaleString()}</TableCell>
                    <TableCell>
                      {item.avg_processing_time !== null
                        ? `${item.avg_processing_time.toFixed(2)}s`
                        : '—'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No usage data available for the selected period
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default GroqAIUsage;