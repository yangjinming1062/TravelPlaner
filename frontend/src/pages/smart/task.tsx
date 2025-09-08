import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { Send, Sparkles, CheckCircle, MapPin, Shield } from 'lucide-react';
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
import { ENVIRONMENT_PREFERENCES, AVOID_REGIONS } from '@/constants/planning';
import { useCreateSmartPlan } from '@/hooks/use-api';
import { format } from 'date-fns';
import { DEFAULT_TRAVEL_PREFERENCES } from '@/constants/planning';
import type { EnvironmentPreference, AvoidRegion } from '@/constants/planning';
import { cn } from '@/lib/utils';

// 智能推荐特有数据接口
interface SmartSpecificData {
  maxTravelDistance: number;
  preferredEnvironments: EnvironmentPreference[];
  avoidRegions: AvoidRegion[];
}

// 智能推荐特有字段组件
const SmartSpecificFields = ({
  data,
  onDataChange,
  className,
}: {
  data: SmartSpecificData;
  onDataChange: (data: SmartSpecificData) => void;
  className?: string;
}) => {
  const updateData = (
    key: keyof SmartSpecificData,
    value: number | EnvironmentPreference[] | AvoidRegion[],
  ) => {
    onDataChange({ ...data, [key]: value });
  };

  const toggleEnvironment = (environment: EnvironmentPreference) => {
    const newEnvironments = data.preferredEnvironments.includes(environment)
      ? data.preferredEnvironments.filter((e) => e !== environment)
      : [...data.preferredEnvironments, environment];

    updateData('preferredEnvironments', newEnvironments);
  };

  const toggleAvoidRegion = (region: AvoidRegion) => {
    const newAvoidRegions = data.avoidRegions.includes(region)
      ? data.avoidRegions.filter((r) => r !== region)
      : [...data.avoidRegions, region];

    updateData('avoidRegions', newAvoidRegions);
  };

  return (
    <Card className={cn('shadow-sm border-red-100', className)}>
      <CardHeader className="bg-red-50/50">
        <CardTitle className="flex items-center gap-2 text-red-700">
          <Sparkles className="w-5 h-5" />
          智能推荐设置
          <span className="text-sm font-normal text-red-600">
            (AI推荐的核心参数)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 出行距离设置 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-gray-700">出行范围</span>
          </div>

          <div>
            <Label className="text-base font-medium">
              最大出行距离: {data.maxTravelDistance} 公里
            </Label>
            <Slider
              value={[data.maxTravelDistance]}
              onValueChange={(value) =>
                updateData('maxTravelDistance', value[0])
              }
              max={3000}
              min={100}
              step={50}
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              从出发地可接受的最大距离范围
            </p>
          </div>
        </div>

        {/* 环境偏好 */}
        <div>
          <Label className="text-base font-medium">环境偏好（多选）</Label>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {ENVIRONMENT_PREFERENCES.map((env) => (
              <div key={env.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`env-${env.value}`}
                  checked={data.preferredEnvironments.includes(env.value)}
                  onCheckedChange={() => toggleEnvironment(env.value)}
                />
                <Label htmlFor={`env-${env.value}`} className="text-sm">
                  {env.label}
                </Label>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            选择您偏好的环境类型，AI会根据您的选择推荐相应的目的地
          </p>
        </div>

        {/* 避免的地区 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-red-500" />
            <Label className="text-base font-medium">
              避免的地区类型（多选）
            </Label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {AVOID_REGIONS.map((region) => (
              <div key={region.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`avoid-${region.value}`}
                  checked={data.avoidRegions.includes(region.value)}
                  onCheckedChange={() => toggleAvoidRegion(region.value)}
                />
                <Label htmlFor={`avoid-${region.value}`} className="text-sm">
                  {region.label}
                </Label>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            选择您希望避免的地区类型，AI会在推荐时排除这些区域
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const SmartTaskPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutate: createPlan, isPending } = useCreateSmartPlan();
  const generateButtonRef = useRef<HTMLButtonElement>(null);

  // 确保页面加载时滚动到顶部
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 必填字段数据
  const [requiredData, setRequiredData] = useState<RequiredFieldsData>({
    departureDate: undefined,
    returnDate: undefined,
    startPoint: '',
  });

  // 可选字段数据
  const [optionalData, setOptionalData] = useState<OptionalFieldsData>({
    planTitle: '',
    groupSize: 1,
    primaryTransport: '飞机',
  });

  // 智能推荐特有数据
  const [smartData, setSmartData] = useState<SmartSpecificData>({
    maxTravelDistance: 100,
    preferredEnvironments: [],
    avoidRegions: [],
  });

  // 偏好设置
  const [preferences, setPreferences] = useState<TravelPreferences>(
    DEFAULT_TRAVEL_PREFERENCES,
  );

  // 检查必填字段是否完整
  const isRequiredFieldsComplete = useCallback(() => {
    return !!(
      requiredData.startPoint &&
      requiredData.departureDate &&
      requiredData.returnDate
    );
  }, [
    requiredData.startPoint,
    requiredData.departureDate,
    requiredData.returnDate,
  ]);

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
    requiredData.startPoint,
    requiredData.departureDate,
    requiredData.returnDate,
    isRequiredFieldsComplete,
  ]);

  // 管理出行人数的Hook
  const handleTravelTypeChange = (travelType: string) => {
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

    // 验证智能推荐设置
    if (smartData.preferredEnvironments.length === 0) {
      toast({
        title: '智能推荐设置不完整',
        description: '请至少选择一种环境偏好。',
        variant: 'destructive',
      });
      return;
    }

    // 构造请求数据
    const requestData = {
      title: optionalData.planTitle || `智能推荐旅行计划`,
      source: requiredData.startPoint!,
      departure_date: format(
        requiredData.departureDate!,
        "yyyy-MM-dd'T'HH:mm:ss",
      ),
      return_date: format(requiredData.returnDate!, "yyyy-MM-dd'T'HH:mm:ss"),
      group_size: optionalData.groupSize,
      transport_mode: optionalData.primaryTransport,
      max_travel_distance: smartData.maxTravelDistance,
      preferred_environment: smartData.preferredEnvironments[0] || '海滨度假',
      avoid_regions: smartData.avoidRegions,
      preferred_transport_modes: preferences.transportMethods,
      accommodation_level: preferences.accommodationLevels,
      activity_preferences: preferences.activityTypes,
      attraction_categories: preferences.scenicTypes,
      travel_style: preferences.travelStyle,
      budget_flexibility: preferences.budgetType,
      dietary_restrictions: preferences.dietaryRestrictions || '',
      group_travel_preference: preferences.travelType,
      custom_preferences: preferences.specialRequirements,
    };

    // 调用API创建规划任务
    createPlan(requestData, {
      onSuccess: (taskId) => {
        toast({
          title: '规划任务已提交',
          description: 'AI正在为您生成智能推荐方案，请稍候查看结果。',
        });
        navigate(`/smart/result/${taskId}`);
      },
      onError: (error: Error) => {
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
        title="智能推荐规划"
        description="让AI为您发现最适合的旅游目的地"
        className="bg-gradient-to-r from-green-500 to-teal-500"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Left Column: Forms */}
          <div className="xl:col-span-2 space-y-6">
            {/* 基本设置 */}
            <OptionalFieldsSection
              data={optionalData}
              onDataChange={setOptionalData}
              onGroupSizeChange={handleGroupSizeChange}
            />

            {/* 智能推荐特有设置 */}
            <SmartSpecificFields data={smartData} onDataChange={setSmartData} />

            {/* 必填信息 */}
            <RequiredFieldsSection
              data={requiredData}
              onDataChange={setRequiredData}
              mode="smart"
            />

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
                ? 'AI分析中...'
                : isRequiredFieldsComplete()
                  ? '获取智能推荐'
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
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">个性化匹配</h4>
                    <p className="text-sm text-gray-600">
                      基于您的偏好智能匹配最适合的目的地
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">重新分析</h4>
                    <p className="text-sm text-gray-600">
                      对推荐不满意可重新分析，直到满意为止
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">惊喜发现</h4>
                    <p className="text-sm text-gray-600">
                      推荐您可能从未考虑过的绝佳目的地
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">完整规划</h4>
                    <p className="text-sm text-gray-600">
                      不仅推荐目的地，还提供完整的行程规划
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-teal-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-green-500" />
                  推荐内容
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">目的地详情</Badge>
                  <Badge variant="secondary">推荐理由</Badge>
                  <Badge variant="secondary">目的地亮点</Badge>
                  <Badge variant="secondary">住宿安排</Badge>
                  <Badge variant="secondary">景点活动</Badge>
                  <Badge variant="secondary">最佳游览时间</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartTaskPage;
