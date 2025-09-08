import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface PlanResultActionsProps {
  planType: 'single' | 'route' | 'multi' | 'smart';
  className?: string;
}

const PlanResultActions: React.FC<PlanResultActionsProps> = ({
  planType,
  className = '',
}) => {
  const navigate = useNavigate();

  const getHistoryRoute = () => {
    switch (planType) {
      case 'single':
        return '/single/list';
      case 'route':
        return '/route/list';
      case 'multi':
        return '/multi/list';
      case 'smart':
        return '/smart/list';
      default:
        return '/planning-history';
    }
  };

  const getNewPlanRoute = () => {
    switch (planType) {
      case 'single':
        return '/single/task';
      case 'route':
        return '/route/task';
      case 'multi':
        return '/multi/task';
      case 'smart':
        return '/smart/task';
      default:
        return '/';
    }
  };

  const getHistoryLabel = () => {
    switch (planType) {
      case 'smart':
        return '查看历史推荐';
      default:
        return '查看历史规划';
    }
  };

  const getNewPlanLabel = () => {
    switch (planType) {
      case 'single':
        return '创建新的规划';
      case 'route':
        return '创建新的规划';
      case 'multi':
        return '创建新的规划';
      case 'smart':
        return '获取新的推荐';
      default:
        return '创建新的规划';
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-4 pt-8 ${className}`}>
      <Button
        variant="outline"
        onClick={() => navigate('/')}
        className="flex-1"
      >
        返回首页
      </Button>
      <Button
        variant="outline"
        onClick={() => navigate(getHistoryRoute())}
        className="flex-1"
      >
        {getHistoryLabel()}
      </Button>
      <Button onClick={() => navigate(getNewPlanRoute())} className="flex-1">
        {getNewPlanLabel()}
      </Button>
    </div>
  );
};

export default PlanResultActions;
