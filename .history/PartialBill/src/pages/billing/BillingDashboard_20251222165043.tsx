import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  FileText,
  Upload,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  LogOut,
  User,
  Search,
  Plus,
  Eye,
  Building2
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// Mock data
const mockPatients = [
  {
    id: "PAT-001",
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "(555) 123-4567",
    status: "admitted",
    admissionDate: "2024-12-15",
    room: "203A",
    totalBilled: 2500.00,
    pendingBalance: 1245.00
  },
  {
    id: "PAT-002",
    name: "Jane Smith",
    email: "jane.smith@email.com",
    phone: "(555) 987-6543",
    status: "admitted",
    admissionDate: "2024-12-18",
    room: "105B",
    totalBilled: 1200.00,
    pendingBalance: 850.00
  },
  {
    id: "PAT-003",
    name: "Robert Johnson",
    email: "robert.j@email.com",
    phone: "(555) 456-7890",
    status: "discharged",
    admissionDate: "2024-12-10",
    room: "-",
    totalBilled: 4500.00,
    pendingBalance: 0
  }
];

const mockBills = [
  {
    id: "BILL-001",
    patientId: "PAT-001",
    patientName: "John Doe",
    date: "2024-12-15",
    description: "Emergency Room Visit",
    amount: 1245.00,
    status: "pending",
    uploadedBy: "Admin"
  },
  {
    id: "BILL-002",
    patientId: "PAT-002",
    patientName: "Jane Smith",
    date: "2024-12-18",
    description: "ICU Stay - Day 1",
    amount: 850.00,
    status: "pending",
    uploadedBy: "Admin"
  },
  {
    id: "BILL-003",
    patientId: "PAT-003",
    patientName: "Robert Johnson",
    date: "2024-12-10",
    description: "Surgery + Recovery",
    amount: 4500.00,
    status: "paid",
    uploadedBy: "Admin"
  }
];

const BillingDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    patientId: "",
    description: "",
    amount: "",
    file: null as File | null
  });
  const { toast } = useToast();

  const admittedPatients = mockPatients.filter(p => p.status === "admitted");
  const totalPending = mockBills.filter(b => b.status === "pending").reduce((sum, b) => sum + b.amount, 0);
  const totalCollected = mockBills.filter(b => b.status === "paid").reduce((sum, b) => sum + b.amount, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "admitted":
        return <Badge className="bg-info/10 text-info hover:bg-info/20">Admitted</Badge>;
      case "discharged":
        return <Badge className="bg-muted text-muted-foreground hover:bg-muted/80">Discharged</Badge>;
      case "paid":
        return <Badge className="bg-success/10 text-success hover:bg-success/20">Paid</Badge>;
      case "pending":
        return <Badge className="bg-warning/10 text-warning hover:bg-warning/20">Pending</Badge>;
      default:
        return null;
    }
  };

  const handleUpload = () => {
    toast({
      title: "Demo Mode",
      description: "File upload will be available once backend is connected.",
    });
    setIsUploadDialogOpen(false);
    setUploadForm({ patientId: "", description: "", amount: "", file: null });
  };

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <Badge variant="secondary" className="ml-2">
              <Building2 className="mr-1 h-3 w-3" />
              Staff Portal
            </Badge>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">Billing Admin</p>
                <p className="text-xs text-muted-foreground">Staff ID: STF-001</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <LogOut className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Header Section */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Billing Dashboard
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage patient bills and billing documents
            </p>
          </div>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero">
                <Upload className="mr-2 h-4 w-4" />
                Upload New Bill
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Billing Document</DialogTitle>
                <DialogDescription>
                  Upload a new bill or billing document for a patient.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="patient">Select Patient</Label>
                  <Select
                    value={uploadForm.patientId}
                    onValueChange={(value) => setUploadForm({ ...uploadForm, patientId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockPatients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name} ({patient.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="e.g., Emergency Room Visit, Lab Services..."
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₱)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={uploadForm.amount}
                    onChange={(e) => setUploadForm({ ...uploadForm, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">Upload Document</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Accepted formats: PDF, DOC, DOCX
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="hero" onClick={handleUpload}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Bill
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Admitted Patients</p>
                  <p className="font-display text-2xl font-bold text-foreground">
                    {admittedPatients.length}
                  </p>
                </div>
                <div className="rounded-lg bg-info/10 p-3">
                  <Users className="h-6 w-6 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Balance</p>
                  <p className="font-display text-2xl font-bold text-foreground">
                    ₱{totalPending.toFixed(2)}
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
                  <p className="text-sm text-muted-foreground">Collected</p>
                  <p className="font-display text-2xl font-bold text-foreground">
                    ₱{totalCollected.toFixed(2)}
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
                  <p className="text-sm text-muted-foreground">Total Bills</p>
                  <p className="font-display text-2xl font-bold text-foreground">
                    {mockBills.length}
                  </p>
                </div>
                <div className="rounded-lg bg-primary/10 p-3">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="bills">Bills</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Currently Admitted Patients */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Currently Admitted Patients
                </CardTitle>
                <CardDescription>Patients currently in the hospital</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {admittedPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                          <User className="h-5 w-5 text-accent-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{patient.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {patient.id} • Room {patient.room}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Pending Balance</p>
                          <p className="font-semibold text-foreground">
                            ₱{patient.pendingBalance.toFixed(2)}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Bills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Recent Bills Uploaded
                </CardTitle>
                <CardDescription>Latest billing documents uploaded</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bill ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockBills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell className="font-medium">{bill.id}</TableCell>
                        <TableCell>{bill.patientName}</TableCell>
                        <TableCell>{bill.description}</TableCell>
                        <TableCell>₱{bill.amount.toFixed(2)}</TableCell>
                        <TableCell>{getStatusBadge(bill.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patients">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>All Patients</CardTitle>
                    <CardDescription>View and manage patient records</CardDescription>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search patients..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Total Billed</TableHead>
                      <TableHead>Pending</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">{patient.id}</TableCell>
                        <TableCell>{patient.name}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{patient.email}</p>
                            <p className="text-muted-foreground">{patient.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(patient.status)}</TableCell>
                        <TableCell>{patient.room}</TableCell>
                        <TableCell>₱{patient.totalBilled.toFixed(2)}</TableCell>
                        <TableCell>₱{patient.pendingBalance.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Bill
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bills">
            <Card>
              <CardHeader>
                <CardTitle>All Bills</CardTitle>
                <CardDescription>Complete list of all billing documents</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bill ID</TableHead>
                      <TableHead>Patient ID</TableHead>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Uploaded By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockBills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell className="font-medium">{bill.id}</TableCell>
                        <TableCell>{bill.patientId}</TableCell>
                        <TableCell>{bill.patientName}</TableCell>
                        <TableCell>{new Date(bill.date).toLocaleDateString()}</TableCell>
                        <TableCell>{bill.description}</TableCell>
                        <TableCell>${bill.amount.toFixed(2)}</TableCell>
                        <TableCell>{getStatusBadge(bill.status)}</TableCell>
                        <TableCell>{bill.uploadedBy}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default BillingDashboard;
