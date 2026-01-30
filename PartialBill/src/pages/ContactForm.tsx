import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ContactForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: user?.email || '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [category, setCategory] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.subject || !formData.message) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId: user?.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTicketId(data.ticketId);
        setCategory(data.category);
        setSubmitted(true);
        toast({
          title: 'Success',
          description: 'Your inquiry has been submitted',
        });
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit form. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Mail className="text-blue-600" size={32} />
            <h1 className="text-4xl font-bold text-gray-900">Contact Support</h1>
          </div>
          <p className="text-gray-600">
            Send us your inquiry and our AI will route it to the right department
          </p>
        </div>

        {/* Success Message */}
        {submitted ? (
          <Card className="bg-green-50 border-2 border-green-200 p-8 text-center">
            <CheckCircle className="text-green-600 mx-auto mb-4" size={48} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Thank You!
            </h2>
            <p className="text-gray-700 mb-4">
              Your inquiry has been submitted successfully.
            </p>

            {/* Ticket Details */}
            <div className="bg-white rounded-lg p-6 mb-6 space-y-3">
              <div>
                <p className="text-sm text-gray-600">Ticket ID</p>
                <p className="text-lg font-mono font-bold text-gray-900">
                  {ticketId}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {category}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estimated Response Time</p>
                <p className="text-lg font-semibold text-gray-900">
                  24 hours
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              We'll send you an email update at <strong>{formData.email}</strong>
            </p>

            <Button
              onClick={() => setSubmitted(false)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Send Another Message
            </Button>
          </Card>
        ) : (
          /* Contact Form */
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="h-10"
                  disabled={!!user?.email}
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Subject
                </label>
                <Input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g., Question about bill payment"
                  className="h-10"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Please describe your issue or question in detail..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* AI Info */}
              <Card className="bg-blue-50 border-blue-200 p-4 flex gap-3">
                <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
                <div className="text-sm text-gray-700">
                  <strong className="text-blue-900">Powered by AI:</strong> Our system will
                  automatically categorize your inquiry and route it to the appropriate
                  department for faster resolution.
                </div>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 h-10 text-base"
              >
                {loading ? 'Submitting...' : 'Submit Inquiry'}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
