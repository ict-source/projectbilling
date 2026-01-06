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

const BillingDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isAddPatientDialogOpen, setIsAddPatientDialogOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadForm, setUploadForm] = useState({
    patientId: "",
    description: "",
    amount: "",
    file: null as File | null
  });
  const [patientForm, setPatientForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    patientId: "",
    admissionDate: "",
    room: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPatients();
    fetchBills();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/patients');
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchBills = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/bills');
      const data = await response.json();
      setBills(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
  };

  const admittedPatients = patients.filter(p => p.status === "admitted");
  const totalPending = bills.filter(b => b.status === "pending").reduce((sum, b) => sum + b.amount, 0);
  const totalCollected = bills.filter(b => b.status === "paid").reduce((sum, b) => sum + b.amount, 0);

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

  const handleUpload = async () => {
    if (!uploadForm.patientId || !uploadForm.description || !uploadForm.amount || !uploadForm.file) {
      toast({
        title: "Error",
        description: "Please fill all fields and select a file.",
        variant: "destructive"
      });
      return;
    }

    const formData = new FormData();
    formData.append('patientId', uploadForm.patientId);
    formData.append('description', uploadForm.description);
    formData.append('amount', uploadForm.amount);
    formData.append('file', uploadForm.file);

    try {
      const response = await fetch('http://localhost:3000/api/bills', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Bill uploaded successfully.",
        });
        setIsUploadDialogOpen(false);
        setUploadForm({ patientId: "", description: "", amount: "", file: null });
        fetchBills(); // Refresh bills list
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload bill. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddPatient = async () => {
    if (!patientForm.firstName || !patientForm.lastName || !patientForm.email || !patientForm.phone || !patientForm.patientId || !patientForm.admissionDate || !patientForm.room) {
      toast({
        title: "Error",
        description: "Please fill all fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(patientForm)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Patient added successfully.",
        });
        setIsAddPatientDialogOpen(false);
        setPatientForm({ firstName: "", lastName: "", email: "", phone: "", patientId: "", admissionDate: "", room: "" });
        fetchPatients(); // Refresh patients list
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add patient');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to add patient. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.patient_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/apmclogo.jpg" alt="APMC Logo" className="h-9 w-9 rounded-lg object-cover" />
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
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.name} ({patient.patient_id})
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
                    {bills.length}
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
                            ₱{patient.pending_balance.toFixed(2)}
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
                    {bills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell className="font-medium">BILL-{bill.id.toString().padStart(3, '0')}</TableCell>
                        <TableCell>{bill.patient_name}</TableCell>
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
                        <TableCell className="font-medium">{patient.patient_id}</TableCell>
                        <TableCell>{patient.name}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{patient.email}</p>
                            <p className="text-muted-foreground">{patient.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(patient.status)}</TableCell>
                        <TableCell>{patient.room}</TableCell>
                        <TableCell>₱{patient.total_billed.toFixed(2)}</TableCell>
                        <TableCell>₱{patient.pending_balance.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setUploadForm({ ...uploadForm, patientId: patient.id.toString() });
                              setIsUploadDialogOpen(true);
                            }}
                          >
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
                    {bills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell className="font-medium">BILL-{bill.id.toString().padStart(3, '0')}</TableCell>
                        <TableCell>{bill.patient_id}</TableCell>
                        <TableCell>{bill.patient_name}</TableCell>
                        <TableCell>{new Date(bill.date).toLocaleDateString()}</TableCell>
                        <TableCell>{bill.description}</TableCell>
                        <TableCell>₱{bill.amount.toFixed(2)}</TableCell>
                        <TableCell>{getStatusBadge(bill.status)}</TableCell>
                        <TableCell>{bill.uploaded_by}</TableCell>
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
