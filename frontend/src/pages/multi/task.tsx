import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Send, CheckCircle } from 'lucide-react';
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
import { NodeScheduleInput } from '@/components/shared/NodeSchedule';
import { NodeScheduleSchema } from '@/types/planning';
import { Network, MapPin } from 'lucide-react';
import { useCreateMultiPlan } from '@/hooks/use-api';
import { format } from 'date-fns';
import { DEFAULT_TRAVEL_PREFERENCES } from '@/constants/planning';
import { cn } from '@/lib/utils';

// 多节点特有数据接口
interface MultiSpecificData {
  startPoint: string;
  nodesSchedule: NodeScheduleSchema[];
}

// 多节点特有字段组件
const MultiSpecificFields = ({
  data,
  onDataChange,
  className,
}: {
  data: MultiSpecificData;
  onDataChange: (data: MultiSpecificData) => void;
  className?: string;
}) => {
  const updateData = (
    key: keyof MultiSpecificData,
    value: string | NodeScheduleSchema[],
  ) => {
    onDataChange({ ...data, [key]: value });
  };

  return (
    <Card className={cn('shadow-sm', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-700">
          <Network className="w-5 h-5" />
          多节点行程设置
          <span className="text-sm font-normal text-gray-500">
            (可选，规划多个目的地的详细行程)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 出发地 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">出发地点</span>
          </div>

          <div>
            <Label htmlFor="start-point" className="text-base font-medium">
              出发地
            </Label>
            <Input
              id="start-point"
              placeholder="输入出发城市"
              value={data.startPoint}
              onChange={(e) => updateData('startPoint', e.target.value)}
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">您的整个行程的起始地点</p>
          </div>
        </div>

        {/* 节点行程安排 */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Network className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-gray-700">
              节点行程安排
            </span>
          </div>

          <NodeScheduleInput
            nodes={data.nodesSchedule}
            onNodesChange={(nodes) => updateData('nodesSchedule', nodes)}
          />
          <p className="text-xs text-gray-500 mt-2">
            添加您计划访问的各个目的地及对应的到达和离开时间
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const MultiTaskPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutate: createPlan, isPending } = useCreateMultiPlan();
  const generateButtonRef = useRef<HTMLButtonElement>(null);

  // 确保页面加载时滚动到顶部
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 必填字段数据
  const [requiredData, setRequiredData] = useState<RequiredFieldsData>({
    departureDate: undefined,
    returnDate: undefined,
  });

  // 可选字段数据
  const [optionalData, setOptionalData] = useState<OptionalFieldsData>({
    planTitle: '',
    groupSize: 1,
    primaryTransport: '飞机',
  });

  // 多节点特有数据
  const [multiData, setMultiData] = useState<MultiSpecificData>({
    startPoint: '',
    nodesSchedule: [{ location: '', arrival_date: '', departure_date: '' }],
  });

  // 偏好设置
  const [preferences, setPreferences] = useState<TravelPreferences>(
    DEFAULT_TRAVEL_PREFERENCES,
  );

  // 检查必填字段是否完整
  const isRequiredFieldsComplete = useCallback(() => {
    return !!(requiredData.departureDate && requiredData.returnDate);
  }, [requiredData.departureDate, requiredData.returnDate]);

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
  }, [isRequiredFieldsComplete]);

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

    // 验证节点信息
    const hasIncompleteNodes = multiData.nodesSchedule.some(
      (node) => !node.location || !node.arrival_date || !node.departure_date,
    );
    if (hasIncompleteNodes) {
      toast({
        title: '节点信息不完整',
        description: '请完善所有节点的位置和时间信息。',
        variant: 'destructive',
      });
      return;
    }

    // 构造请求数据
    const requestData = {
      title: optionalData.planTitle || `多节点旅行计划`,
      source: multiData.startPoint,
      departure_date: format(
        requiredData.departureDate!,
        "yyyy-MM-dd'T'HH:mm:ss",
      ),
      return_date: format(requiredData.returnDate!, "yyyy-MM-dd'T'HH:mm:ss"),
      group_size: optionalData.groupSize,
      transport_mode: optionalData.primaryTransport,
      nodes_schedule: multiData.nodesSchedule,
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
        navigate(`/multi/result/${taskId}`);
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
        title="多节点规划"
        description="精心安排多个目的地的完美旅程"
        className="bg-gradient-to-r from-purple-500 to-indigo-500"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Left Column: Forms */}
          <div className="xl:col-span-2 space-y-6">
            {/* 必填信息 */}
            <RequiredFieldsSection
              data={requiredData}
              onDataChange={setRequiredData}
              mode="multi"
            />

            {/* 可选设置 */}
            <OptionalFieldsSection
              data={optionalData}
              onDataChange={setOptionalData}
              onGroupSizeChange={handleGroupSizeChange}
            />

            {/* 多节点特有设置 */}
            <MultiSpecificFields data={multiData} onDataChange={setMultiData} />

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
                  ? '生成多节点方案'
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
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">多目的地</h4>
                    <p className="text-sm text-gray-600">
                      设置先后达到的多个目的地，规划不再局限于单地
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">时间精准</h4>
                    <p className="text-sm text-gray-600">
                      针对每个目的地的抵达和离开时间进行精准规划
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">交通衔接</h4>
                    <p className="text-sm text-gray-600">
                      优化目的地间的交通方式和时间安排
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">目的地游玩</h4>
                    <p className="text-sm text-gray-600">
                      为每个目的地推荐专属的游玩内容
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-500" />
                  规划内容
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">各节点住宿</Badge>
                  <Badge variant="secondary">各节点活动</Badge>
                  <Badge variant="secondary">节点间交通</Badge>
                  <Badge variant="secondary">行程亮点</Badge>
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

export default MultiTaskPage;
