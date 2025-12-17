// src/components/SessionTimeoutModal.tsx
import React from 'react';
import { Clock, LogOut, RefreshCw } from 'lucide-react';
import { useSessionTimeoutModal } from '../hooks/use-auth';

const SessionTimeoutModal: React.FC = () => {
  const { isOpen, timeRemaining, handleStaySignedIn, handleLogout } = useSessionTimeoutModal();
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Session About to Expire</h3>
              <p className="text-sm text-gray-600 mt-1">
                Your session will expire in {timeRemaining} minute{timeRemaining !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                For security reasons, your session will expire due to inactivity.
                Do you want to stay signed in?
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleStaySignedIn}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <RefreshCw className="h-4 w-4" />
                Stay Signed In
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutModal;