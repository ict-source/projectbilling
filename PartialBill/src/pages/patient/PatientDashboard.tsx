import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Heart,
  FileText,
  Download,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  LogOut,
  User,
  ChevronRight,
  Edit,
  Trash2,
  FlaskConical,
  Activity,
  Eye,
  Pill
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { toast } from "@/hooks/use-toast";
import NotificationDropdown from "@/components/NotificationDropdown";
import { ContextAssistant } from "@/components/ContextAssistant";
import { HelpNavigation } from "@/components/HelpNavigation";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  patient_id?: string;
}

// Types
interface Bill {
  id: number;
  patient_id: number;
  amount: number;
  description: string;
  date: string;
  status: string;
}

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  const { addNotification } = useNotifications();

  useEffect(() => {
    const fetchBills = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/bills/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setBills(data);

          // Check for overdue bills and notify
          const overdueBills = data.filter((bill: Bill) => bill.status === 'overdue');
          if (overdueBills.length > 0) {
            addNotification(
              `You have ${overdueBills.length} overdue bill${overdueBills.length > 1 ? 's' : ''}. Please make payment arrangements.`,
              'warning'
            );
          }

          // Check for new pending bills
          const pendingBills = data.filter((bill: Bill) => bill.status === 'pending');
          if (pendingBills.length > 0) {
            addNotification(
              `You have ${pendingBills.length} pending bill${pendingBills.length > 1 ? 's' : ''} awaiting payment.`,
              'info'
            );
          }
        } else {
          console.error('Failed to fetch bills:', response.status);
        }
      } catch (error) {
        console.error('Error fetching bills:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [user, addNotification]);

  const totalBalance = bills
    .filter(b => b.status !== "paid")
    .reduce((sum, bill) => sum + bill.amount, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-success/10 text-success hover:bg-success/20">Paid</Badge>;
      case "pending":
        return <Badge className="bg-warning/10 text-warning hover:bg-warning/20">Pending</Badge>;
      case "overdue":
        return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const downloadAllStatements = async (bills: Bill[], user: User | null) => {
    if (bills.length === 0) {
      toast({
        title: "No Bills",
        description: "You have no bills to download.",
        variant: "destructive"
      });
      return;
    }

    // Create CSV content
    const headers = ['Bill ID', 'Date', 'Description', 'Amount', 'Status'];
    const csvContent = [
      headers.join(','),
      ...bills.map(bill => [
        `BILL-${bill.id.toString().padStart(3, '0')}`,
        new Date(bill.date).toLocaleDateString(),
        `"${bill.description.replace(/"/g, '""')}"`, // Escape quotes
        bill.amount.toFixed(2),
        bill.status
      ].join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `billing-statements-${user?.patient_id || 'patient'}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Log the download to Google Sheets
    try {
      await fetch('/api/log-download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user?.id,
          userName: user?.name,
          patientId: user?.patient_id,
          action: 'Download All Statements',
          details: `Downloaded ${bills.length} bills as CSV`
        })
      });
    } catch (error) {
      console.error('Failed to log download:', error);
    }

    toast({
      title: "Download Complete",
      description: "Your billing statements have been downloaded.",
    });
  };

  const downloadBill = async (bill: Bill) => {
    const content = `Bill Statement
Bill ID: BILL-${bill.id.toString().padStart(3, '0')}
Date: ${new Date(bill.date).toLocaleDateString()}
Description: ${bill.description}
Amount: ₱${bill.amount.toFixed(2)}
Status: ${bill.status}

MediCare Billing Department`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bill-${bill.id}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Log the download to Google Sheets
    try {
      await fetch('/api/log-download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user?.id,
          userName: user?.name,
          patientId: user?.patient_id,
          action: 'Download Bill',
          details: `Downloaded bill ${bill.id} - ${bill.description}`
        })
      });
    } catch (error) {
      console.error('Failed to log download:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading your bills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/apmclogo.jpg" alt="APMC Logo" className="h-9 w-9 rounded-lg object-cover" />
            <span className="font-display text-xl font-bold text-foreground">
              MediCare<span className="text-primary">Billing</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <HelpNavigation />
            <NotificationDropdown />
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent">
                <User className="h-5 w-5 text-accent-foreground" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground">{user?.patient_id || 'N/A'}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Welcome back, {user?.name || 'User'}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here's an overview of your hospital billing account.
          </p>
        </div>

        {/* AI Assistant Tip */}
        <div className="mb-8">
          <ContextAssistant context="account" title="Getting Started with Your Dashboard" />
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Balance</p>
                  <p className="font-display text-2xl font-bold text-foreground">
                    ₱{totalBalance.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-lg bg-primary/10 p-3">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Bills</p>
                  <p className="font-display text-2xl font-bold text-foreground">
                    {bills.filter(b => b.status === "pending").length}
                  </p>
                </div>
                <div className="rounded-lg bg-warning/10 p-3">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Paid Bills</p>
                  <p className="font-display text-2xl font-bold text-foreground">
                    {bills.filter(b => b.status === "paid").length}
                  </p>
                </div>
                <div className="rounded-lg bg-success/10 p-3">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="font-display text-2xl font-bold text-foreground">
                    {bills.filter(b => b.status === "overdue").length}
                  </p>
                </div>
                <div className="rounded-lg bg-destructive/10 p-3">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bills">All Bills</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Recent Bills */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Bills</CardTitle>
                  <CardDescription>Your latest billing statements</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab("bills")}>
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bills.slice(0, 3).map((bill) => (
                    <div
                      key={bill.id}
                      className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-accent p-2">
                          <FileText className="h-5 w-5 text-accent-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{bill.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(bill.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-foreground">
                            ₱{bill.amount.toFixed(2)}
                          </p>
                          {getStatusBadge(bill.status)}
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => downloadBill(bill)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Hospital Departments & Prices */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link to="/departments/laboratory" className="block">
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <FlaskConical className="h-5 w-5 text-blue-500" />
                    <span className="font-medium text-sm">Laboratory Prices</span>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/departments/radiology" className="block">
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Activity className="h-5 w-5 text-purple-500" />
                    <span className="font-medium text-sm">Radiology Prices</span>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/departments/eye-center" className="block">
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Eye className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-sm">Eye Center Prices</span>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/departments/heart-center" className="block">
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Heart className="h-5 w-5 text-red-500" />
                    <span className="font-medium text-sm">Heart Center Prices</span>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/departments/pharmacy" className="block">
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Pill className="h-5 w-5 text-orange-500" />
                    <span className="font-medium text-sm">Pharmacy Prices</span>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card
                className="cursor-pointer transition-all hover:shadow-card-hover"
                onClick={() => downloadAllStatements(bills, user)}
              >
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Download All Statements</p>
                    <p className="text-sm text-muted-foreground">
                      Get all your billing documents
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer transition-all hover:shadow-card-hover"
                onClick={() => setActiveTab("bills")}
              >
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="rounded-lg bg-info/10 p-3">
                    <CreditCard className="h-6 w-6 text-info" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Payment History</p>
                    <p className="text-sm text-muted-foreground">
                      View your payment records
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bills">
            <Card>
              <CardHeader>
                <CardTitle>All Bills</CardTitle>
                <CardDescription>Complete list of your billing statements</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bill ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell className="font-medium">BILL-{bill.id.toString().padStart(3, '0')}</TableCell>
                        <TableCell>{new Date(bill.date).toLocaleDateString()}</TableCell>
                        <TableCell>{bill.description}</TableCell>
                        <TableCell>₱{bill.amount.toFixed(2)}</TableCell>
                        <TableCell>N/A</TableCell>
                        <TableCell>{getStatusBadge(bill.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => downloadBill(bill)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>All your billing documents and receipts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No documents available yet.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PatientDashboard;
