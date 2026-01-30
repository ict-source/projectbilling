import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  HelpCircle,
  BookOpen,
  MessageSquare,
  FileQuestion,
  ChevronRight,
} from 'lucide-react';

export const HelpNavigation = () => {
  return (
    <div className="flex items-center gap-2">
      {/* Help Center Link */}
      <Link to="/help-center">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-700 hover:text-blue-600 hover:bg-blue-50"
          title="Visit Help Center"
        >
          <BookOpen size={18} />
          <span className="hidden md:inline ml-2">Help</span>
        </Button>
      </Link>

      {/* FAQ Link */}
      <Link to="/faq-search">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-700 hover:text-blue-600 hover:bg-blue-50"
          title="Search FAQs"
        >
          <FileQuestion size={18} />
          <span className="hidden md:inline ml-2">FAQs</span>
        </Button>
      </Link>

      {/* Contact Link */}
      <Link to="/contact">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-700 hover:text-blue-600 hover:bg-blue-50"
          title="Contact Support"
        >
          <MessageSquare size={18} />
          <span className="hidden md:inline ml-2">Support</span>
        </Button>
      </Link>
    </div>
  );
};

export const HelpMenu = () => {
  return (
    <div className="space-y-2">
      <Link to="/help-center" className="block">
        <Button variant="ghost" className="w-full justify-start" size="sm">
          <HelpCircle size={18} className="mr-2" />
          <span>Help Center</span>
          <ChevronRight size={16} className="ml-auto" />
        </Button>
      </Link>
      <Link to="/faq-search" className="block">
        <Button variant="ghost" className="w-full justify-start" size="sm">
          <FileQuestion size={18} className="mr-2" />
          <span>Search FAQs</span>
          <ChevronRight size={16} className="ml-auto" />
        </Button>
      </Link>
      <Link to="/contact" className="block">
        <Button variant="ghost" className="w-full justify-start" size="sm">
          <MessageSquare size={18} className="mr-2" />
          <span>Contact Support</span>
          <ChevronRight size={16} className="ml-auto" />
        </Button>
      </Link>
    </div>
  );
};
