import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Route, MapPin, Clock, Send, Navigation } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import PreferencesSection, { type TravelPreferences } from "@/components/shared/PreferencesSection";
import CommonPlanningFields, { type CommonPlanningData } from "@/components/shared/CommonPlanningFields";
import NavigationHeader from "@/components/shared/NavigationHeader";
import { useCreateRoutePlan } from "@/hooks/use-api";
import { format } from "date-fns";
import { ROUTE_PREFERENCES, PREFERRED_STOP_TYPES, DEFAULT_TRAVEL_PREFERENCES, DEFAULT_COMMON_PLANNING_DATA } from "@/constants/planning";
import type { RoutePreference, PreferredStopType, AccommodationLevel } from "@/constants/planning";
import { useGroupSize } from "@/hooks/use-group-size";

const RouteTaskPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutate: createPlan, isPending } = useCreateRoutePlan();
  
  // 确保页面加载时滚动到顶部
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // 基础规划信息
  const [commonData, setCommonData] = useState<CommonPlanningData>(DEFAULT_COMMON_PLANNING_DATA);

  // 沿途游玩特有信息
  const [startPoint, setStartPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");
  const [maxStopovers, setMaxStopovers] = useState(3);
  const [maxStopoverDuration, setMaxStopoverDuration] = useState(2);
  const [routePreference, setRoutePreference] = useState<RoutePreference>("平衡");
  const [maxDetourDistance, setMaxDetourDistance] = useState(100);
  const [preferredStopTypes, setPreferredStopTypes] = useState<PreferredStopType[]>([]);

  // 偏好设置
  const [preferences, setPreferences] = useState<TravelPreferences>(DEFAULT_TRAVEL_PREFERENCES);

  // 使用自定义Hook管理出行人数
  const { handleTravelTypeChange, handleGroupSizeChange } = useGroupSize(commonData, setCommonData);

  const toggleStopType = (type: PreferredStopType) => {
    if (preferredStopTypes.includes(type)) {
      setPreferredStopTypes(preferredStopTypes.filter(t => t !== type));
    } else {
      setPreferredStopTypes([...preferredStopTypes, type]);
    }
  };

  const handlePlanGenerate = () => {
    // 验证必填字段
    if (!startPoint || !endPoint || !commonData.departureDate || !commonData.returnDate) {
      toast({
        title: "信息不完整",
        description: "请填写所有必填字段。",
        variant: "destructive",
      });
      return;
    }

    // 构造请求数据
    const requestData = {
      title: commonData.planTitle || `从${startPoint}到${endPoint}的沿途游玩计划`,
      source: startPoint,
      target: endPoint,
      departure_date: format(commonData.departureDate, "yyyy-MM-dd'T'HH:mm:ss"),
      return_date: format(commonData.returnDate, "yyyy-MM-dd'T'HH:mm:ss"),
      group_size: commonData.groupSize,
      transport_mode: commonData.primaryTransport,
      max_stopovers: maxStopovers,
      max_stopover_duration: maxStopoverDuration,
      route_preference: routePreference,
      max_detour_distance: maxDetourDistance,
      preferred_stop_types: preferredStopTypes,
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
        // 跳转到结果页面
        navigate(`/route/result/${taskId}`);
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
        title="沿途游玩规划"
        description="发现旅途中的每一处美景"
        className="bg-gradient-to-r from-orange-500 to-red-500"
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

            {/* 路线规划信息 */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-orange-500" />
                  路线信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startPoint">出发地 *</Label>
                    <Input
                      id="startPoint"
                      placeholder="输入出发城市"
                      value={startPoint}
                      onChange={(e) => setStartPoint(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="endPoint">目的地 *</Label>
                    <Input
                      id="endPoint"
                      placeholder="输入目的地城市"
                      value={endPoint}
                      onChange={(e) => setEndPoint(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="max-stopovers">最多停留次数</Label>
                    <div className="mt-2">
                      <Slider
                        id="max-stopovers"
                        value={[maxStopovers]}
                        onValueChange={(value) => setMaxStopovers(value[0])}
                        max={10}
                        min={0}
                        step={1}
                      />
                      <div className="text-center mt-1">
                        <span className="text-sm font-medium">{maxStopovers} 次</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="max-stopover-duration">计划停留时长 (小时)</Label>
                    <div className="mt-2">
                      <Slider
                        id="max-stopover-duration"
                        value={[maxStopoverDuration]}
                        onValueChange={(value) => setMaxStopoverDuration(value[0])}
                        max={24}
                        min={1}
                        step={1}
                      />
                      <div className="text-center mt-1">
                        <span className="text-sm font-medium">{maxStopoverDuration} 小时</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="route-preference">路线偏好</Label>
                    <Select value={routePreference} onValueChange={(value) => setRoutePreference(value as RoutePreference)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="选择路线偏好" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROUTE_PREFERENCES.map((route) => (
                          <SelectItem key={route.value} value={route.value}>
                            {route.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="max-detour-distance">最大绕行距离 (km)</Label>
                    <div className="mt-2">
                      <Slider
                        id="max-detour-distance"
                        value={[maxDetourDistance]}
                        onValueChange={(value) => setMaxDetourDistance(value[0])}
                        max={500}
                        min={10}
                        step={10}
                      />
                      <div className="text-center mt-1">
                        <span className="text-sm font-medium">{maxDetourDistance} km</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">偏好停留类型（多选）</Label>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {PREFERRED_STOP_TYPES.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`stop-${option.value}`}
                          checked={preferredStopTypes.includes(option.value)}
                          onCheckedChange={() => toggleStopType(option.value)}
                        />
                        <Label htmlFor={`stop-${option.value}`} className="text-sm">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
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
              disabled={!startPoint || !endPoint || !commonData.departureDate || !commonData.returnDate || isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              {isPending ? "生成中..." : "规划沿途路线"}
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
                    <p className="text-sm text-gray-600">侧重目的地深度游玩和详细推荐</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">沿途发现</h4>
                    <p className="text-sm text-gray-600">发现并推荐沿途有价值的景点</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">路线优化</h4>
                    <p className="text-sm text-gray-600">兼顾赶路和游玩，合理安排行程</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">停留控制</h4>
                    <p className="text-sm text-gray-600">可控制沿途停留次数和时长</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-50 to-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-500" />
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
