'use client';

import { useUser, useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Clock,
  Building2,
  LogOut,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

function LoadingSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <div className="w-full max-w-2xl space-y-4">
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export default function PendingApprovalPage() {
  const router = useRouter();
  const { user, isLoading } = useUser({ redirectOnUnauthenticated: false });
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Redirect if user doesn't have a pending organization
  useEffect(() => {
    if (!isLoading && user) {
      // @ts-ignore - organization field will be available once contracts are rebuilt
      const isPendingOrgAdmin =
        user.role === 'ORG_ADMIN' && user.organization?.status === 'PENDING';

      if (!isPendingOrgAdmin) {
        // User shouldn't be on this page - redirect to dashboard
        router.replace('/dashboard');
      }
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success('Logged out successfully');
      router.replace('/login');
    } catch (err) {
      toast.error('Failed to logout');
      console.error(err);
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Show the page if user is ORG_ADMIN
  if (!user || user.role !== 'ORG_ADMIN') {
    return null;
  }

  // @ts-ignore - organization field will be available once contracts are rebuilt
  const organizationName = user.organization?.name || 'Your Organization';

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header Card */}
        <Card>
          <CardHeader className="text-center space-y-4 pb-4">
            <div className="mx-auto w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center">
              <Clock className="h-8 w-8 text-warning" />
            </div>
            <div>
              <CardTitle className="text-2xl">
                Organization Pending Approval
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Your organization is currently under review by our
                administrators
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Organization Info Alert */}
            <Alert>
              <Building2 className="h-4 w-4" />
              <AlertTitle>Organization Details</AlertTitle>
              <AlertDescription className="mt-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{organizationName}</span>
                  <span className="inline-flex items-center rounded-full border border-warning/20 bg-secondary-100 px-3 py-1 text-xs font-medium text-warning-dark">
                    Pending Approval
                  </span>
                </div>
              </AlertDescription>
            </Alert>

            <Separator />

            {/* Status Timeline */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Registration Status
              </h3>

              {/* Completed Step */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/10">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    Registration Complete
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your organization has been successfully registered and
                    submitted for review.
                  </p>
                </div>
              </div>

              {/* Current Step */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warning/10">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Under Review</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    A system administrator is reviewing your organization
                    details. This process typically takes 1-2 business days.
                  </p>
                </div>
              </div>

              {/* Pending Step */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-muted-foreground">
                    Access Granted
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Once approved, you'll be able to access all features and
                    start inviting employees to your organization.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Info Alert */}
            <Alert variant="default" className="bg-muted/50 border-border">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>What happens next?</AlertTitle>
              <AlertDescription className="mt-2 space-y-2">
                <p className="text-sm">
                  You'll receive an email notification once your organization
                  has been approved. After approval, simply log in again to
                  access the full platform.
                </p>
                <p className="text-sm">
                  If you have any questions or need urgent access, please
                  contact our support team.
                </p>
              </AlertDescription>
            </Alert>

            <Separator />

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </Button>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Need help?{' '}
                  <a
                    href="mailto:support@humanline.com"
                    className="text-primary hover:underline font-medium"
                  >
                    Contact Support
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
