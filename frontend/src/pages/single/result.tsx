import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Loader2,
  AlertCircle,
  Lightbulb
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSinglePlanResult, useUpdatePlanFavorite } from "@/hooks/use-api";

// 导入公共组件
import { PlanSummary } from "@/components/shared/PlanSummary";
import { DailyPlanList } from "@/components/shared/DailyPlan";
import { HighlightsList } from "@/components/shared/Highlights";

const SingleResultPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const taskIdNumber = parseInt(taskId || "0", 10);
  const { data: planResult, isLoading, isError, error } = useSinglePlanResult(taskIdNumber);
  const { mutate: updateFavorite } = useUpdatePlanFavorite();
  
  const handleFavoriteToggle = (planId: string, isFavorite: boolean) => {
    updateFavorite(
      { taskType: "single", taskId: parseInt(planId, 10), data: { is_favorite: isFavorite } },
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
    // 实现分享功能
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "链接已复制",
      description: "已复制分享链接到剪贴板",
    });
  };

  const handleExport = (planId: string) => {
    // 实现导出功能
    toast({
      title: "导出功能",
      description: "导出功能开发中...",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-500" />
          <p className="mt-4 text-lg">正在生成您的旅行计划...</p>
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
      <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-6">
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
            <h1 className="text-2xl font-bold">单一目的地规划结果</h1>
            <p className="text-white/90">深度体验您的专属旅游方案</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* 规划概览 */}
        <PlanSummary 
          plan={planResult}
          onToggleFavorite={handleFavoriteToggle}
          onShare={handleShare}
          onExport={handleExport}
        />

        {/* 行程亮点 */}
        {planResult.highlights && planResult.highlights.length > 0 && (
          <HighlightsList highlights={planResult.highlights} />
        )}

        {/* 每日行程安排 */}
        {planResult.daily_plan && planResult.daily_plan.length > 0 && (
          <DailyPlanList 
            dailyPlans={planResult.daily_plan}
            showRouteInfo={true}
          />
        )}

        {/* 旅游贴士 */}
        {planResult.tips && planResult.tips.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                旅游贴士
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                {planResult.tips.map((tip, index) => (
                  <li key={index} className="text-gray-600 leading-relaxed">{tip}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* 底部操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-4 pt-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/single/list')}
            className="flex-1"
          >
            查看历史规划
          </Button>
          <Button 
            onClick={() => navigate('/single/task')}
            className="flex-1"
          >
            创建新的规划
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SingleResultPage;
