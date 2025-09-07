import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Plus, 
  Search,
  Navigation,
  Calendar,
  MapPin,
  Heart,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRoutePlansList, useUpdatePlanFavorite } from "@/hooks/use-api";

const RouteListPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    page: 0,
    size: 20,
    sort: ["-created_at"],
    query: {}
  });

  // 这里应该使用实际的API hook
  const isLoading = false;
  const isError = false;
  const plansList = { total: 0, data: [] };

  const handleSearch = () => {
    // 实现搜索逻辑
  };

  const handleFavoriteToggle = (planId: string, isFavorite: boolean) => {
    // 实现收藏切换逻辑
  };

  const handlePlanClick = (planId: string) => {
    navigate(`/route/result/${planId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-6">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
            <div>
              <h1 className="text-2xl font-bold">沿途游玩规划</h1>
              <p className="text-white/90">管理您的沿途游玩历史</p>
            </div>
          </div>
          <Button 
            variant="secondary" 
            onClick={() => navigate('/route/task')}
          >
            <Plus className="w-4 h-4 mr-2" />
            新建规划
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* 搜索和筛选 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">搜索和筛选</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="搜索规划标题或路线..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                搜索
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 空状态 */}
        <Card className="text-center py-12">
          <CardContent>
            <Navigation className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">暂无沿途游玩规划</h3>
            <p className="text-gray-500 mb-6">开始创建您的第一个沿途游玩规划吧！</p>
            <Button onClick={() => navigate('/route/task')}>
              <Plus className="w-4 h-4 mr-2" />
              创建新规划
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RouteListPage;
