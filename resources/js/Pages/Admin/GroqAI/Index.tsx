import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { 
  AlertTriangle, 
  BrainCircuit, 
  ChartBar, 
  Clock, 
  FileText, 
  Layers, 
  MessageSquare, 
  Percent, 
  Settings, 
  Zap 
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
import { formatDate, formatDateTime } from '@/lib/utils';

interface GroqAIIndexProps {
  stats: {
    totalRequests: number;
    successRate: number;
    averageProcessingTime: number | null;
    totalTokensUsed: number;
    unreviewedAnomaliesCount: number;
  };
  recentLogs: Array<{
    id: number;
    endpoint: string;
    operation_type: string;
    prompt: string;
    success: boolean;
    error_message: string | null;
    tokens_used: number | null;
    processing_time: number | null;
    created_at: string;
  }>;
  operationStats: Array<{
    operation_type: string;
    count: number;
  }>;
}

const GroqAIIndex: React.FC<GroqAIIndexProps> = ({
  stats,
  recentLogs,
  operationStats
}) => {
  return (
    <AdminLayout title="Groq AI Center">
      <Head title="Groq AI Center" />

      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <BrainCircuit className="h-6 w-6 mr-2 text-primary" />
          Groq AI Management Center
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor dan kelola integrasi AI untuk meningkatkan performa koperasi
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Requests
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Success Rate
            </CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Processing Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageProcessingTime ? 
                `${stats.averageProcessingTime.toFixed(2)}s` : 
                'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Tokens Used
            </CardTitle>
            <ChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTokensUsed.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Layers className="h-5 w-5 mr-2 text-primary" />
              Usage Analytics
            </CardTitle>
            <CardDescription>
              Details of API usage patterns and trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              View detailed statistics on API usage, token consumption, and performance metrics
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href={route('admin.groq-ai.usage')}>
                View Usage
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Prompt Templates
            </CardTitle>
            <CardDescription>
              Manage AI prompt templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Edit and configure the templates used for recommendations, predictions, and more
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href={route('admin.groq-ai.templates')}>
                Manage Templates
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
              Transaction Anomalies
            </CardTitle>
            <CardDescription>
              Review AI-detected anomalies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {stats.unreviewedAnomaliesCount > 0 ? (
                <div className="flex items-center">
                  <Badge variant="destructive" className="mr-2">
                    {stats.unreviewedAnomaliesCount} unreviewed
                  </Badge>
                  anomalies need your attention
                </div>
              ) : (
                "No unreviewed anomalies at this time"
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href={route('admin.groq-ai.anomalies')}>
                Review Anomalies
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Recent API Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent API Activity</CardTitle>
          <CardDescription>
            Recent calls to the Groq API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Operation</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentLogs.length > 0 ? (
                recentLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="font-medium">
                        {formatDate(log.created_at)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDateTime(log.created_at).split(' ').slice(3).join(' ')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {log.operation_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {log.tokens_used !== null ? log.tokens_used.toLocaleString() : '—'}
                    </TableCell>
                    <TableCell>
                      {log.processing_time !== null ? `${log.processing_time.toFixed(2)}s` : '—'}
                    </TableCell>
                    <TableCell>
                      {log.success ? (
                        <Badge variant="success">Success</Badge>
                      ) : (
                        <Badge variant="destructive">Failed</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    No recent API activity
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

export default GroqAIIndex;