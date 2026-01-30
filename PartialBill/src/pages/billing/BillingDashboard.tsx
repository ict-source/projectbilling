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
  Building2,
  CloudUpload,
  FileSpreadsheet,
  Edit,
  Trash2
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/contexts/NotificationContext";
import NotificationDropdown from "@/components/NotificationDropdown";
import { ContextAssistant } from "@/components/ContextAssistant";
import { HelpNavigation } from "@/components/HelpNavigation";

interface Bill {
  id: number;
  patient_id: number;
  patient_name: string;
  amount: number;
  description: string;
  date: string;
  status: string;
  uploaded_by: string;
  file_path?: string;
}

const BillingDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isAddPatientDialogOpen, setIsAddPatientDialogOpen] = useState(false);
  const [isEditPatientDialogOpen, setIsEditPatientDialogOpen] = useState(false);
  const [isEditBillDialogOpen, setIsEditBillDialogOpen] = useState(false);
  const [isViewPatientDialogOpen, setIsViewPatientDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
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
  const [editForm, setEditForm] = useState({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    patientId: "",
    admissionDate: "",
    room: "",
    status: ""
  });
  const [editBillForm, setEditBillForm] = useState({
    id: "",
    description: "",
    amount: "",
    status: ""
  });
  const [backupLoading, setBackupLoading] = useState(false);
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  useEffect(() => {
    fetchPatients();
    fetchBills();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients');
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchBills = async () => {
    try {
      const response = await fetch('/api/bills');
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
      const response = await fetch('/api/bills', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Bill uploaded successfully.",
        });
        addNotification(
          `New bill uploaded for patient ${uploadForm.patientId}. Amount: ₱${uploadForm.amount}`,
          'success'
        );
        setIsUploadDialogOpen(false);
        setUploadForm({ patientId: "", description: "", amount: "", file: null });
        fetchBills(); // Refresh bills list
        fetchPatients(); // Refresh patients list
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
      const response = await fetch('/api/patients', {
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
        addNotification(
          `New patient ${patientForm.firstName} ${patientForm.lastName} added to the system.`,
          'info'
        );
        setIsAddPatientDialogOpen(false);
        setPatientForm({ firstName: "", lastName: "", email: "", phone: "", patientId: "", admissionDate: "", room: "" });
        fetchPatients(); // Refresh patients list
      } else {
        let errorMessage = 'Failed to add patient';
        try {
          const error = await response.json();
          errorMessage = error.message || error.error || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to add patient. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditPatient = async () => {
    if (!editForm.firstName || !editForm.lastName || !editForm.email || !editForm.phone || !editForm.patientId || !editForm.admissionDate || !editForm.room) {
      toast({
        title: "Error",
        description: "Please fill all fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`/api/patients/${editForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Patient updated successfully.",
        });
        addNotification(
          `Patient ${editForm.firstName} ${editForm.lastName} information has been updated.`,
          'info'
        );
        setIsEditPatientDialogOpen(false);
        fetchPatients();
      } else {
        let errorMessage = 'Failed to update patient';
        try {
          const error = await response.json();
          errorMessage = error.message || error.error || errorMessage;
        } catch (e) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update patient. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeletePatient = async (patientId) => {
    if (!confirm('Are you sure you want to delete this patient? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Patient deleted successfully.",
        });
        fetchPatients();
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete patient. Please try again.",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (patient) => {
    setEditForm({
      id: patient.id,
      firstName: patient.first_name || patient.name.split(' ')[0],
      lastName: patient.last_name || patient.name.split(' ')[1] || '',
      email: patient.email,
      phone: patient.phone,
      patientId: patient.patient_id,
      admissionDate: patient.admission_date,
      room: patient.room,
      status: patient.status
    });
    setIsEditPatientDialogOpen(true);
  };

  const handleEditBill = async () => {
    if (!editBillForm.description || !editBillForm.amount) {
      toast({
        title: "Error",
        description: "Please fill all fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`/api/bills/${editBillForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editBillForm)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Bill updated successfully.",
        });
        setIsEditBillDialogOpen(false);
        fetchBills();
        fetchPatients();
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update bill. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteBill = async (billId) => {
    if (!confirm('Are you sure you want to delete this bill? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/bills/${billId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Bill deleted successfully.",
        });
        fetchBills();
        fetchPatients();
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete bill. Please try again.",
        variant: "destructive"
      });
    }
  };

  const openEditBillDialog = (bill) => {
    setEditBillForm({
      id: bill.id,
      description: bill.description,
      amount: bill.amount.toString(),
      status: bill.status
    });
    setIsEditBillDialogOpen(true);
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.patient_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBackupToDrive = async () => {
    setBackupLoading(true);
    try {
      const response = await fetch('/api/backup/drive', {
        method: 'POST'
      });
      const result = await response.json();
      if (result.success) {
        toast({
          title: "Success",
          description: `Backup completed: ${result.folderName}`,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to backup to Google Drive. Please try again.",
        variant: "destructive"
      });
    }
    setBackupLoading(false);
  };

  const handleExportToSheets = async () => {
    setBackupLoading(true);
    try {
      const response = await fetch('/api/backup/sheets', {
        method: 'POST'
      });
      const result = await response.json();
      if (result.success) {
        toast({
          title: "Success",
          description: `Data exported: ${result.title}`,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export to Google Sheets. Please try again.",
        variant: "destructive"
      });
    }
    setBackupLoading(false);
  };

  const downloadAllBills = (bills: Bill[]) => {
    if (bills.length === 0) {
      toast({
        title: "No Bills",
        description: "There are no bills to download.",
        variant: "destructive"
      });
      return;
    }

    // Create CSV content
    const headers = ['Bill ID', 'Patient ID', 'Patient Name', 'Date', 'Description', 'Amount', 'Status', 'Uploaded By'];
    const csvContent = [
      headers.join(','),
      ...bills.map(bill => [
        `BILL-${bill.id.toString().padStart(3, '0')}`,
        bill.patient_id,
        `"${bill.patient_name.replace(/"/g, '""')}"`,
        new Date(bill.date).toLocaleDateString(),
        `"${bill.description.replace(/"/g, '""')}"`,
        bill.amount.toFixed(2),
        bill.status,
        bill.uploaded_by
      ].join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `all-bills-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download Complete",
      description: "All bills have been downloaded.",
    });
  };

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
            <HelpNavigation />
            <NotificationDropdown />
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">Billing Admin</p>
                <p className="text-xs text-muted-foreground">Staff ID: STF-001</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsAddPatientDialogOpen(true)}
              title="Add Patient"
            >
              <Plus className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackupToDrive}
              disabled={backupLoading}
              title="Backup to Google Drive"
            >
              <CloudUpload className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExportToSheets}
              disabled={backupLoading}
              title="Export to Google Sheets"
            >
              <FileSpreadsheet className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => downloadAllBills(bills)}
              title="Download All Bills"
            >
              <FileText className="h-5 w-5" />
            </Button>
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
        </div>

        {/* AI Assistant Tip */}
        <div className="mb-8">
          <ContextAssistant context="payments" title="Managing Patient Bills" />
        </div>
          <Dialog open={isAddPatientDialogOpen} onOpenChange={setIsAddPatientDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Patient</DialogTitle>
                <DialogDescription>
                  Add a new patient to the system.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={patientForm.firstName}
                      onChange={(e) => setPatientForm({ ...patientForm, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={patientForm.lastName}
                      onChange={(e) => setPatientForm({ ...patientForm, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@email.com"
                    value={patientForm.email}
                    onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="(+63) 123-4567"
                    value={patientForm.phone}
                    onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patientId">Patient ID</Label>
                  <Input
                    id="patientId"
                    placeholder="PAT-004"
                    value={patientForm.patientId}
                    onChange={(e) => setPatientForm({ ...patientForm, patientId: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="admissionDate">Admission Date</Label>
                    <Input
                      id="admissionDate"
                      type="date"
                      value={patientForm.admissionDate}
                      onChange={(e) => setPatientForm({ ...patientForm, admissionDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="room">Room</Label>
                    <Input
                      id="room"
                      placeholder="101A"
                      value={patientForm.room}
                      onChange={(e) => setPatientForm({ ...patientForm, room: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddPatientDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="hero" onClick={handleAddPatient}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Patient
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditPatientDialogOpen} onOpenChange={setIsEditPatientDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Patient</DialogTitle>
                <DialogDescription>
                  Update patient information.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editFirstName">First Name</Label>
                    <Input
                      id="editFirstName"
                      placeholder="John"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editLastName">Last Name</Label>
                    <Input
                      id="editLastName"
                      placeholder="Doe"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editEmail">Email</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    placeholder="john.doe@email.com"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editPhone">Phone</Label>
                  <Input
                    id="editPhone"
                    placeholder="(+63) 123-4567"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editPatientId">Patient ID</Label>
                  <Input
                    id="editPatientId"
                    placeholder="PAT-004"
                    value={editForm.patientId}
                    onChange={(e) => setEditForm({ ...editForm, patientId: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editAdmissionDate">Admission Date</Label>
                    <Input
                      id="editAdmissionDate"
                      type="date"
                      value={editForm.admissionDate}
                      onChange={(e) => setEditForm({ ...editForm, admissionDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editRoom">Room</Label>
                    <Input
                      id="editRoom"
                      placeholder="101A"
                      value={editForm.room}
                      onChange={(e) => setEditForm({ ...editForm, room: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editStatus">Status</Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admitted">Admitted</SelectItem>
                      <SelectItem value="discharged">Discharged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditPatientDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="hero" onClick={handleEditPatient}>
                  <Edit className="mr-2 h-4 w-4" />
                  Update Patient
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditBillDialogOpen} onOpenChange={setIsEditBillDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Bill</DialogTitle>
                <DialogDescription>
                  Update bill information.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="editBillDescription">Description</Label>
                  <Textarea
                    id="editBillDescription"
                    placeholder="e.g., Emergency Room Visit, Lab Services..."
                    value={editBillForm.description}
                    onChange={(e) => setEditBillForm({ ...editBillForm, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editBillAmount">Amount (₱)</Label>
                  <Input
                    id="editBillAmount"
                    type="number"
                    placeholder="0.00"
                    value={editBillForm.amount}
                    onChange={(e) => setEditBillForm({ ...editBillForm, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editBillStatus">Status</Label>
                  <Select
                    value={editBillForm.status}
                    onValueChange={(value) => setEditBillForm({ ...editBillForm, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditBillDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="hero" onClick={handleEditBill}>
                  <Edit className="mr-2 h-4 w-4" />
                  Update Bill
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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

          <Dialog open={isViewPatientDialogOpen} onOpenChange={setIsViewPatientDialogOpen}>
            <DialogContent className="sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle>Patient Details</DialogTitle>
                <DialogDescription>
                  View patient information and billing history
                </DialogDescription>
              </DialogHeader>
              {selectedPatient && (
                <div className="space-y-6">
                  {/* Patient Info */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Patient ID</Label>
                      <p className="text-sm font-medium">{selectedPatient.patient_id}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <p className="text-sm font-medium">{selectedPatient.name}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <p className="text-sm font-medium">{selectedPatient.email}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <p className="text-sm font-medium">{selectedPatient.phone}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Room</Label>
                      <p className="text-sm font-medium">{selectedPatient.room}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      {getStatusBadge(selectedPatient.status)}
                    </div>
                  </div>

                  {/* Billing Summary */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Total Billed</p>
                        <p className="font-display text-xl font-bold text-foreground">
                          ₱{selectedPatient.total_billed.toFixed(2)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Pending Balance</p>
                        <p className="font-display text-xl font-bold text-foreground">
                          ₱{selectedPatient.pending_balance.toFixed(2)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Paid Amount</p>
                        <p className="font-display text-xl font-bold text-foreground">
                          ₱{(selectedPatient.total_billed - selectedPatient.pending_balance).toFixed(2)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Patient Bills */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Billing History</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bill ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bills
                          .filter(bill => bill.patient_id === selectedPatient.id)
                          .map((bill) => (
                            <TableRow key={bill.id}>
                              <TableCell className="font-medium">BILL-{bill.id.toString().padStart(3, '0')}</TableCell>
                              <TableCell>{new Date(bill.date).toLocaleDateString()}</TableCell>
                              <TableCell>{bill.description}</TableCell>
                              <TableCell>₱{bill.amount.toFixed(2)}</TableCell>
                              <TableCell>{getStatusBadge(bill.status)}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewPatientDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPatient(patient);
                            setIsViewPatientDialogOpen(true);
                          }}
                        >
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
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPatient(patient);
                                setIsViewPatientDialogOpen(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(patient)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePatient(patient.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
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
                          </div>
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
                      <TableHead className="text-right">Actions</TableHead>
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
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditBillDialog(bill)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteBill(bill.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
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
