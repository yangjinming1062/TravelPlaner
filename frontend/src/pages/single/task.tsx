import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Send, CheckCircle } from 'lucide-react';
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
import { useCreateSinglePlan } from '@/hooks/use-api';
import { format } from 'date-fns';
import { DEFAULT_TRAVEL_PREFERENCES } from '@/constants/planning';
import { useGroupSize } from '@/hooks/use-group-size';

const SingleTaskPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutate: createPlan, isPending } = useCreateSinglePlan();
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
    destination: '',
  });

  // 可选字段数据
  const [optionalData, setOptionalData] = useState<OptionalFieldsData>({
    planTitle: '',
    groupSize: 1,
    primaryTransport: '飞机',
  });

  // 偏好设置
  const [preferences, setPreferences] = useState<TravelPreferences>(
    DEFAULT_TRAVEL_PREFERENCES,
  );

  // 检查必填字段是否完整
  const isRequiredFieldsComplete = () => {
    return !!(
      requiredData.startPoint &&
      requiredData.destination &&
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
    requiredData.startPoint,
    requiredData.destination,
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
        optionalData.planTitle || `前往${requiredData.destination}的旅行计划`,
      source: requiredData.startPoint!,
      target: requiredData.destination!,
      departure_date: format(
        requiredData.departureDate!,
        "yyyy-MM-dd'T'HH:mm:ss",
      ),
      return_date: format(requiredData.returnDate!, "yyyy-MM-dd'T'HH:mm:ss"),
      group_size: optionalData.groupSize,
      transport_mode: optionalData.primaryTransport,
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
          description: '正在生成您的旅行计划，请稍候查看结果。',
        });
        // 跳转到结果页面
        navigate(`/single/result/${taskId}`);
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
        title="单一目的地规划"
        description="专注于单个目的地的深度游玩体验"
        className="bg-gradient-to-r from-blue-500 to-blue-600"
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

            {/* 必填信息 */}
            <RequiredFieldsSection
              data={requiredData}
              onDataChange={setRequiredData}
              mode="single"
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
                ? '生成中...'
                : isRequiredFieldsComplete()
                  ? '生成专属旅游方案'
                  : '请先完成必填信息'}
            </Button>
          </div>

          {/* Right Column: Features & Benefits */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>模式特色</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">深度体验</h4>
                    <p className="text-sm text-gray-600">
                      充分挖掘单个目的地的精彩之处，避免走马观花
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">景点优化</h4>
                    <p className="text-sm text-gray-600">
                      智能推荐目的地内部最值得游览的景点和活动
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">住宿位置</h4>
                    <p className="text-sm text-gray-600">
                      根据行程安排推荐最佳住宿位置，节省交通时间
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">时间安排</h4>
                    <p className="text-sm text-gray-600">
                      合理分配各景点游览时间，确保旅程轻松愉快
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  规划包含
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">住宿建议</Badge>
                  <Badge variant="secondary">景点活动</Badge>
                  <Badge variant="secondary">路线规划</Badge>
                  <Badge variant="secondary">行程亮点</Badge>
                  <Badge variant="secondary">旅游贴士</Badge>
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

export default SingleTaskPage;
