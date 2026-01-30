import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, MessageSquare, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Article {
  title: string;
  content: string;
}

interface HelpSection {
  section: string;
  articles: Article[];
}

export default function HelpCenter() {
  const [helpContent, setHelpContent] = useState<HelpSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>('Getting Started');
  const navigate = useNavigate();

  useEffect(() => {
    fetchHelpCenter();
  }, []);

  const fetchHelpCenter = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai/help-center');
      const data = await response.json();
      if (data.success) {
        setHelpContent(data.content);
      }
    } catch (error) {
      console.error('Error fetching help center:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen size={32} />
            <h1 className="text-4xl font-bold">Help Center</h1>
          </div>
          <p className="text-blue-100 text-lg">
            Find answers, tutorials, and guidance for using ProjectBill
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <Card className="lg:col-span-3 bg-white p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Access</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => navigate('/faq-search')}
                variant="outline"
                className="h-20 text-left flex flex-col items-start p-4"
              >
                <span className="font-semibold">📋 Search FAQs</span>
                <span className="text-xs text-gray-600">Find answers quickly</span>
              </Button>
              <Button
                onClick={() => navigate('/contact')}
                variant="outline"
                className="h-20 text-left flex flex-col items-start p-4"
              >
                <span className="font-semibold">✉️ Contact Support</span>
                <span className="text-xs text-gray-600">Get in touch with us</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 text-left flex flex-col items-start p-4"
              >
                <span className="font-semibold">💬 Chat with AI</span>
                <span className="text-xs text-gray-600">Real-time assistance</span>
              </Button>
            </div>
          </Card>

          {/* Help Sections */}
          {loading ? (
            <Card className="lg:col-span-3 p-6">
              <p className="text-gray-600 text-center">Loading help articles...</p>
            </Card>
          ) : (
            <div className="lg:col-span-3">
              <div className="space-y-4">
                {helpContent.map((section) => (
                  <Card
                    key={section.section}
                    className="overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <button
                      onClick={() =>
                        setExpandedSection(
                          expandedSection === section.section ? null : section.section
                        )
                      }
                      className="w-full p-6 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <h3 className="text-lg font-bold text-gray-900">
                        {section.section}
                      </h3>
                      <span className="text-gray-400 text-xl">
                        {expandedSection === section.section ? '−' : '+'}
                      </span>
                    </button>

                    {expandedSection === section.section && (
                      <div className="p-6 border-t space-y-6">
                        {section.articles.map((article, idx) => (
                          <div key={idx} className="border-b pb-6 last:border-b-0">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                              {article.title}
                            </h4>
                            <p className="text-gray-600 leading-relaxed">
                              {article.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Additional Resources */}
        <Card className="bg-blue-50 border-2 border-blue-200 p-6">
          <div className="flex gap-4">
            <AlertCircle className="text-blue-600 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Need More Help?</h3>
              <p className="text-gray-700 mb-4">
                Our AI assistant is available 24/7 to answer your questions. Click the chat
                button in the bottom right corner to get started.
              </p>
              <Button
                onClick={() => navigate('/contact')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <MessageSquare size={16} className="mr-2" />
                Contact Our Support Team
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
