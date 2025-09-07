import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/preferences-setup" element={<PreferencesSetupPage />} />
          <Route path="/user-center" element={<UserCenterPage />} />
          <Route path="/planning-history" element={<PlanningHistoryPage />} />
          
          {/* 单一目的地模式路由 */}
          <Route path="/single/task" element={<SingleTaskPage />} />
          <Route path="/single/list" element={<Navigate to="/planning-history?type=single" replace />} />
          <Route path="/single/result/:taskId" element={<SingleResultPage />} />
          
          {/* 沿途游玩模式路由 */}
          <Route path="/route/task" element={<RouteTaskPage />} />
          <Route path="/route/list" element={<Navigate to="/planning-history?type=route" replace />} />
          <Route path="/route/result/:taskId" element={<RouteResultPage />} />
          
          {/* 多节点模式路由 */}
          <Route path="/multi/task" element={<MultiTaskPage />} />
          <Route path="/multi/list" element={<Navigate to="/planning-history?type=multi" replace />} />
          <Route path="/multi/result/:taskId" element={<MultiResultPage />} />
          
          {/* 智能推荐模式路由 */}
          <Route path="/smart/task" element={<SmartTaskPage />} />
          <Route path="/smart/list" element={<Navigate to="/planning-history?type=smart" replace />} />
          <Route path="/smart/result/:taskId" element={<SmartResultPage />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
