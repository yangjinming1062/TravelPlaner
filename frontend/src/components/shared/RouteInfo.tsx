import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Navigation, Clock, CreditCard, MapPin } from 'lucide-react';
import { RoutePlanSchema } from '@/types/planning';

interface RouteInfoProps {
  routePlans: RoutePlanSchema[];
  className?: string;
}

export const RouteInfoList: React.FC<RouteInfoProps> = ({
  routePlans,
  className = '',
}) => {
  if (!routePlans || routePlans.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Navigation className="w-5 h-5 text-blue-500" />
        交通路线
      </h3>
      <div className="space-y-4">
        {routePlans.map((route, index) => (
          <RouteCard
            key={index}
            route={route}
            isLast={index === routePlans.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

// 单个路线卡片组件
interface RouteCardProps {
  route: RoutePlanSchema;
  isLast?: boolean;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  route,
  isLast = false,
}) => (
  <Card className="relative">
    <CardHeader className="pb-3">
      <CardTitle className="text-base flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{route.transport_type}</Badge>
          <span className="text-sm text-gray-500">{route.from_time}</span>
        </div>
        <div className="text-sm text-gray-500">
          {route.total_distance}km · {route.estimated_time}
        </div>
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {/* 出发和到达信息 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="font-medium">{route.from_location}</span>
          <span className="text-xs text-gray-500">出发 {route.from_time}</span>
        </div>

        {!isLast && <div className="ml-1 w-0.5 h-4 bg-gray-300"></div>}

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span className="font-medium">{route.to_location}</span>
          <span className="text-xs text-gray-500">到达 {route.to_time}</span>
        </div>
      </div>

      {/* 路线描述 */}
      {route.description && (
        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
          {route.description}
        </div>
      )}

      {/* 费用信息 */}
      {route.cost && (
        <div className="flex items-center gap-2 text-sm">
          <CreditCard className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">预计费用</span>
          <span className="font-medium text-green-600">¥{route.cost}</span>
        </div>
      )}
    </CardContent>
  </Card>
);

// 紧凑型路线展示组件
interface CompactRouteInfoProps {
  routePlans: RoutePlanSchema[];
  maxItems?: number;
}

export const CompactRouteInfo: React.FC<CompactRouteInfoProps> = ({
  routePlans,
  maxItems = 2,
}) => {
  if (!routePlans || routePlans.length === 0) {
    return null;
  }

  const displayRoutes = routePlans.slice(0, maxItems);
  const hasMore = routePlans.length > maxItems;
  const totalDistance = routePlans.reduce(
    (sum, route) => sum + route.total_distance,
    0,
  );
  const totalCost = routePlans.reduce(
    (sum, route) => sum + (route.cost || 0),
    0,
  );

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700 flex items-center gap-1">
        <Navigation className="w-4 h-4 text-blue-500" />
        交通概览
      </div>

      {/* 总体统计 */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span>总距离: {totalDistance}km</span>
        {totalCost > 0 && <span>总费用: ¥{totalCost}</span>}
      </div>

      {/* 路线列表 */}
      <div className="space-y-1">
        {displayRoutes.map((route, index) => (
          <div
            key={index}
            className="text-sm flex items-center justify-between p-2 bg-gray-50 rounded"
          >
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {route.transport_type}
              </Badge>
              <span>
                {route.from_location} → {route.to_location}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {route.estimated_time}
            </span>
          </div>
        ))}
        {hasMore && (
          <div className="text-xs text-gray-400 text-center">
            +{routePlans.length - maxItems} 个更多路线
          </div>
        )}
      </div>
    </div>
  );
};

// 路线总览组件（用于结果页面顶部展示）
interface RouteSummaryProps {
  routePlans: RoutePlanSchema[];
}

export const RouteSummary: React.FC<RouteSummaryProps> = ({ routePlans }) => {
  if (!routePlans || routePlans.length === 0) {
    return null;
  }

  const totalDistance = routePlans.reduce(
    (sum, route) => sum + route.total_distance,
    0,
  );
  const totalCost = routePlans.reduce(
    (sum, route) => sum + (route.cost || 0),
    0,
  );
  const transportTypes = [
    ...new Set(routePlans.map((route) => route.transport_type)),
  ];

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {routePlans.length}
            </div>
            <div className="text-sm text-gray-600">路线段数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {totalDistance}
            </div>
            <div className="text-sm text-gray-600">总距离(km)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {transportTypes.length}
            </div>
            <div className="text-sm text-gray-600">交通方式</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {totalCost > 0 ? `¥${totalCost}` : '-'}
            </div>
            <div className="text-sm text-gray-600">预计费用</div>
          </div>
        </div>

        {transportTypes.length > 0 && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-blue-200">
            <span className="text-sm text-gray-600">包含交通方式:</span>
            {transportTypes.map((type, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {type}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
