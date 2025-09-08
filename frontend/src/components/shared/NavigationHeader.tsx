import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, History, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/use-api';

interface NavigationHeaderProps {
  title: string;
  description: string;
  backPath?: string;
  className?: string;
}

const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  title,
  description,
  backPath = '/',
  className = 'bg-gradient-to-r from-blue-500 to-blue-600',
}) => {
  const navigate = useNavigate();
  const { data: userProfile } = useUserProfile();
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <header className={`text-white py-6 ${className}`}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            onClick={() => navigate(backPath)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-white/90">{description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isLoggedIn && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 hidden md:flex"
                onClick={() => navigate('/planning-history')}
              >
                <History className="w-4 h-4 mr-2" />
                规划历史
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => navigate('/user-center')}
              >
                <User className="w-4 h-4 mr-2" />
                {(userProfile as any)?.nickname ||
                  (userProfile as any)?.username ||
                  '用户中心'}{' '}
                {/* eslint-disable-line @typescript-eslint/no-explicit-any */}
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavigationHeader;
