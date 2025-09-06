import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SingleDestination from "./pages/SingleDestination";
import RoutePlanning from "./pages/RoutePlanning";
import MultiNode from "./pages/MultiNode";
import AiRecommend from "./pages/AiRecommend";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/single-destination" element={<SingleDestination />} />
          <Route path="/route-planning" element={<RoutePlanning />} />
          <Route path="/multi-node" element={<MultiNode />} />
          <Route path="/ai-recommend" element={<AiRecommend />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
