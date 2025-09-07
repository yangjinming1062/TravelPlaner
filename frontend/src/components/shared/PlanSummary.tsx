import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Users, 
  CreditCard, 
  Heart, 
  HeartOff, 
  Share2,
  Download
} from 'lucide-react';
import { PlanningResultBase } from '@/types/planning';

interface PlanSummaryProps {
  plan: PlanningResultBase;
  onToggleFavorite?: (planId: string, isFavorite: boolean) => void;
  onShare?: (planId: string) => void;
  onExport?: (planId: string) => void;
  showActions?: boolean;
  className?: string;
}

export const PlanSummary: React.FC<PlanSummaryProps> = ({
  plan,
  onToggleFavorite,
  onShare,
  onExport,
  showActions = true,
  className = ""
}) => {
  const handleToggleFavorite = () => {
    if (onToggleFavorite) {
      onToggleFavorite(plan.id, !plan.is_favorite);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(plan.id);
    }
  };

  const handleExport = () => {
    if (onExport) {
      onExport(plan.id);
    }
  };

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-grow">
            <CardTitle className="text-xl mb-2">{plan.plan_title}</CardTitle>
            {plan.plan_description && (
              <p className="text-gray-600 text-sm">{plan.plan_description}</p>
            )}
          </div>
          {showActions && (
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleFavorite}
                className={`p-2 ${plan.is_favorite ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'}`}
              >
                {plan.is_favorite ? <Heart className="w-4 h-4 fill-current" /> : <HeartOff className="w-4 h-4" />}
              </Button>
              {onShare && (
                <Button variant="ghost" size="sm" onClick={handleShare} className="p-2">
                  <Share2 className="w-4 h-4" />
                </Button>
              )}
              {onExport && (
                <Button variant="ghost" size="sm" onClick={handleExport} className="p-2">
                  <Download className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <div>
              <div className="text-sm text-gray-500">行程天数</div>
              <div className="font-medium">{plan.total_days} 天</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-green-500" />
            <div>
              <div className="text-sm text-gray-500">预估费用</div>
              <div className="font-medium">
                {plan.estimated_budget > 0 ? `¥${plan.estimated_budget}` : '待估算'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 flex items-center justify-center">
              {plan.is_favorite ? (
                <Heart className="w-4 h-4 text-red-500 fill-current" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
              )}
            </div>
            <div>
              <div className="text-sm text-gray-500">收藏状态</div>
              <div className="font-medium">
                {plan.is_favorite ? '已收藏' : '未收藏'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// 紧凑版规划摘要组件（用于列表页面）
interface CompactPlanSummaryProps {
  plan: PlanningResultBase;
  onToggleFavorite?: (planId: string, isFavorite: boolean) => void;
  onClick?: (planId: string) => void;
}

export const CompactPlanSummary: React.FC<CompactPlanSummaryProps> = ({
  plan,
  onToggleFavorite,
  onClick
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(plan.id);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(plan.id, !plan.is_favorite);
    }
  };

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-grow">
            <h4 className="font-medium mb-1">{plan.plan_title}</h4>
            {plan.plan_description && (
              <p className="text-sm text-gray-500 line-clamp-2">{plan.plan_description}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleFavorite}
            className={`p-1 ml-2 ${plan.is_favorite ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'}`}
          >
            {plan.is_favorite ? <Heart className="w-4 h-4 fill-current" /> : <HeartOff className="w-4 h-4" />}
          </Button>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-blue-500" />
              {plan.total_days}天
            </span>
            <span className="flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-green-500" />
              {plan.estimated_budget > 0 ? `¥${plan.estimated_budget}` : '待估算'}
            </span>
          </div>
          <Badge variant={plan.is_favorite ? 'default' : 'secondary'} className="text-xs">
            {plan.is_favorite ? '已收藏' : '未收藏'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

// 规划统计卡片组件
interface PlanStatsCardProps {
  totalDays: number;
  estimatedBudget: number;
  highlights?: number;
  activities?: number;
  waypoints?: number;
  className?: string;
}

export const PlanStatsCard: React.FC<PlanStatsCardProps> = ({
  totalDays,
  estimatedBudget,
  highlights = 0,
  activities = 0,
  waypoints = 0,
  className = ""
}) => {
  const stats = [
    { label: '行程天数', value: totalDays, unit: '天', icon: Calendar },
    { label: '预估费用', value: estimatedBudget, unit: '元', icon: CreditCard, prefix: '¥' },
  ];

  if (highlights > 0) {
    stats.push({ label: '精彩亮点', value: highlights, unit: '个', icon: Calendar });
  }
  
  if (activities > 0) {
    stats.push({ label: '活动安排', value: activities, unit: '项', icon: Users });
  }
  
  if (waypoints > 0) {
    stats.push({ label: '途经景点', value: waypoints, unit: '个', icon: Calendar });
  }

  return (
    <Card className={`bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 ${className}`}>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stat.prefix || ''}{stat.value > 0 ? stat.value : '-'}
              </div>
              <div className="text-sm text-gray-600">
                {stat.label}{stat.value > 0 && !stat.prefix ? `(${stat.unit})` : ''}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
