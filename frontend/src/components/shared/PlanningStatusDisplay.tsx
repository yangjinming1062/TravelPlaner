import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';

interface TaskStatus {
  task_id: number;
  task_type: string;
  status: string;
  has_result: boolean;
  title: string;
  target?: string;
  max_travel_distance?: number;
  preferred_environment?: string;
  created_at: string;
}

interface PlanningStatusDisplayProps {
  taskStatus: TaskStatus | undefined;
  isStatusLoading: boolean;
  isStatusError: boolean;
  isResultLoading: boolean;
  isResultError: boolean;
  hasResult: boolean;
  resultError?: Error;
  planningTypeDisplayName: string;
  planningTypeColor: string;
  createNewPlanRoute: string;
}

const PlanningStatusDisplay: React.FC<PlanningStatusDisplayProps> = ({
  taskStatus,
  isStatusLoading,
  isStatusError,
  isResultLoading,
  isResultError,
  hasResult,
  resultError,
  planningTypeDisplayName,
  planningTypeColor,
  createNewPlanRoute,
}) => {
  const navigate = useNavigate();

  // 状态加载中
  if (isStatusLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2
            className={`w-10 h-10 animate-spin mx-auto ${planningTypeColor}`}
          />
          <p className="mt-4 text-lg">正在敦促AI加紧生成结果...</p>
        </div>
      </div>
    );
  }

  // 状态获取错误
  if (isStatusError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500" />
          <h2 className="text-2xl font-bold mt-4">规划不存在</h2>
          <p className="mt-2 text-gray-500">
            找不到指定的规划任务，可能已被删除。
          </p>
          <Button className="mt-6" onClick={() => navigate(-1)}>
            返回上一页
          </Button>
        </div>
      </div>
    );
  }

  // 任务排队中
  if (taskStatus?.status === 'pending') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <Loader2
            className={`w-16 h-16 animate-spin mx-auto ${planningTypeColor}`}
          />
          <h2 className="text-2xl font-bold mt-4">规划任务排队中</h2>
          <p className="mt-2 text-gray-500">
            您的{planningTypeDisplayName}任务正在排队处理，请稍等片刻...
          </p>
          <div className="mt-6 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="flex-1"
              >
                返回首页
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/planning-history')}
                className="flex-1"
              >
                查看规划历史
              </Button>
            </div>
            <p className="text-sm text-gray-400 text-center">
              您可以稍后在规划历史中查看结果，无需一直等待
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 任务处理中
  if (taskStatus?.status === 'processing') {
    const getProcessingMessage = () => {
      switch (taskStatus.task_type) {
        case 'single':
          return `AI正在为您精心规划${taskStatus.target}的旅行方案...`;
        case 'route':
          return `AI正在为您精心规划到${taskStatus.target}的沿途游玩路线...`;
        case 'multi':
          return `AI正在为您精心规划多节点旅行方案...`;
        case 'smart':
          return `AI正在基于您的偏好智能推荐最适合的旅行目的地...`;
        default:
          return `AI正在为您精心规划旅行方案...`;
      }
    };

    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <Loader2
            className={`w-16 h-16 animate-spin mx-auto ${planningTypeColor}`}
          />
          <h2 className="text-2xl font-bold mt-4">
            正在生成{planningTypeDisplayName}
          </h2>
          <p className="mt-2 text-gray-500">{getProcessingMessage()}</p>
          <div
            className={`mt-4 p-4 rounded-lg ${planningTypeColor === 'text-blue-500' ? 'bg-blue-50' : planningTypeColor === 'text-orange-500' ? 'bg-orange-50' : planningTypeColor === 'text-green-500' ? 'bg-green-50' : 'bg-purple-50'}`}
          >
            <p
              className={`text-sm ${planningTypeColor === 'text-blue-500' ? 'text-blue-600' : planningTypeColor === 'text-orange-500' ? 'text-orange-600' : planningTypeColor === 'text-green-500' ? 'text-green-600' : 'text-purple-600'}`}
            >
              💡 AI正在分析最优方案，处理完成后会自动显示结果
            </p>
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="flex-1"
              >
                返回首页
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/planning-history')}
                className="flex-1"
              >
                查看规划历史
              </Button>
            </div>
            <p className="text-sm text-gray-400 text-center">
              您可以稍后在规划历史中查看结果，无需一直等待
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 任务失败
  if (taskStatus?.status === 'failed') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500" />
          <h2 className="text-2xl font-bold mt-4">规划生成失败</h2>
          <p className="mt-2 text-gray-500">
            很抱歉，生成{planningTypeDisplayName}时出现了问题，请稍后重试。
          </p>
          <div className="mt-6 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => navigate(createNewPlanRoute)}
                className="flex-1"
              >
                重新规划
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="flex-1"
              >
                返回首页
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 任务完成但正在加载结果
  if (isResultLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2
            className={`w-10 h-10 animate-spin mx-auto ${planningTypeColor}`}
          />
          <p className="mt-4 text-lg">正在加载规划结果...</p>
        </div>
      </div>
    );
  }

  // 结果加载失败
  if (isResultError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500" />
          <h2 className="text-2xl font-bold mt-4">获取规划结果失败</h2>
          <p className="mt-2 text-gray-500">
            {resultError?.message || '无法获取旅行计划，请稍后重试。'}
          </p>
          <Button className="mt-6" onClick={() => window.location.reload()}>
            重新加载
          </Button>
        </div>
      </div>
    );
  }

  // 没有结果数据
  if (!hasResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">未找到规划结果</h2>
          <p className="mt-2 text-gray-500">
            该旅行计划可能仍在生成中或已被删除。
          </p>
          <Button className="mt-6" onClick={() => navigate(-1)}>
            返回上一页
          </Button>
        </div>
      </div>
    );
  }

  // 如果所有检查都通过，返回null，让父组件渲染实际结果
  return null;
};

export default PlanningStatusDisplay;
