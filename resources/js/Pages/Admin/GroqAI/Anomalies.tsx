import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { 
  AlertTriangle, 
  ArrowLeft, 
  Check, 
  ExternalLink, 
  Eye, 
  Loader2
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
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { Pagination } from '@/Components/Pagination';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import axios from 'axios';

interface Anomaly {
  id: number;
  transaction_id: number;
  anomaly_type: string;
  confidence_score: number;
  is_reviewed: boolean;
  reviewed_by: number | null;
  created_at: string;
  transaction: {
    id: number;
    invoice_number: string;
    total_amount: number;
    created_at: string;
  };
  reviewer?: {
    id: number;
    name: string;
  };
}

interface AnomaliesProps {
  anomalies: {
    data: Anomaly[];
    links: any[];
    from: number;
    to: number;
    total: number;
  };
  flash?: {
    success?: string;
    error?: string;
  };
}

const Anomalies: React.FC<AnomaliesProps> = ({
  anomalies,
  flash
}) => {
  const [processingAnomalyId, setProcessingAnomalyId] = useState<number | null>(null);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(flash?.success ? { type: 'success', message: flash.success } : 
           flash?.error ? { type: 'error', message: flash.error } : null);

  const handleReviewAnomaly = async (anomalyId: number) => {
    setProcessingAnomalyId(anomalyId);
    
    try {
      await axios.put(route('admin.groq-ai.anomalies.review', anomalyId), {
        is_reviewed: true,
      });
      
      // Reload the page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error('Error reviewing anomaly:', error);
      setAlert({
        type: 'error',
        message: 'Failed to mark anomaly as reviewed.',
      });
      setProcessingAnomalyId(null);
    }
  };

  return (
    <AdminLayout title="Transaction Anomalies">
      <Head title="Transaction Anomalies" />

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
          <AlertTriangle className="h-6 w-6 mr-2 text-primary" />
          AI-Detected Transaction Anomalies
        </h1>
        <p className="text-muted-foreground mt-1">
          Review and manage suspicious transactions identified by Groq AI
        </p>
      </div>

      {alert && (
        <Alert 
          variant={alert.type === 'error' ? 'destructive' : alert.type} 
          className="mb-6"
        >
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Detected Anomalies</CardTitle>
          <CardDescription>
            Transactions flagged as potentially suspicious by the AI system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Anomaly Type</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {anomalies.data.length > 0 ? (
                anomalies.data.map((anomaly) => (
                  <TableRow key={anomaly.id}>
                    <TableCell>
                      <div className="font-medium">
                        {formatDate(anomaly.created_at)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDateTime(anomaly.created_at).split(' ').slice(3).join(' ')}
                      </div>
                    </TableCell>
                    <TableCell>
                      {anomaly.transaction.invoice_number}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(anomaly.transaction.total_amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {anomaly.anomaly_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={anomaly.confidence_score > 0.7 ? "destructive" : 
                                anomaly.confidence_score > 0.4 ? "warning" : "outline"}
                      >
                        {Math.round(anomaly.confidence_score * 100)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {anomaly.is_reviewed ? (
                        <Badge variant="success" className="flex items-center">
                          <Check className="h-3 w-3 mr-1" />
                          Reviewed
                        </Badge>
                      ) : (
                        <Badge variant="warning">
                          Unreviewed
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                        >
                          <Link href={route('admin.transactions.show', anomaly.transaction_id)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        
                        {!anomaly.is_reviewed && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReviewAnomaly(anomaly.id)}
                            disabled={processingAnomalyId === anomaly.id}
                          >
                            {processingAnomalyId === anomaly.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                Mark as Reviewed
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <AlertTriangle className="h-12 w-12 text-muted-foreground mb-2" />
                      <h3 className="text-lg font-medium">No anomalies detected</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        No transaction anomalies have been detected by the AI system
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {anomalies.data.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {anomalies.from} to {anomalies.to} of {anomalies.total} anomalies
              </div>
              <Pagination links={anomalies.links} />
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default Anomalies;