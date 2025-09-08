import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, MapPin, Bed } from 'lucide-react';
import {
  DailyPlanSchema,
  ActivityPlanSchema,
  AccommodationPlanSchema,
} from '@/types/planning';

interface DailyPlanProps {
  dailyPlan: DailyPlanSchema;
  showRouteInfo?: boolean;
}

export const DailyPlanCard: React.FC<DailyPlanProps> = ({
  dailyPlan,
  showRouteInfo = false,
}) => {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>{dailyPlan.date}</span>
          <Badge variant="outline">
            第{new Date(dailyPlan.date).getDate()}天
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 住宿信息 */}
        <AccommodationInfo accommodation={dailyPlan.accommodation} />

        <Separator />

        {/* 活动列表 */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" />
            今日行程
          </h4>
          {dailyPlan.activities.map((activity, index) => (
            <ActivityItem key={index} activity={activity} />
          ))}
        </div>

        {/* 路线信息（可选） */}
        {showRouteInfo &&
          dailyPlan.route_plan &&
          dailyPlan.route_plan.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">交通安排</h4>
                {dailyPlan.route_plan.map((route, index) => (
                  <div
                    key={index}
                    className="text-sm text-gray-600 bg-gray-50 p-2 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      {route.from_location} → {route.to_location}
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>{route.transport_type}</span>
                      <span>{route.estimated_time}</span>
                      {route.cost && <span>¥{route.cost}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        {/* 备注 */}
        {dailyPlan.notes && (
          <>
            <Separator />
            <div className="text-sm text-gray-600 italic">
              💡 {dailyPlan.notes}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// 住宿信息组件
const AccommodationInfo: React.FC<{
  accommodation: AccommodationPlanSchema;
}> = ({ accommodation }) => (
  <div className="bg-blue-50 p-3 rounded-lg">
    <div className="flex items-center gap-2 mb-2">
      <Bed className="w-4 h-4 text-blue-600" />
      <span className="font-medium text-blue-900">{accommodation.name}</span>
      <Badge variant="secondary">{accommodation.type}</Badge>
    </div>
    <div className="text-sm text-blue-700">
      <div>价格区间: {accommodation.price_range}</div>
      {accommodation.description && (
        <div className="mt-1">推荐理由: {accommodation.description}</div>
      )}
    </div>
  </div>
);

// 活动项组件
const ActivityItem: React.FC<{ activity: ActivityPlanSchema }> = ({
  activity,
}) => (
  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
    <div className="flex-shrink-0 w-16 text-sm font-medium text-green-700">
      {activity.time}
    </div>
    <div className="flex-grow">
      <div className="font-medium text-green-900">{activity.name}</div>
      {activity.location && (
        <div className="text-sm text-green-600 flex items-center gap-1 mt-1">
          <MapPin className="w-3 h-3" />
          {activity.location}
        </div>
      )}
      {activity.description && (
        <div className="text-sm text-green-700 mt-1">
          {activity.description}
        </div>
      )}
    </div>
  </div>
);

// 每日行程列表组件
interface DailyPlanListProps {
  dailyPlans: DailyPlanSchema[];
  showRouteInfo?: boolean;
  className?: string;
}

export const DailyPlanList: React.FC<DailyPlanListProps> = ({
  dailyPlans,
  showRouteInfo = false,
  className = '',
}) => (
  <div className={className}>
    <h3 className="text-lg font-semibold mb-4">每日行程安排</h3>
    {dailyPlans.map((dailyPlan, index) => (
      <DailyPlanCard
        key={index}
        dailyPlan={dailyPlan}
        showRouteInfo={showRouteInfo}
      />
    ))}
  </div>
);
