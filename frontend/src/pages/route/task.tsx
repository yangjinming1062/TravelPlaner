import React, { useState } from "react";
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
import { ArrowLeft, Route, MapPin, Clock, Send, Navigation } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import PreferencesSection, { type TravelPreferences } from "@/components/shared/PreferencesSection";
import CommonPlanningFields, { type CommonPlanningData } from "@/components/shared/CommonPlanningFields";
import { useCreateRoutePlan } from "@/hooks/use-api";
import { format } from "date-fns";

const RouteTaskPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutate: createPlan, isPending } = useCreateRoutePlan();
  
  // 基础规划信息
  const [commonData, setCommonData] = useState<CommonPlanningData>({
    planTitle: "",
    departureDate: undefined,
    returnDate: undefined,
    primaryTransport: "自驾",
  });

  // 沿途游玩特有信息
  const [startPoint, setStartPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");
  const [maxStopovers, setMaxStopovers] = useState(3);
  const [maxStopoverDuration, setMaxStopoverDuration] = useState(2);
  const [routePreference, setRoutePreference] = useState("平衡");
  const [maxDetourDistance, setMaxDetourDistance] = useState(100);
  const [preferredStopTypes, setPreferredStopTypes] = useState<string[]>([]);

  // 偏好设置
  const [preferences, setPreferences] = useState<TravelPreferences>({
    transportMethods: [],
    accommodationLevel: 3,
    activityTypes: [],
    scenicTypes: [],
    travelStyle: "平衡型",
    budgetType: "性价比优先",
    budgetRange: "",
    dietaryRestrictions: "",
    travelType: "独行",
    specialRequirements: "",
  });

  const stopTypeOptions = [
    { id: "历史古迹", label: "历史古迹" },
    { id: "自然景观", label: "自然景观" },
    { id: "美食体验", label: "美食体验" },
    { id: "文化场所", label: "文化场所" },
    { id: "购物中心", label: "购物中心" },
    { id: "娱乐设施", label: "娱乐设施" },
    { id: "温泉度假", label: "温泉度假" },
    { id: "户外活动", label: "户外活动" },
  ];

  const toggleStopType = (type: string) => {
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
      group_size: preferences.travelType === "家庭" ? 4 : 
                  preferences.travelType === "朋友" ? 3 : 
                  preferences.travelType === "情侣" ? 2 : 1,
      transport_mode: commonData.primaryTransport,
      max_stopovers: maxStopovers,
      max_stopover_duration: maxStopoverDuration,
      route_preference: routePreference,
      max_detour_distance: maxDetourDistance,
      preferred_stop_types: preferredStopTypes,
      preferred_transport_modes: preferences.transportMethods,
      accommodation_level: preferences.accommodationLevel,
      activity_preferences: preferences.activityTypes,
      attraction_categories: preferences.scenicTypes,
      travel_style: preferences.travelStyle,
      budget_flexibility: preferences.budgetType,
      dietary_restrictions: preferences.dietaryRestrictions ? [preferences.dietaryRestrictions] : [],
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
      onError: (error: any) => {
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
      <header className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-6">
        <div className="container mx-auto px-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-white hover:bg-white/20"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <div>
            <h1 className="text-2xl font-bold">沿途游玩规划</h1>
            <p className="text-white/90">发现旅途中的每一处美景</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
          
          {/* Left Column: Forms */}
          <div className="xl:col-span-2 space-y-6">
            {/* 基本信息 */}
            <CommonPlanningFields 
              data={commonData}
              onDataChange={setCommonData}
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
                    <Select value={routePreference} onValueChange={setRoutePreference}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="选择路线偏好" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="速度优先">速度优先</SelectItem>
                        <SelectItem value="风景优先">风景优先</SelectItem>
                        <SelectItem value="经济优先">经济优先</SelectItem>
                        <SelectItem value="平衡">平衡</SelectItem>
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
                    {stopTypeOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`stop-${option.id}`}
                          checked={preferredStopTypes.includes(option.id)}
                          onCheckedChange={() => toggleStopType(option.id)}
                        />
                        <Label htmlFor={`stop-${option.id}`} className="text-sm">
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
                <CardTitle>路线优势</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">最优路线</h4>
                    <p className="text-sm text-gray-600">计算最佳行驶路线，减少绕路和回头路</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">沿途发现</h4>
                    <p className="text-sm text-gray-600">推荐沿途值得停留的景点和美食</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">时间平衡</h4>
                    <p className="text-sm text-gray-600">合理安排驾驶时间与游玩时间的比例</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">灵活调整</h4>
                    <p className="text-sm text-gray-600">根据实际情况可随时调整行程安排</p>
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
                  <Badge variant="secondary">最优路线</Badge>
                  <Badge variant="secondary">沿途景点</Badge>
                  <Badge variant="secondary">休息站点</Badge>
                  <Badge variant="secondary">加油站信息</Badge>
                  <Badge variant="secondary">住宿推荐</Badge>
                  <Badge variant="secondary">美食指南</Badge>
                  <Badge variant="secondary">路况预警</Badge>
                  <Badge variant="secondary">费用明细</Badge>
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
