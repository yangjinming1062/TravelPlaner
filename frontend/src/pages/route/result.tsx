import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Loader2,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRoutePlanResult, useUpdatePlanFavorite } from "@/hooks/use-api";

// 导入公共组件
import { PlanSummary } from "@/components/shared/PlanSummary";
import { DailyPlanList } from "@/components/shared/DailyPlan";
import { RouteInfoList, RouteSummary } from "@/components/shared/RouteInfo";
import { WaypointsList } from "@/components/shared/Waypoints";

const RouteResultPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: planResult, isLoading, isError, error } = useRoutePlanResult(taskId || "");
  const { mutate: updateFavorite } = useUpdatePlanFavorite();
  
  const handleFavoriteToggle = (planId: string, isFavorite: boolean) => {
    updateFavorite(
      { taskType: "route", taskId: planId, data: { is_favorite: isFavorite } },
      {
        onSuccess: () => {
          toast({
            title: isFavorite ? "已添加到收藏" : "已取消收藏",
          });
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

  const handleShare = (planId: string) => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "链接已复制",
      description: "已复制分享链接到剪贴板",
    });
  };

  const handleExport = (planId: string) => {
    toast({
      title: "导出功能",
      description: "导出功能开发中...",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-orange-500" />
          <p className="mt-4 text-lg">正在生成您的沿途游玩方案...</p>
          <p className="text-gray-500">这可能需要一些时间</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500" />
          <h2 className="text-2xl font-bold mt-4">获取规划结果失败</h2>
          <p className="mt-2 text-gray-500">
            {error?.message || "无法获取旅行计划，请稍后重试。"}
          </p>
          <Button 
            className="mt-6" 
            onClick={() => navigate(-1)}
          >
            返回上一页
          </Button>
        </div>
      </div>
    );
  }

  if (!planResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">未找到规划结果</h2>
          <p className="mt-2 text-gray-500">
            该旅行计划可能仍在生成中或已被删除。
          </p>
          <Button 
            className="mt-6" 
            onClick={() => navigate(-1)}
          >
            返回上一页
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-6">
        <div className="container mx-auto px-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-white hover:bg-white/20"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">沿途游玩规划结果</h1>
            <p className="text-white/90">发现旅途中的每一处美景</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* 规划概览 */}
        <PlanSummary 
          plan={planResult as any}
          onToggleFavorite={handleFavoriteToggle}
          onShare={handleShare}
          onExport={handleExport}
        />

        {/* 路线总览 */}
        {planResult.route_plan && planResult.route_plan.length > 0 && (
          <RouteSummary routePlans={planResult.route_plan} />
        )}

        {/* 途经景点 */}
        {planResult.waypoints && planResult.waypoints.length > 0 && (
          <WaypointsList waypoints={planResult.waypoints} />
        )}

        {/* 详细路线信息 */}
        {planResult.route_plan && planResult.route_plan.length > 0 && (
          <RouteInfoList routePlans={planResult.route_plan} />
        )}

        {/* 每日行程安排 */}
        {planResult.daily_plan && planResult.daily_plan.length > 0 && (
          <DailyPlanList 
            dailyPlans={planResult.daily_plan}
            showRouteInfo={true}
          />
        )}

        {/* 底部操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-4 pt-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/route/list')}
            className="flex-1"
          >
            查看历史规划
          </Button>
          <Button 
            onClick={() => navigate('/route/task')}
            className="flex-1"
          >
            创建新的规划
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RouteResultPage;
