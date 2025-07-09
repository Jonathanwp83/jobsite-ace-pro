import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/AdminLayout';
import { InvoiceManagement } from '@/components/admin/InvoiceManagement';

export default function AdminInvoices() {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate('/dashboard');
      return;
    }
  }, [isAdmin, roleLoading, navigate]);

  if (roleLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading invoices...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Invoice Management</h2>
          <p className="text-muted-foreground mt-2">Monitor platform-wide invoice activity</p>
        </div>

        <InvoiceManagement />
      </div>
    </AdminLayout>
  );
}