import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { 
  FileText, 
  Shield, 
  Clock, 
  Download, 
  Users, 
  CreditCard,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: FileText,
      title: "View Your Bills",
      description: "Access all your hospital bills and billing statements in one secure place."
    },
    {
      icon: Download,
      title: "Download Documents",
      description: "Download itemized bills, payment receipts, and insurance claims anytime."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your medical billing information is protected with enterprise-grade security."
    },
    {
      icon: Clock,
      title: "24/7 Access",
      description: "Check your balances and billing history whenever you need, day or night."
    },
    {
      icon: CreditCard,
      title: "Payment History",
      description: "Track all your payments and outstanding balances in real-time."
    },
    {
      icon: Users,
      title: "Easy Management",
      description: "Simple interface designed for patients of all ages to navigate easily."
    }
  ];

  const benefits = [
    "No more waiting on hold for billing inquiries",
    "Access your statements from any device",
    "Receive notifications for new bills",
    "Download documents for insurance claims",
    "Track your payment history"
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="gradient-hero relative overflow-hidden py-20 lg:py-32">
          <div className="container relative">
            <div className="mx-auto max-w-3xl text-center">
              <div className="animate-fade-in mb-4 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground">
                <Shield className="h-4 w-4" />
                Secure Patient Portal
              </div>
              <h1 className="animate-slide-up font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Your Hospital Bills,{" "}
                <span className="text-primary">Simplified</span>
              </h1>
              <p className="animate-slide-up mt-6 text-lg text-muted-foreground" style={{ animationDelay: "0.1s" }}>
                Access, view, and download your hospital billing documents securely online. 
                Our patient-friendly portal makes managing your healthcare finances easy.
              </p>
              <div className="animate-slide-up mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row" style={{ animationDelay: "0.2s" }}>
                <Button variant="hero" size="xl" asChild>
                  <Link to="/patient/register">
                    Create Patient Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="xl" asChild>
                  <Link to="/patient/login">
                    Sign In to Portal
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        </section>

        {/* Features Section */}
        <section className="py-20 lg:py-28">
          <div className="container">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
                Everything You Need to Manage Your Bills
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Our portal provides all the tools you need to stay on top of your healthcare billing.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <Card 
                  key={feature.title} 
                  className="group border-border/50 bg-card transition-all duration-300 hover:border-primary/20"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-accent transition-colors group-hover:bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-secondary/30 py-20 lg:py-28">
          <div className="container">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
                  Why Choose Our Patient Portal?
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  We've designed our billing portal with patients in mind, making it simple to access and understand your healthcare costs.
                </p>
                <ul className="mt-8 space-y-4">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                      <span className="text-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Button variant="hero" size="lg" asChild>
                    <Link to="/patient/register">
                      Get Started Today
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-accent p-1">
                  <div className="rounded-xl bg-card p-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Current Balance</p>
                          <p className="font-display text-2xl font-bold text-foreground">₱1,245.00</p>
                        </div>
                        <CreditCard className="h-8 w-8 text-primary" />
                      </div>
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">Emergency Room Visit</p>
                            <p className="text-sm text-muted-foreground">Dec 15, 2024</p>
                          </div>
                          <span className="rounded-full bg-warning/10 px-2 py-1 text-xs font-medium text-warning">
                            Pending
                          </span>
                        </div>
                      </div>
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">Lab Work</p>
                            <p className="text-sm text-muted-foreground">Dec 10, 2024</p>
                          </div>
                          <span className="rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
                            Paid
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 lg:py-28">
          <div className="container">
            <div className="mx-auto max-w-3xl rounded-2xl bg-primary p-8 text-center lg:p-12">
              <h2 className="font-display text-2xl font-bold text-primary-foreground sm:text-3xl">
                Ready to Take Control of Your Bills?
              </h2>
              <p className="mt-4 text-primary-foreground/80">
                Create your free account today and access all your hospital billing information in one secure place.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                  asChild
                >
                  <Link to="/patient/register">
                    Create Free Account
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="ghost"
                  className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  asChild
                >
                  <Link to="/billing/login">
                    Billing Staff Login
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
