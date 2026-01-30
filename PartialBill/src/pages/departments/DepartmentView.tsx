import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, FlaskConical, Activity, Eye, Heart, Pill, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Service {
    name: string;
    price: number;
}

interface Department {
    id: string;
    name: string;
    description: string;
    services: Service[];
}

const DepartmentView = () => {
    const { type } = useParams<{ type: string }>();
    const [department, setDepartment] = useState<Department | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchDepartment = async () => {
            try {
                const response = await fetch(`/api/departments/${type}`);
                if (response.ok) {
                    const data = await response.json();
                    setDepartment(data);
                }
            } catch (error) {
                console.error("Error fetching department:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDepartment();
    }, [type]);

    const getIcon = (id: string) => {
        switch (id) {
            case 'laboratory': return <FlaskConical className="h-8 w-8 text-blue-500" />;
            case 'radiology': return <Activity className="h-8 w-8 text-purple-500" />;
            case 'eye-center': return <Eye className="h-8 w-8 text-green-500" />;
            case 'heart-center': return <Heart className="h-8 w-8 text-red-500" />;
            case 'pharmacy': return <Pill className="h-8 w-8 text-orange-500" />;
            default: return <Search className="h-8 w-8 text-gray-500" />;
        }
    };

    const filteredServices = department?.services.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading department info...</div>;
    }

    if (!department) {
        return (
            <div className="container py-12 text-center">
                <h2 className="text-2xl font-bold">Department Not Found</h2>
                <Link to="/patient/dashboard">
                    <Button className="mt-4" variant="outline">
                        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-12">
            <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
                <div className="container flex h-16 items-center gap-4">
                    <Link to="/patient/dashboard">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                        {getIcon(department.id)}
                        <h1 className="text-xl font-bold">{department.name}</h1>
                    </div>
                </div>
            </header>

            <main className="container py-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>About our {department.name} services</CardTitle>
                            <CardDescription>{department.description}</CardDescription>
                        </CardHeader>
                    </Card>

                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-2xl font-semibold">Prices & Services</h2>
                        <div className="relative w-full max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search services..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Service Name</TableHead>
                                    <TableHead className="text-right">Price (PHP)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredServices.length > 0 ? (
                                    filteredServices.map((service, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{service.name}</TableCell>
                                            <TableCell className="text-right">₱{service.price.toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                                            No services found matching your search.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>

                    <div className="bg-muted p-6 rounded-lg border border-dashed text-center">
                        <p className="text-sm text-muted-foreground mb-4">
                            Need a service not listed here? Inquire with our AI assistant or contact support.
                        </p>
                        <Link to="/contact">
                            <Button variant="secondary">Inquire Now</Button>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DepartmentView;
