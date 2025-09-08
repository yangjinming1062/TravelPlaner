import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
}) => {
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem('token');

  if (requireAuth && !isLoggedIn) {
    // 保存用户想要访问的页面，登录后可以重定向回去
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  }

  if (!requireAuth && isLoggedIn) {
    // 如果已经登录，不应该访问登录/注册页面，重定向到首页
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
