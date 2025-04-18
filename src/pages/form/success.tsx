import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const url = searchParams.get('url');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full mx-auto p-8 bg-white rounded-lg shadow-lg text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Website Generated Successfully!
          </h1>
          <p className="text-gray-600 mb-6">
            Your website has been generated and is now being deployed. It may take a few minutes to be fully ready.
          </p>

          {url && (
            <div className="space-y-4">
              <Button
                asChild
                className="w-full"
              >
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Your Website
                </a>
              </Button>

              <p className="text-sm text-gray-500">
                Bookmark this URL to access your website later:
                <br />
                <code className="bg-gray-100 px-2 py-1 rounded text-sm mt-1 block break-all">
                  {url}
                </code>
              </p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help? Contact our support team at{' '}
              <a
                href="mailto:support@example.com"
                className="text-primary hover:underline"
              >
                support@example.com
              </a>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
} 