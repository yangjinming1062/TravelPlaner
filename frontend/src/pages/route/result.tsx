import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  useRoutePlanResult,
  useRoutePlanStatus,
  useUpdatePlanFavorite,
} from '@/hooks/use-api';

// 导入公共组件
import { PlanSummary } from '@/components/shared/PlanSummary';
import { DailyPlanList } from '@/components/shared/DailyPlan';
import { RouteInfoList, RouteSummary } from '@/components/shared/RouteInfo';
import { WaypointsList } from '@/components/shared/Waypoints';
import PlanningStatusDisplay from '@/components/shared/PlanningStatusDisplay';

const RouteResultPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const taskIdNumber = parseInt(taskId || '0', 10);

  // 首先获取任务状态
  const {
    data: taskStatus,
    isLoading: statusLoading,
    isError: statusError,
  } = useRoutePlanStatus(taskIdNumber);

  // 只有当任务完成时才尝试获取结果
  const shouldFetchResult =
    taskStatus?.data?.status === 'completed' && taskStatus?.data?.has_result;
  const {
    data: planResult,
    isLoading: resultLoading,
    isError: resultError,
    error,
  } = useRoutePlanResult(taskIdNumber, shouldFetchResult);

  const { mutate: updateFavorite } = useUpdatePlanFavorite();

  const handleFavoriteToggle = (planId: string, isFavorite: boolean) => {
    updateFavorite(
      {
        taskType: 'route',
        taskId: parseInt(planId, 10),
        data: { is_favorite: isFavorite },
      },
      {
        onSuccess: () => {
          toast({
            title: isFavorite ? '已添加到收藏' : '已取消收藏',
          });
        },
        onError: (error) => {
          toast({
            title: '操作失败',
            description: error.message || '无法更新收藏状态，请稍后重试。',
            variant: 'destructive',
          });
        },
      },
    );
  };

  const handleShare = (planId: string) => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: '链接已复制',
      description: '已复制分享链接到剪贴板',
    });
  };

  const handleExport = (planId: string) => {
    toast({
      title: '导出功能',
      description: '导出功能开发中...',
    });
  };

  // 检查是否需要显示状态组件
  const shouldShowStatus =
    statusLoading ||
    statusError ||
    !taskStatus ||
    taskStatus.data?.status !== 'completed' ||
    resultLoading ||
    resultError ||
    !planResult;

  if (shouldShowStatus) {
    return (
      <PlanningStatusDisplay
        taskStatus={taskStatus?.data}
        isStatusLoading={statusLoading}
        isStatusError={statusError}
        isResultLoading={resultLoading}
        isResultError={resultError}
        hasResult={!!planResult}
        resultError={error}
        planningTypeDisplayName="沿途游玩规划"
        planningTypeColor="text-orange-500"
        createNewPlanRoute="/route/task"
      />
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
          plan={planResult.data}
          onToggleFavorite={handleFavoriteToggle}
          onShare={handleShare}
          onExport={handleExport}
        />

        {/* 路线总览 */}
        {planResult.data.route_plan &&
          planResult.data.route_plan.length > 0 && (
            <RouteSummary routePlans={planResult.data.route_plan} />
          )}

        {/* 途经景点 */}
        {planResult.data.waypoints && planResult.data.waypoints.length > 0 && (
          <WaypointsList waypoints={planResult.data.waypoints} />
        )}

        {/* 详细路线信息 */}
        {planResult.data.route_plan &&
          planResult.data.route_plan.length > 0 && (
            <RouteInfoList routePlans={planResult.data.route_plan} />
          )}

        {/* 每日行程安排 */}
        {planResult.data.daily_plan &&
          planResult.data.daily_plan.length > 0 && (
            <DailyPlanList
              dailyPlans={planResult.data.daily_plan}
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
          <Button onClick={() => navigate('/route/task')} className="flex-1">
            创建新的规划
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RouteResultPage;
