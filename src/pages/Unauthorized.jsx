import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export function Unauthorized() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-6xl font-bold text-gray-200">403</p>
        <h1 className="text-xl font-semibold text-gray-800 mt-4">
          Access Denied
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          You don't have permission to view this page.
        </p>
        <Button className="mt-6" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}