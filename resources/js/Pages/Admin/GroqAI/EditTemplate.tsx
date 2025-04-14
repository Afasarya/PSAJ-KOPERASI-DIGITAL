import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, FileText, Loader2, Save } from 'lucide-react';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/text-area';
import { Switch } from '@/Components/ui/switch';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';

interface Template {
  id: number;
  name: string;
  description: string | null;
  template_content: string;
  purpose: 'chatbot' | 'recommendation' | 'prediction' | 'anomaly';
  is_active: boolean;
}

interface EditTemplateProps {
  template: Template;
}

const EditTemplate: React.FC<EditTemplateProps> = ({
  template
}) => {
  const { data, setData, put, processing, errors } = useForm({
    name: template.name,
    description: template.description || '',
    template_content: template.template_content,
    is_active: template.is_active,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('admin.groq-ai.templates.update', template.id));
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

  const getPlaceholderVariables = (purpose: string) => {
    switch (purpose) {
      case 'chatbot':
        return [
          '{{user_name}}',
          '{{user_role}}',
          '{{previous_messages}}',
        ];
      case 'recommendation':
        return [
          '{{product_name}}',
          '{{product_category}}',
          '{{product_id}}',
          '{{user_purchase_history}}',
        ];
      case 'prediction':
        return [
          '{{product_id}}',
          '{{product_name}}',
          '{{historical_sales_data}}',
          '{{current_stock}}',
        ];
      case 'anomaly':
        return [
          '{{transaction_id}}',
          '{{invoice_number}}',
          '{{total_amount}}',
          '{{transaction_date}}',
          '{{items_list}}',
          '{{cashier_name}}',
        ];
      default:
        return [];
    }
  };

  return (
    <AdminLayout title={`Edit Template - ${template.name}`}>
      <Head title={`Edit Template - ${template.name}`} />

      <div className="mb-6">
        <Button variant="outline" asChild>
          <a href={route('admin.groq-ai.templates')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Templates
          </a>
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Edit Template: {template.name}
            </CardTitle>
            <CardDescription>
              Template Purpose: {getPurposeLabel(template.purpose)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className="mt-1"
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  className="mt-1"
                  rows={2}
                />
                {errors.description && (
                  <p className="text-sm text-destructive mt-1">{errors.description}</p>
                )}
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <Label htmlFor="template_content">Template Content</Label>
                  <div className="text-xs text-muted-foreground">
                    This template is used for {getPurposeLabel(template.purpose).toLowerCase()}
                  </div>
                </div>
                <Textarea
                  id="template_content"
                  value={data.template_content}
                  onChange={(e) => setData('template_content', e.target.value)}
                  className="mt-1 font-mono"
                  rows={15}
                />
                {errors.template_content && (
                  <p className="text-sm text-destructive mt-1">{errors.template_content}</p>
                )}
              </div>

              <div>
                <Label className="block mb-2">Available Variables</Label>
                <div className="flex flex-wrap gap-2">
                  {getPlaceholderVariables(template.purpose).map((variable) => (
                    <Badge key={variable} variant="outline" className="font-mono">
                      {variable}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  These variables will be replaced with actual values when the template is used.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={data.is_active}
                  onCheckedChange={(checked) => setData('is_active', checked)}
                />
                <Label htmlFor="is_active">Template Active</Label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Template
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </AdminLayout>
  );
};

export default EditTemplate;