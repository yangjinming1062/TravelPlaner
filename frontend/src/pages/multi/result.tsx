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
  ArrowRight,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  useMultiPlanResult,
  useMultiPlanStatus,
  useUpdatePlanFavorite,
} from '@/hooks/use-api';
import { NodeScheduleDetailSchema } from '@/types/planning';

// 导入公共组件
import { PlanSummary } from '@/components/shared/PlanSummary';
import { HighlightsList } from '@/components/shared/Highlights';
import { DailyPlanCard } from '@/components/shared/DailyPlan';
import { RouteInfoList } from '@/components/shared/RouteInfo';
import PlanningStatusDisplay from '@/components/shared/PlanningStatusDisplay';
import PlanResultActions from '@/components/shared/PlanResultActions';

// 节点详细安排列表组件（专用于多节点结果展示）
interface NodeScheduleListProps {
  nodesDetails: NodeScheduleDetailSchema[];
  className?: string;
}

const NodeScheduleList: React.FC<NodeScheduleListProps> = ({
  nodesDetails,
  className = '',
}) => {
  if (!nodesDetails || nodesDetails.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-purple-500" />
        节点详细安排
        <Badge variant="outline">{nodesDetails.length}个节点</Badge>
      </h3>
      <div className="space-y-6">
        {nodesDetails.map((node, index) => (
          <NodeScheduleCard
            key={index}
            node={node}
            nodeIndex={index + 1}
            isLast={index === nodesDetails.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

// 单个节点卡片组件（专用于多节点结果展示）
interface NodeScheduleCardProps {
  node: NodeScheduleDetailSchema;
  nodeIndex: number;
  isLast?: boolean;
}

const NodeScheduleCard: React.FC<NodeScheduleCardProps> = ({
  node,
  nodeIndex,
  isLast = false,
}) => (
  <div className="relative">
    <Card className="relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>
      <CardHeader className="bg-purple-50 border-b border-purple-100">
        <CardTitle className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">
            {nodeIndex}
          </div>
          <div className="flex-grow">
            <h4 className="text-lg">{node.location}</h4>
            <div className="text-sm text-purple-600 mt-1">
              节点 {nodeIndex} · {node.daily_plan.length} 天行程
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {node.daily_plan.length > 0 ? (
          <div className="space-y-4">
            {node.daily_plan.map((dailyPlan, dayIndex) => (
              <DailyPlanCard
                key={dayIndex}
                dailyPlan={dailyPlan}
                showRouteInfo={false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <div>暂无详细行程安排</div>
          </div>
        )}
      </CardContent>
    </Card>

    {/* 节点间连接线和箭头 */}
    {!isLast && (
      <div className="flex justify-center py-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
          <ArrowRight className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-600">下一节点</span>
        </div>
      </div>
    )}
  </div>
);

const MultiResultPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const taskIdNumber = parseInt(taskId || '0', 10);

  // 首先获取任务状态
  const {
    data: taskStatus,
    isLoading: statusLoading,
    isError: statusError,
  } = useMultiPlanStatus(taskIdNumber);

  // 只有当任务完成时才尝试获取结果
  const shouldFetchResult =
    taskStatus?.status === 'completed' && taskStatus?.has_result;
  const {
    data: planResult,
    isLoading: resultLoading,
    isError: resultError,
    error,
  } = useMultiPlanResult(taskIdNumber, shouldFetchResult);

  const { mutate: updateFavorite } = useUpdatePlanFavorite();

  const handleFavoriteToggle = (planId: string, isFavorite: boolean) => {
    updateFavorite(
      {
        taskType: 'multi',
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
    taskStatus.status !== 'completed' ||
    resultLoading ||
    resultError ||
    !planResult;

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
        <PlanResultActions planType="multi" />
      </div>
    </div>
  );
};

export default MultiResultPage;
