import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMultiPlanResult, useMultiPlanStatus, useUpdatePlanFavorite } from "@/hooks/use-api";

// 导入公共组件
import { PlanSummary } from "@/components/shared/PlanSummary";
import { HighlightsList } from "@/components/shared/Highlights";
import { NodeScheduleList } from "@/components/shared/NodeSchedule";
import { RouteInfoList } from "@/components/shared/RouteInfo";
import PlanningStatusDisplay from "@/components/shared/PlanningStatusDisplay";

const MultiResultPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const taskIdNumber = parseInt(taskId || "0", 10);
  
  // 首先获取任务状态
  const { data: taskStatus, isLoading: statusLoading, isError: statusError } = useMultiPlanStatus(taskIdNumber);
  
  // 只有当任务完成时才尝试获取结果
  const shouldFetchResult = taskStatus?.status === "completed" && taskStatus?.has_result;
  const { data: planResult, isLoading: resultLoading, isError: resultError, error } = useMultiPlanResult(taskIdNumber, shouldFetchResult);
  
  const { mutate: updateFavorite } = useUpdatePlanFavorite();
  
  const handleFavoriteToggle = (planId: string, isFavorite: boolean) => {
    updateFavorite(
      { taskType: "multi", taskId: parseInt(planId, 10), data: { is_favorite: isFavorite } },
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

  // 检查是否需要显示状态组件
  const shouldShowStatus = statusLoading || statusError || !taskStatus || 
    taskStatus.status !== "completed" || resultLoading || resultError || !planResult;

  if (shouldShowStatus) {
    return (
      <PlanningStatusDisplay
        taskStatus={taskStatus}
        isStatusLoading={statusLoading}
        isStatusError={statusError}
        isResultLoading={resultLoading}
        isResultError={resultError}
        hasResult={!!planResult}
        resultError={error}
        planningTypeDisplayName="多节点规划"
        planningTypeColor="text-purple-500"
        createNewPlanRoute="/multi/task"
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-6">
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
            <h1 className="text-2xl font-bold">多节点规划结果</h1>
            <p className="text-white/90">精心安排的多目的地完美旅程</p>
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

        {/* 节点详细安排 */}
        {planResult.nodes_details && planResult.nodes_details.length > 0 && (
          <NodeScheduleList nodesDetails={planResult.nodes_details} />
        )}

        {/* 节点间交通安排 */}
        {planResult.route_plan && planResult.route_plan.length > 0 && (
          <RouteInfoList routePlans={planResult.route_plan} />
        )}

        {/* 底部操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-4 pt-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/multi/list')}
            className="flex-1"
          >
            查看历史规划
          </Button>
          <Button 
            onClick={() => navigate('/multi/task')}
            className="flex-1"
          >
            创建新的规划
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MultiResultPage;
