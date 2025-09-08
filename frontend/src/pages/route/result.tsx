import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  MapPin,
  Clock,
  Star,
  StickyNote,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  useRoutePlanResult,
  useRoutePlanStatus,
  useUpdatePlanFavorite,
} from '@/hooks/use-api';
import { WaypointSchema } from '@/types/planning';

// 导入公共组件
import { PlanSummary } from '@/components/shared/PlanSummary';
import { DailyPlanList } from '@/components/shared/DailyPlan';
import { RouteInfoList, RouteSummary } from '@/components/shared/RouteInfo';
import PlanningStatusDisplay from '@/components/shared/PlanningStatusDisplay';
import PlanResultActions from '@/components/shared/PlanResultActions';

// 途经点列表组件（专用于沿途游玩结果展示）
interface WaypointsProps {
  waypoints: WaypointSchema[];
  className?: string;
}

const WaypointsList: React.FC<WaypointsProps> = ({
  waypoints,
  className = '',
}) => {
  if (!waypoints || waypoints.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-green-500" />
        途经景点
        <Badge variant="outline">{waypoints.length}个</Badge>
      </h3>
      <div className="space-y-4">
        {waypoints.map((waypoint, index) => (
          <WaypointCard key={index} waypoint={waypoint} index={index + 1} />
        ))}
      </div>
    </div>
  );
};

// 单个途经点卡片组件（专用于沿途游玩结果展示）
interface WaypointCardProps {
  waypoint: WaypointSchema;
  index: number;
}

const WaypointCard: React.FC<WaypointCardProps> = ({ waypoint, index }) => (
  <Card className="relative overflow-hidden">
    <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
    <CardHeader className="pb-3">
      <CardTitle className="text-base flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">
            {index}
          </div>
          <span>{waypoint.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {waypoint.rating && (
            <Badge
              variant="outline"
              className="text-yellow-600 border-yellow-300"
            >
              <Star className="w-3 h-3 mr-1 fill-current" />
              {waypoint.rating}
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {waypoint.estimated_visit_time}
          </Badge>
        </div>
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {/* 描述信息 */}
      <div className="text-sm text-gray-600 leading-relaxed">
        {waypoint.description}
      </div>

      {/* 位置信息 */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <MapPin className="w-3 h-3" />
        <span>
          坐标: {waypoint.latitude.toFixed(6)}, {waypoint.longitude.toFixed(6)}
        </span>
      </div>

      {/* 备注信息 */}
      {waypoint.notes && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <StickyNote className="w-4 h-4 text-yellow-600 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-yellow-800">
                温馨提示
              </div>
              <div className="text-sm text-yellow-700 mt-1">
                {waypoint.notes}
              </div>
            </div>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

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
        <PlanResultActions planType="route" />
      </div>
    </div>
  );
};

export default RouteResultPage;
