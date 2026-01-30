import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, AlertCircle } from 'lucide-react';

interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
}

export default function AIFAQSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchFAQs();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      filterFAQs();
    } else {
      setFilteredFaqs(faqs);
    }
  }, [searchTerm, faqs]);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai/faq');
      const data = await response.json();
      setFaqs(data);
      setFilteredFaqs(data);
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      setError('Failed to load FAQs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterFAQs = async () => {
    try {
      const response = await fetch(`/api/ai/faq?search=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      setFilteredFaqs(data);
    } catch (err) {
      console.error('Error searching FAQs:', err);
      setError('Search failed. Please try again.');
    }
  };

  const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI FAQ Search</h1>
          <p className="text-gray-600">Find answers to your billing and account questions</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <Input
            placeholder="Search FAQs (e.g., 'How do I pay a bill?')"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-lg border-2 border-blue-200 focus:border-blue-500"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-2 text-red-700">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading FAQs...</p>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No FAQs found matching your search.</p>
            <Button onClick={() => setSearchTerm('')} variant="outline">
              Clear Search
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedFaqs).map(([category, items]) => (
              <div key={category}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  {category}
                </h2>
                <div className="space-y-3">
                  {items.map((faq) => (
                    <Card
                      key={faq.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() =>
                        setExpandedId(expandedId === faq.id ? null : faq.id)
                      }
                    >
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 flex justify-between items-start">
                          <span className="flex-1">{faq.question}</span>
                          <span className="text-gray-400 ml-2">
                            {expandedId === faq.id ? '−' : '+'}
                          </span>
                        </h3>
                        {expandedId === faq.id && (
                          <p className="mt-3 text-gray-600 leading-relaxed">
                            {faq.answer}
                          </p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Count */}
        {!loading && filteredFaqs.length > 0 && (
          <div className="text-center mt-8 text-sm text-gray-600">
            Found {filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
