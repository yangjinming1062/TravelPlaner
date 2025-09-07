import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// 认证组件
import ProtectedRoute from "./components/auth/ProtectedRoute";

// 用户认证和设置页面
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import PreferencesSetupPage from "./pages/PreferencesSetup";
import UserCenterPage from "./pages/UserCenter";
import PlanningHistoryPage from "./pages/PlanningHistory";

import SingleTaskPage from "./pages/single/task";
import SingleResultPage from "./pages/single/result";
import RouteTaskPage from "./pages/route/task";
import RouteResultPage from "./pages/route/result";
import MultiTaskPage from "./pages/multi/task";
import MultiResultPage from "./pages/multi/result";
import SmartTaskPage from "./pages/smart/task";
import SmartResultPage from "./pages/smart/result";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* 用户认证和设置路由 */}
          <Route path="/login" element={
            <ProtectedRoute requireAuth={false}>
              <LoginPage />
            </ProtectedRoute>
          } />
          <Route path="/register" element={
            <ProtectedRoute requireAuth={false}>
              <RegisterPage />
            </ProtectedRoute>
          } />
          <Route path="/preferences-setup" element={
            <ProtectedRoute>
              <PreferencesSetupPage />
            </ProtectedRoute>
          } />
          <Route path="/user-center" element={
            <ProtectedRoute>
              <UserCenterPage />
            </ProtectedRoute>
          } />
          <Route path="/planning-history" element={
            <ProtectedRoute>
              <PlanningHistoryPage />
            </ProtectedRoute>
          } />
          
          {/* 单一目的地模式路由 */}
          <Route path="/single/task" element={
            <ProtectedRoute>
              <SingleTaskPage />
            </ProtectedRoute>
          } />
          <Route path="/single/list" element={
            <ProtectedRoute>
              <Navigate to="/planning-history?type=single" replace />
            </ProtectedRoute>
          } />
          <Route path="/single/result/:taskId" element={
            <ProtectedRoute>
              <SingleResultPage />
            </ProtectedRoute>
          } />
          
          {/* 沿途游玩模式路由 */}
          <Route path="/route/task" element={
            <ProtectedRoute>
              <RouteTaskPage />
            </ProtectedRoute>
          } />
          <Route path="/route/list" element={
            <ProtectedRoute>
              <Navigate to="/planning-history?type=route" replace />
            </ProtectedRoute>
          } />
          <Route path="/route/result/:taskId" element={
            <ProtectedRoute>
              <RouteResultPage />
            </ProtectedRoute>
          } />
          
          {/* 多节点模式路由 */}
          <Route path="/multi/task" element={
            <ProtectedRoute>
              <MultiTaskPage />
            </ProtectedRoute>
          } />
          <Route path="/multi/list" element={
            <ProtectedRoute>
              <Navigate to="/planning-history?type=multi" replace />
            </ProtectedRoute>
          } />
          <Route path="/multi/result/:taskId" element={
            <ProtectedRoute>
              <MultiResultPage />
            </ProtectedRoute>
          } />
          
          {/* 智能推荐模式路由 */}
          <Route path="/smart/task" element={
            <ProtectedRoute>
              <SmartTaskPage />
            </ProtectedRoute>
          } />
          <Route path="/smart/list" element={
            <ProtectedRoute>
              <Navigate to="/planning-history?type=smart" replace />
            </ProtectedRoute>
          } />
          <Route path="/smart/result/:taskId" element={
            <ProtectedRoute>
              <SmartResultPage />
            </ProtectedRoute>
          } />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
