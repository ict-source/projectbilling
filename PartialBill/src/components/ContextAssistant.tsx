import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Lightbulb, X } from 'lucide-react';

interface ContextAssistantProps {
  context: 'bills' | 'payments' | 'account' | 'notifications';
  title: string;
  question?: string;
}

export const ContextAssistant = ({
  context,
  title,
  question,
}: ContextAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const getContextHelp = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context,
          question: question || title,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResponse(data.response);
      }
    } catch (error) {
      console.error('Error fetching assistant help:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    getContextHelp();
  };

  if (!isOpen) {
    return (
      <Button
        onClick={handleOpen}
        variant="ghost"
        size="sm"
        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
      >
        <Lightbulb size={16} className="mr-1" />
        AI Help
      </Button>
    );
  }

  return (
    <Card className="w-full max-w-md bg-blue-50 border-blue-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="text-blue-600" size={18} />
          <h4 className="font-semibold text-gray-900">AI Assistant Tip</h4>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={18} />
        </button>
      </div>

      {loading ? (
        <p className="text-gray-600 text-sm">Loading suggestion...</p>
      ) : (
        <>
          <p className="text-gray-700 text-sm mb-3 leading-relaxed">{response}</p>
          <Button
            onClick={getContextHelp}
            size="sm"
            variant="outline"
            className="text-xs text-blue-600 border-blue-200 hover:bg-blue-100"
          >
            Get Another Tip
          </Button>
        </>
      )}
    </Card>
  );
};
