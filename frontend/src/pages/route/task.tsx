import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Route, Clock, Send, CheckCircle, Navigation, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import CollapsiblePreferencesSection, {
  type TravelPreferences,
} from '@/components/shared/CollapsiblePreferencesSection';
import RequiredFieldsSection, {
  type RequiredFieldsData,
} from '@/components/shared/RequiredFieldsSection';
import OptionalFieldsSection, {
  type OptionalFieldsData,
} from '@/components/shared/OptionalFieldsSection';
import NavigationHeader from '@/components/shared/NavigationHeader';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ROUTE_PREFERENCES,
  PREFERRED_STOP_TYPES,
} from '@/constants/planning';
import { useCreateRoutePlan } from '@/hooks/use-api';
import { format } from 'date-fns';
import { DEFAULT_TRAVEL_PREFERENCES } from '@/constants/planning';
import type { RoutePreference, PreferredStopType } from '@/constants/planning';
import { cn } from '@/lib/utils';

// 沿途游玩特有数据接口
interface RouteSpecificData {
  maxStopovers: number;
  maxStopoverDuration: number;
  routePreference: RoutePreference;
  maxDetourDistance: number;
  preferredStopTypes: PreferredStopType[];
}

// 沿途游玩特有字段组件
const RouteSpecificFields = ({
  data,
  onDataChange,
  className,
}: {
  data: RouteSpecificData;
  onDataChange: (data: RouteSpecificData) => void;
  className?: string;
}) => {
  const updateData = (key: keyof RouteSpecificData, value: any) => {
    onDataChange({ ...data, [key]: value });
  };

  const toggleStopType = (type: PreferredStopType) => {
    const newStopTypes = data.preferredStopTypes.includes(type)
      ? data.preferredStopTypes.filter((t) => t !== type)
      : [...data.preferredStopTypes, type];
    
    updateData('preferredStopTypes', newStopTypes);
  };

  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-700">
          <Route className="w-5 h-5" />
          沿途游玩设置
          <span className="text-sm font-normal text-gray-500">
            (可选，用于定制您的沿途体验)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 沿途停留设置 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">停留设置</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-base font-medium">
                最多停留次数: {data.maxStopovers} 次
              </Label>
              <Slider
                value={[data.maxStopovers]}
                onValueChange={(value) => updateData('maxStopovers', value[0])}
                max={10}
                min={1}
                step={1}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                沿途最多可以停留的地点数量
              </p>
            </div>

            <div>
              <Label className="text-base font-medium">
                计划停留时长: {data.maxStopoverDuration} 小时
              </Label>
              <Slider
                value={[data.maxStopoverDuration]}
                onValueChange={(value) => updateData('maxStopoverDuration', value[0])}
                max={24}
                min={1}
                step={1}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                每个途径点最多游玩多久
              </p>
            </div>
          </div>
        </div>

        {/* 路线偏好 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="route-preference" className="text-base font-medium flex items-center gap-2">
              <Navigation className="w-4 h-4" />
              路线偏好
            </Label>
            <Select
              value={data.routePreference}
              onValueChange={(value) => updateData('routePreference', value)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="选择路线偏好" />
              </SelectTrigger>
              <SelectContent>
                {ROUTE_PREFERENCES.map((preference) => (
                  <SelectItem key={preference.value} value={preference.value}>
                    {preference.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              路线规划时的优先考虑因素
            </p>
          </div>

          <div>
            <Label className="text-base font-medium">
              最大绕行距离: {data.maxDetourDistance} 公里
            </Label>
            <Slider
              value={[data.maxDetourDistance]}
              onValueChange={(value) => updateData('maxDetourDistance', value[0])}
              max={500}
              min={10}
              step={10}
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              为游览景点可接受的最大绕行距离
            </p>
          </div>
        </div>

        {/* 偏好停留类型 */}
        <div>
          <Label className="text-base font-medium">偏好停留类型（多选）</Label>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {PREFERRED_STOP_TYPES.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`stop-type-${type.value}`}
                  checked={data.preferredStopTypes.includes(type.value)}
                  onCheckedChange={() => toggleStopType(type.value)}
                />
                <Label htmlFor={`stop-type-${type.value}`} className="text-sm">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            选择您希望在沿途停留体验的活动类型
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const RouteTaskPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutate: createPlan, isPending } = useCreateRoutePlan();
  const generateButtonRef = useRef<HTMLButtonElement>(null);

  // 确保页面加载时滚动到顶部
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 必填字段数据
  const [requiredData, setRequiredData] = useState<RequiredFieldsData>({
    departureDate: undefined,
    returnDate: undefined,
    routeStartPoint: '',
    routeEndPoint: '',
  });

  // 可选字段数据
  const [optionalData, setOptionalData] = useState<OptionalFieldsData>({
    planTitle: '',
    groupSize: 1,
    primaryTransport: '飞机',
  });

  // 沿途游玩特有数据
  const [routeData, setRouteData] = useState<RouteSpecificData>({
    maxStopovers: 3,
    maxStopoverDuration: 2,
    routePreference: '平衡',
    maxDetourDistance: 100,
    preferredStopTypes: [],
  });

  // 偏好设置
  const [preferences, setPreferences] = useState<TravelPreferences>(
    DEFAULT_TRAVEL_PREFERENCES,
  );

  // 检查必填字段是否完整
  const isRequiredFieldsComplete = () => {
    return !!(
      requiredData.routeStartPoint &&
      requiredData.routeEndPoint &&
      requiredData.departureDate &&
      requiredData.returnDate
    );
  };

  // 当必填字段完成时自动滚动到生成按钮
  useEffect(() => {
    if (isRequiredFieldsComplete() && generateButtonRef.current) {
      setTimeout(() => {
        generateButtonRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 300);
    }
  }, [
    requiredData.routeStartPoint,
    requiredData.routeEndPoint,
    requiredData.departureDate,
    requiredData.returnDate,
  ]);

  // 管理出行人数的Hook
  const handleTravelTypeChange = (travelType: any) => {
    const groupSizeMap: Record<string, number> = {
      独行: 1,
      情侣: 2,
      家庭: 4,
      朋友: 3,
    };
    const newGroupSize = groupSizeMap[travelType] || optionalData.groupSize;
    setOptionalData({ ...optionalData, groupSize: newGroupSize });
  };

  const handleGroupSizeChange = (newSize: number) => {
    setOptionalData({ ...optionalData, groupSize: newSize });
  };

  const handlePlanGenerate = () => {
    // 验证必填字段
    if (!isRequiredFieldsComplete()) {
      toast({
        title: '信息不完整',
        description: '请填写所有必填字段。',
        variant: 'destructive',
      });
      return;
    }

    // 构造请求数据
    const requestData = {
      title:
        optionalData.planTitle ||
        `从${requiredData.routeStartPoint}到${requiredData.routeEndPoint}的沿途游玩计划`,
      source: requiredData.routeStartPoint!,
      target: requiredData.routeEndPoint!,
      departure_date: format(
        requiredData.departureDate!,
        "yyyy-MM-dd'T'HH:mm:ss",
      ),
      return_date: format(requiredData.returnDate!, "yyyy-MM-dd'T'HH:mm:ss"),
      group_size: optionalData.groupSize,
      transport_mode: optionalData.primaryTransport,
      max_stopovers: routeData.maxStopovers,
      max_stopover_duration: routeData.maxStopoverDuration,
      route_preference: routeData.routePreference,
      max_detour_distance: routeData.maxDetourDistance,
      preferred_stop_types: routeData.preferredStopTypes,
      preferred_transport_modes: preferences.transportMethods,
      accommodation_level: preferences.accommodationLevels,
      activity_preferences: preferences.activityTypes,
      attraction_categories: preferences.scenicTypes,
      travel_style: preferences.travelStyle,
      budget_flexibility: preferences.budgetType,
      dietary_restrictions: preferences.dietaryRestrictions
        ? [preferences.dietaryRestrictions as any]
        : [], // eslint-disable-line @typescript-eslint/no-explicit-any
      group_travel_preference: preferences.travelType,
      custom_preferences: preferences.specialRequirements,
    };

    // 调用API创建规划任务
    createPlan(requestData, {
      onSuccess: (taskId) => {
        toast({
          title: '规划任务已提交',
          description: '正在生成您的旅行计划，请稍候查看结果。',
        });
        // 跳转到结果页面
        navigate(`/route/result/${taskId}`);
      },
      onError: (error: any) => {
        // eslint-disable-line @typescript-eslint/no-explicit-any
        toast({
          title: '提交失败',
          description: error.message || '无法提交规划请求，请稍后重试。',
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <NavigationHeader
        title="沿途游玩规划"
        description="发现旅途中的每一处美景"
        className="bg-gradient-to-r from-orange-500 to-red-500"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Left Column: Forms */}
          <div className="xl:col-span-2 space-y-6">
            {/* 必填信息 */}
            <RequiredFieldsSection
              data={requiredData}
              onDataChange={setRequiredData}
              mode="route"
            />

            {/* 可选设置 */}
            <OptionalFieldsSection
              data={optionalData}
              onDataChange={setOptionalData}
              onGroupSizeChange={handleGroupSizeChange}
            />

            {/* 沿途游玩特有设置 */}
            <RouteSpecificFields data={routeData} onDataChange={setRouteData} />

            {/* 偏好设置 - 可折叠 */}
            <CollapsiblePreferencesSection
              preferences={preferences}
              onPreferencesChange={setPreferences}
              onTravelTypeChange={handleTravelTypeChange}
            />

            {/* 生成按钮 - 放在最下方 */}
            <Button
              ref={generateButtonRef}
              className={`w-full transition-all duration-300 ${
                isRequiredFieldsComplete()
                  ? 'bg-green-600 hover:bg-green-700 shadow-lg scale-105'
                  : 'bg-gray-400 hover:bg-gray-500'
              }`}
              size="lg"
              onClick={handlePlanGenerate}
              disabled={!isRequiredFieldsComplete() || isPending}
            >
              {isRequiredFieldsComplete() && !isPending && (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              <Send className="w-4 h-4 mr-2" />
              {isPending
                ? '生成中...'
                : isRequiredFieldsComplete()
                  ? '规划沿途路线'
                  : '请先完成必填信息'}
            </Button>
          </div>

          {/* Right Column: Features */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>模式特色</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">目的地深度</h4>
                    <p className="text-sm text-gray-600">
                      侧重目的地深度游玩和详细推荐
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">沿途发现</h4>
                    <p className="text-sm text-gray-600">
                      发现并推荐沿途有价值的景点
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">路线优化</h4>
                    <p className="text-sm text-gray-600">
                      兼顾赶路和游玩，合理安排行程
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">停留控制</h4>
                    <p className="text-sm text-gray-600">
                      可控制沿途停留次数和时长
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-50 to-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Route className="w-5 h-5 text-orange-500" />
                  规划内容
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">每日住宿安排</Badge>
                  <Badge variant="secondary">途经点详情</Badge>
                  <Badge variant="secondary">路线距离时间</Badge>
                  <Badge variant="secondary">交通费用</Badge>
                  <Badge variant="secondary">景点评分</Badge>
                  <Badge variant="secondary">坐标位置</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-600">适合场景</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-orange-500 rounded-full" />
                    自驾游爱好者
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-orange-500 rounded-full" />
                    时间充裕的长途旅行
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-orange-500 rounded-full" />
                    喜欢探索未知景点
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-orange-500 rounded-full" />
                    家庭或朋友结伴出行
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteTaskPage;
