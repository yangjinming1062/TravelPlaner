import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import PreferencesSection, { type TravelPreferences } from "@/components/shared/PreferencesSection";
import CommonPlanningFields, { type CommonPlanningData } from "@/components/shared/CommonPlanningFields";
import NavigationHeader from "@/components/shared/NavigationHeader";
import { NodeScheduleInput } from "@/components/shared/NodeSchedule";
import { NodeScheduleSchema } from "@/types/planning";
import { useCreateMultiPlan } from "@/hooks/use-api";
import { format } from "date-fns";
import type { AccommodationLevel } from "@/constants/planning";
import { DEFAULT_TRAVEL_PREFERENCES, DEFAULT_COMMON_PLANNING_DATA } from "@/constants/planning";
import { useGroupSize } from "@/hooks/use-group-size";

const MultiTaskPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutate: createPlan, isPending } = useCreateMultiPlan();
  
  // 确保页面加载时滚动到顶部
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // 基础规划信息
  const [commonData, setCommonData] = useState<CommonPlanningData>(DEFAULT_COMMON_PLANNING_DATA);

  // 多节点特有信息
  const [startPoint, setStartPoint] = useState("");
  const [nodesSchedule, setNodesSchedule] = useState<NodeScheduleSchema[]>([
    { location: "", arrival_date: "", departure_date: "" }
  ]);

  // 偏好设置
  const [preferences, setPreferences] = useState<TravelPreferences>(DEFAULT_TRAVEL_PREFERENCES);

  // 使用自定义Hook管理出行人数
  const { handleTravelTypeChange, handleGroupSizeChange } = useGroupSize(commonData, setCommonData);

  const handlePlanGenerate = () => {
    // 验证必填字段
    if (!startPoint || !commonData.departureDate || !commonData.returnDate || 
        nodesSchedule.some(node => !node.location || !node.arrival_date || !node.departure_date)) {
      toast({
        title: "信息不完整",
        description: "请填写所有必填字段。",
        variant: "destructive",
      });
      return;
    }

    // 构造请求数据
    const requestData = {
      title: commonData.planTitle || `多节点旅行计划`,
      source: startPoint,
      departure_date: format(commonData.departureDate, "yyyy-MM-dd'T'HH:mm:ss"),
      return_date: format(commonData.returnDate, "yyyy-MM-dd'T'HH:mm:ss"),
      group_size: commonData.groupSize,
      transport_mode: commonData.primaryTransport,
      nodes_schedule: nodesSchedule,
      preferred_transport_modes: preferences.transportMethods,
      accommodation_level: preferences.accommodationLevels,
      activity_preferences: preferences.activityTypes,
      attraction_categories: preferences.scenicTypes,
      travel_style: preferences.travelStyle,
      budget_flexibility: preferences.budgetType,
      dietary_restrictions: preferences.dietaryRestrictions ? [preferences.dietaryRestrictions as any] : [], // eslint-disable-line @typescript-eslint/no-explicit-any
      group_travel_preference: preferences.travelType,
      custom_preferences: preferences.specialRequirements,
    };

    // 调用API创建规划任务
    createPlan(requestData, {
      onSuccess: (taskId) => {
        toast({
          title: "规划任务已提交",
          description: "正在生成您的旅行计划，请稍候查看结果。",
        });
        navigate(`/multi/result/${taskId}`);
      },
      onError: (error: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        toast({
          title: "提交失败",
          description: error.message || "无法提交规划请求，请稍后重试。",
          variant: "destructive",
        });
      }
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
            {/* 基本信息 */}
            <CommonPlanningFields 
              data={commonData}
              onDataChange={setCommonData}
              onGroupSizeChange={handleGroupSizeChange}
            />

            {/* 出发地 */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-500" />
                  出发地信息
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    出发地 *
                  </label>
                  <input
                    type="text"
                    placeholder="输入出发城市"
                    value={startPoint}
                    onChange={(e) => setStartPoint(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 节点规划信息 */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-500" />
                  节点规划
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NodeScheduleInput
                  nodes={nodesSchedule}
                  onNodesChange={setNodesSchedule}
                />
              </CardContent>
            </Card>

            {/* 偏好设置 */}
            <PreferencesSection 
              preferences={preferences}
              onPreferencesChange={setPreferences}
              onTravelTypeChange={handleTravelTypeChange}
            />

            {/* 生成按钮 */}
            <Button 
              className="w-full" 
              size="lg"
              onClick={handlePlanGenerate}
              disabled={!startPoint || !commonData.departureDate || !commonData.returnDate || isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              {isPending ? "生成中..." : "生成多节点方案"}
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
                    <h4 className="font-semibold">多点连线</h4>
                    <p className="text-sm text-gray-600">智能规划多个目的地的最佳游览顺序</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">时间优化</h4>
                    <p className="text-sm text-gray-600">合理分配在每个节点的停留时间</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">交通衔接</h4>
                    <p className="text-sm text-gray-600">优化节点间的交通方式和时间安排</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">个性定制</h4>
                    <p className="text-sm text-gray-600">针对每个节点制定专属的游玩计划</p>
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
                  <Badge variant="secondary">节点安排</Badge>
                  <Badge variant="secondary">交通衔接</Badge>
                  <Badge variant="secondary">住宿推荐</Badge>
                  <Badge variant="secondary">行程亮点</Badge>
                  <Badge variant="secondary">时间优化</Badge>
                  <Badge variant="secondary">费用预算</Badge>
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
