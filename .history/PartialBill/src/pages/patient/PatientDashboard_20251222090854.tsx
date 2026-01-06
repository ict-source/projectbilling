import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Heart,
  FileText,
  Download,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  LogOut,
  User,
  Bell,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";

// Mock data for demonstration
const mockBills = [
  {
    id: "BILL-001",
    date: "2024-12-15",
    description: "Emergency Room Visit",
    amount: 1245.00,
    status: "pending",
    dueDate: "2025-01-15",
    hasDocument: true
  },
  {
    id: "BILL-002",
    date: "2024-12-10",
    description: "Laboratory Services",
    amount: 350.00,
    status: "paid",
    dueDate: "2025-01-10",
    hasDocument: true
  },
  {
    id: "BILL-003",
    date: "2024-11-28",
    description: "X-Ray Imaging",
    amount: 275.00,
    status: "paid",
    dueDate: "2024-12-28",
    hasDocument: true
  },
  {
    id: "BILL-004",
    date: "2024-11-15",
    description: "Consultation - Dr. Smith",
    amount: 150.00,
    status: "overdue",
    dueDate: "2024-12-15",
    hasDocument: true
  }
];

const mockDocuments = [
  {
    id: "DOC-001",
    name: "Itemized Bill - ER Visit",
    type: "PDF",
    date: "2024-12-15",
    size: "245 KB"
  },
  {
    id: "DOC-002",
    name: "Insurance Claim Summary",
    type: "PDF",
    date: "2024-12-10",
    size: "128 KB"
  },
  {
    id: "DOC-003",
    name: "Payment Receipt - Lab Services",
    type: "PDF",
    date: "2024-12-10",
    size: "85 KB"
  }
];

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  const totalBalance = mockBills
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
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              MediCare<span className="text-primary">Billing</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                2
              </span>
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent">
                <User className="h-5 w-5 text-accent-foreground" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-muted-foreground">PAT-12345</p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
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
            Welcome back, John
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here's an overview of your hospital billing account.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Balance</p>
                  <p className="font-display text-2xl font-bold text-foreground">
                    ${totalBalance.toFixed(2)}
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
                    {mockBills.filter(b => b.status === "pending").length}
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
                    {mockBills.filter(b => b.status === "paid").length}
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
                    {mockBills.filter(b => b.status === "overdue").length}
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
                  {mockBills.slice(0, 3).map((bill) => (
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
                            ${bill.amount.toFixed(2)}
                          </p>
                          {getStatusBadge(bill.status)}
                        </div>
                        {bill.hasDocument && (
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="cursor-pointer transition-all hover:shadow-card-hover">
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

              <Card className="cursor-pointer transition-all hover:shadow-card-hover">
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
                    {mockBills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell className="font-medium">{bill.id}</TableCell>
                        <TableCell>{new Date(bill.date).toLocaleDateString()}</TableCell>
                        <TableCell>{bill.description}</TableCell>
                        <TableCell>${bill.amount.toFixed(2)}</TableCell>
                        <TableCell>{new Date(bill.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(bill.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
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
                <div className="space-y-4">
                  {mockDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-accent p-2">
                          <FileText className="h-5 w-5 text-accent-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.type} • {doc.size} • {new Date(doc.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  ))}
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
