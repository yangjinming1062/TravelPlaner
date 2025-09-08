import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      '404 Error: User attempted to access non-existent route:',
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-4">
        <h1 className="text-6xl font-bold mb-4 text-primary">404</h1>
        <h2 className="text-2xl font-semibold mb-4">页面未找到</h2>
        <p className="text-muted-foreground mb-8">
          抱歉，您访问的页面不存在或已被移除
        </p>
        <Button
          onClick={() => (window.location.href = '/')}
          size="lg"
          className="shadow-soft"
        >
          返回首页
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
