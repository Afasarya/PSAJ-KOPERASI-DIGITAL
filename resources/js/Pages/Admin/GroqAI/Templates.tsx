import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { 
  Edit,
  FileText, 
  MessageSquare, 
  BarChartBig, 
  AlertTriangle, 
  ArrowLeft
} from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { formatDate } from '@/lib/utils';
import { Alert, AlertDescription } from '@/Components/ui/alert';

interface Template {
  id: number;
  name: string;
  description: string | null;
  purpose: 'chatbot' | 'recommendation' | 'prediction' | 'anomaly';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  template_content?: string;
}

interface TemplatesProps {
  templates: Template[];
  flash?: {
    success?: string;
    error?: string;
  };
}

const GroqAITemplates: React.FC<TemplatesProps> = ({
  templates,
  flash
}) => {
  const [alert, setAlert] = useState<{
    type: 'success' | 'destructive' | 'warning';
    message: string;
  } | null>(flash?.success ? { type: 'success', message: flash.success } : 
           flash?.error ? { type: 'destructive', message: flash.error } : null);

  const getPurposeIcon = (purpose: string) => {
    switch (purpose) {
      case 'chatbot':
        return <MessageSquare className="h-4 w-4" />;
      case 'recommendation':
        return <FileText className="h-4 w-4" />;
      case 'prediction':
        return <BarChartBig className="h-4 w-4" />;
      case 'anomaly':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getPurposeLabel = (purpose: string) => {
    switch (purpose) {
      case 'chatbot':
        return 'Chatbot Assistant';
      case 'recommendation':
        return 'Product Recommendations';
      case 'prediction':
        return 'Sales/Stock Predictions';
      case 'anomaly':
        return 'Anomaly Detection';
      default:
        return purpose;
    }
  };

  return (
    <AdminLayout title="AI Prompt Templates">
      <Head title="AI Prompt Templates" />

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
          <FileText className="h-6 w-6 mr-2 text-primary" />
          AI Prompt Templates
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage and customize templates used for Groq AI operations
        </p>
      </div>

      {alert && (
        <Alert 
          variant={alert.type} 
          className="mb-6"
        >
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div>
                <CardTitle className="flex items-center text-xl">
                  {getPurposeIcon(template.purpose)}
                  <span className="ml-2">{template.name}</span>
                </CardTitle>
                <CardDescription>
                  {getPurposeLabel(template.purpose)}
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                {template.is_active ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <Badge variant="warning">Inactive</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {template.description && (
                  <div className="text-sm text-muted-foreground">
                    {template.description}
                  </div>
                )}
                <div className="bg-muted p-4 rounded-md text-sm font-mono overflow-auto max-h-32">
                  {template.template_content?.substring(0, 150)}
                  {(template.template_content?.length || 0) > 150 && '...'}
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <div>Last updated: {formatDate(template.updated_at)}</div>
                  <Button asChild size="sm">
                    <Link href={route('admin.groq-ai.templates.edit', template.id)}>
                      <Edit className="h-3 w-3 mr-1" />
                      Edit Template
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {templates.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center justify-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No templates found</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  No AI prompt templates have been created yet
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default GroqAITemplates;
