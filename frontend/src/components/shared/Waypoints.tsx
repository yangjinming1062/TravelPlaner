import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Star, StickyNote } from 'lucide-react';
import { WaypointSchema } from '@/types/planning';

interface WaypointsProps {
  waypoints: WaypointSchema[];
  className?: string;
}

export const WaypointsList: React.FC<WaypointsProps> = ({
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

// 单个途经点卡片组件
interface WaypointCardProps {
  waypoint: WaypointSchema;
  index: number;
}

export const WaypointCard: React.FC<WaypointCardProps> = ({
  waypoint,
  index,
}) => (
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

// 紧凑型途经点展示组件
interface CompactWaypointsProps {
  waypoints: WaypointSchema[];
  maxItems?: number;
}

export const CompactWaypoints: React.FC<CompactWaypointsProps> = ({
  waypoints,
  maxItems = 3,
}) => {
  if (!waypoints || waypoints.length === 0) {
    return null;
  }

  const displayWaypoints = waypoints.slice(0, maxItems);
  const hasMore = waypoints.length > maxItems;
  const avgRating =
    waypoints
      .filter((w) => w.rating)
      .reduce((sum, w) => sum + (w.rating || 0), 0) /
    waypoints.filter((w) => w.rating).length;

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4 text-green-500" />
          途经景点 ({waypoints.length}个)
        </div>
        {avgRating && !isNaN(avgRating) && (
          <div className="flex items-center gap-1 text-yellow-600">
            <Star className="w-3 h-3 fill-current" />
            <span className="text-xs">{avgRating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        {displayWaypoints.map((waypoint, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 bg-gray-50 rounded"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                {index + 1}
              </div>
              <span className="text-sm">{waypoint.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {waypoint.rating && (
                <Badge
                  variant="outline"
                  className="text-xs text-yellow-600 border-yellow-300"
                >
                  <Star className="w-2 h-2 mr-1 fill-current" />
                  {waypoint.rating}
                </Badge>
              )}
              <span className="text-xs text-gray-500">
                {waypoint.estimated_visit_time}
              </span>
            </div>
          </div>
        ))}
        {hasMore && (
          <div className="text-xs text-gray-400 text-center">
            +{waypoints.length - maxItems} 个更多景点
          </div>
        )}
      </div>
    </div>
  );
};

// 途经点地图视图组件（预留，后续可集成地图）
interface WaypointsMapProps {
  waypoints: WaypointSchema[];
}

export const WaypointsMap: React.FC<WaypointsMapProps> = ({ waypoints }) => {
  // 这里可以后续集成地图组件如百度地图、高德地图等
  return (
    <Card className="h-64">
      <CardContent className="h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <MapPin className="w-8 h-8 mx-auto mb-2" />
          <div className="text-sm">地图视图</div>
          <div className="text-xs">显示 {waypoints.length} 个途经点</div>
          <div className="text-xs text-gray-400 mt-1">（功能开发中）</div>
        </div>
      </CardContent>
    </Card>
  );
};
