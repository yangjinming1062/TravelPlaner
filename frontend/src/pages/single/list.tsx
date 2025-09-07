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
  MapPin,
  Calendar,
  CreditCard,
  Heart,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSinglePlansList, useUpdatePlanFavorite } from "@/hooks/use-api";
import { CompactPlanSummary } from "@/components/shared/PlanSummary";
import { PlanningSingleListRequest, PlanningTaskItemBase } from "@/types/planning";

const SingleListPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<PlanningSingleListRequest>({
    page: 0,
    size: 20,
    sort: ["-created_at"],
    query: {}
  });

  const { 
    data: plansList, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useSinglePlansList(filters);

  const { mutate: updateFavorite } = useUpdatePlanFavorite();

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      page: 0,
      query: {
        ...prev.query,
        title: searchQuery || undefined,
      }
    }));
  };

  const handleFavoriteToggle = (planId: string, isFavorite: boolean) => {
    updateFavorite(
      { taskType: "single", taskId: planId, data: { is_favorite: isFavorite } },
      {
        onSuccess: () => {
          toast({
            title: isFavorite ? "已添加到收藏" : "已取消收藏",
          });
          refetch();
        },
        onError: (error) => {
          toast({
            title: "操作失败",
            description: error.message || "无法更新收藏状态，请稍后重试。",
            variant: "destructive",
          });
        }
      }
    );
  };

  const handlePlanClick = (planId: string) => {
    navigate(`/single/result/${planId}`);
  };

  const handleLoadMore = () => {
    setFilters(prev => ({
      ...prev,
      page: (prev.page || 0) + 1
    }));
  };

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500" />
          <h2 className="text-2xl font-bold mt-4">获取规划列表失败</h2>
          <p className="mt-2 text-gray-500">
            {error?.message || "无法获取规划列表，请稍后重试。"}
          </p>
          <Button className="mt-6" onClick={() => refetch()}>
            重新加载
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-6">
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
              <h1 className="text-2xl font-bold">单一目的地规划</h1>
              <p className="text-white/90">管理您的旅行规划历史</p>
            </div>
          </div>
          <Button 
            variant="secondary" 
            onClick={() => navigate('/single/task')}
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
                  placeholder="搜索规划标题或目的地..."
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

        {/* 统计信息 */}
        {plansList && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{plansList.total}</div>
                  <div className="text-sm text-gray-600">总规划数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {plansList.data.filter(p => p.status === 'completed').length}
                  </div>
                  <div className="text-sm text-gray-600">已完成</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {plansList.data.filter(p => p.status === 'processing').length}
                  </div>
                  <div className="text-sm text-gray-600">处理中</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {plansList.data.filter(p => (p as any).is_favorite).length || 0}
                  </div>
                  <div className="text-sm text-gray-600">已收藏</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 规划列表 */}
        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
            <p className="mt-4">加载规划列表中...</p>
          </div>
        )}

        {plansList && plansList.data.length > 0 ? (
          <div className="space-y-4">
            {plansList.data.map((plan) => (
              <Card key={plan.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-grow">
                      <h3 
                        className="font-medium mb-1 hover:text-blue-600 cursor-pointer"
                        onClick={() => handlePlanClick(plan.id)}
                      >
                        {plan.title || `前往${(plan as any).target}的旅行计划`}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {plan.source} → {(plan as any).target}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(plan.departure_date).toLocaleDateString()} - {new Date(plan.return_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={plan.status === 'completed' ? 'default' : 
                                  plan.status === 'processing' ? 'secondary' :
                                  plan.status === 'failed' ? 'destructive' : 'outline'}
                        >
                          {plan.status === 'completed' ? '已完成' :
                           plan.status === 'processing' ? '处理中' :
                           plan.status === 'failed' ? '失败' : '待处理'}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          创建于 {new Date(plan.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFavoriteToggle(plan.id, !(plan as any).is_favorite);
                        }}
                        className={`p-2 ${(plan as any).is_favorite ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'}`}
                      >
                        <Heart className={`w-4 h-4 ${(plan as any).is_favorite ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* 加载更多按钮 */}
            {plansList.total > plansList.data.length && (
              <div className="text-center mt-8">
                <Button variant="outline" onClick={handleLoadMore}>
                  加载更多
                </Button>
              </div>
            )}
          </div>
        ) : (
          !isLoading && (
            <Card className="text-center py-12">
              <CardContent>
                <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">暂无规划记录</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery ? "没有找到匹配的规划记录" : "开始创建您的第一个旅行规划吧！"}
                </p>
                <Button onClick={() => navigate('/single/task')}>
                  <Plus className="w-4 h-4 mr-2" />
                  创建新规划
                </Button>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
};

export default SingleListPage;
