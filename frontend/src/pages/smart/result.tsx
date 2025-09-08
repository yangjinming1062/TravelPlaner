import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Lightbulb,
  MapPin,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  useSmartPlanResult,
  useSmartPlanStatus,
  useUpdatePlanFavorite,
} from '@/hooks/use-api';

// 导入公共组件
import { PlanSummary } from '@/components/shared/PlanSummary';
import { DailyPlanList } from '@/components/shared/DailyPlan';
import { HighlightsList } from '@/components/shared/Highlights';
import PlanningStatusDisplay from '@/components/shared/PlanningStatusDisplay';
import PlanResultActions from '@/components/shared/PlanResultActions';

const SmartResultPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const taskIdNumber = parseInt(taskId || '0', 10);

  // 首先获取任务状态
  const {
    data: taskStatus,
    isLoading: statusLoading,
    isError: statusError,
  } = useSmartPlanStatus(taskIdNumber);

  // 只有当任务完成时才尝试获取结果
  const shouldFetchResult =
    taskStatus?.status === 'completed' && taskStatus?.has_result;
  const {
    data: planResult,
    isLoading: resultLoading,
    isError: resultError,
    error,
  } = useSmartPlanResult(taskIdNumber, shouldFetchResult);

  const { mutate: updateFavorite } = useUpdatePlanFavorite();

  const handleFavoriteToggle = (planId: string, isFavorite: boolean) => {
    updateFavorite(
      {
        taskType: 'smart',
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
        planningTypeDisplayName="智能推荐规划"
        planningTypeColor="text-green-500"
        createNewPlanRoute="/smart/task"
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-500 to-teal-500 text-white py-6">
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
            <h1 className="text-2xl font-bold">AI智能推荐结果</h1>
            <p className="text-white/90">为您量身定制的完美旅游目的地</p>
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

        {/* 推荐目的地 */}
        <Card className="bg-gradient-to-r from-green-50 to-teal-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              AI为您推荐的目的地
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-green-700 mb-2">
                {planResult.destination}
              </h2>
              <Badge className="bg-green-100 text-green-800 border-green-300">
                AI智能推荐
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* 推荐理由 */}
        {planResult.recommendation_reasons &&
          planResult.recommendation_reasons.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  推荐理由
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {planResult.recommendation_reasons.map((reason, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-gray-700 leading-relaxed">
                        {reason}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

        {/* 目的地亮点 */}
        {planResult.destination_highlights &&
          planResult.destination_highlights.length > 0 && (
            <HighlightsList
              highlights={planResult.destination_highlights}
              className="border-green-100"
            />
          )}

        {/* 每日行程安排 */}
        {planResult.daily_plan && planResult.daily_plan.length > 0 && (
          <DailyPlanList
            dailyPlans={planResult.daily_plan}
            showRouteInfo={true}
          />
        )}

        {/* 底部操作按钮 */}
        <PlanResultActions planType="smart" />
      </div>
    </div>
  );
};

export default SmartResultPage;
