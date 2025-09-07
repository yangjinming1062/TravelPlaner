import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Send, Sparkles, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import PreferencesSection, { type TravelPreferences } from "@/components/shared/PreferencesSection";
import CommonPlanningFields, { type CommonPlanningData } from "@/components/shared/CommonPlanningFields";
import { useCreateSmartPlan } from "@/hooks/use-api";
import { format } from "date-fns";

const SmartTaskPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutate: createPlan, isPending } = useCreateSmartPlan();
  
  // 基础规划信息
  const [commonData, setCommonData] = useState<CommonPlanningData>({
    planTitle: "",
    departureDate: undefined,
    returnDate: undefined,
    primaryTransport: "自驾",
  });

  // 智能推荐特有信息
  const [startPoint, setStartPoint] = useState("");
  const [maxTravelDistance, setMaxTravelDistance] = useState(1000);
  const [preferredEnvironment, setPreferredEnvironment] = useState("");
  const [avoidRegions, setAvoidRegions] = useState<string[]>([]);

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

  const avoidRegionOptions = [
    "高原地区", "沙漠地区", "极寒地区", "海岛地区", 
    "偏远山区", "政治敏感区", "自然灾害区", "交通不便区"
  ];

  const toggleAvoidRegion = (region: string) => {
    if (avoidRegions.includes(region)) {
      setAvoidRegions(avoidRegions.filter(r => r !== region));
    } else {
      setAvoidRegions([...avoidRegions, region]);
    }
  };

  const handlePlanGenerate = () => {
    // 验证必填字段
    if (!startPoint || !commonData.departureDate || !commonData.returnDate) {
      toast({
        title: "信息不完整",
        description: "请填写所有必填字段。",
        variant: "destructive",
      });
      return;
    }

    // 构造请求数据
    const requestData = {
      title: commonData.planTitle || `智能推荐旅行计划`,
      source: startPoint,
      departure_date: format(commonData.departureDate, "yyyy-MM-dd'T'HH:mm:ss"),
      return_date: format(commonData.returnDate, "yyyy-MM-dd'T'HH:mm:ss"),
      group_size: preferences.travelType === "家庭" ? 4 : 
                  preferences.travelType === "朋友" ? 3 : 
                  preferences.travelType === "情侣" ? 2 : 1,
      transport_mode: commonData.primaryTransport,
      max_travel_distance: maxTravelDistance,
      preferred_environment: preferredEnvironment,
      avoid_regions: avoidRegions,
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
          description: "AI正在为您生成智能推荐方案，请稍候查看结果。",
        });
        navigate(`/smart/result/${taskId}`);
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
      <header className="bg-gradient-to-r from-green-500 to-teal-500 text-white py-6">
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
            <h1 className="text-2xl font-bold">智能推荐规划</h1>
            <p className="text-white/90">让AI为您发现最适合的旅游目的地</p>
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

            {/* 智能推荐配置 */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-green-500" />
                  智能推荐配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="startPoint">出发地 *</Label>
                  <Input
                    id="startPoint"
                    placeholder="输入您的出发城市"
                    value={startPoint}
                    onChange={(e) => setStartPoint(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="max-travel-distance">最大出行距离 (km)</Label>
                  <div className="mt-2">
                    <Slider
                      id="max-travel-distance"
                      value={[maxTravelDistance]}
                      onValueChange={(value) => setMaxTravelDistance(value[0])}
                      max={3000}
                      min={100}
                      step={100}
                    />
                    <div className="text-center mt-1">
                      <span className="text-sm font-medium">{maxTravelDistance} km</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="preferred-environment">环境偏好</Label>
                  <Input
                    id="preferred-environment"
                    placeholder="如：海边、草原、森林、古城等"
                    value={preferredEnvironment}
                    onChange={(e) => setPreferredEnvironment(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-base font-medium">避免的地区类型（多选）</Label>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {avoidRegionOptions.map((region) => (
                      <div key={region} className="flex items-center space-x-2">
                        <Checkbox
                          id={`avoid-${region}`}
                          checked={avoidRegions.includes(region)}
                          onCheckedChange={() => toggleAvoidRegion(region)}
                        />
                        <Label htmlFor={`avoid-${region}`} className="text-sm">
                          {region}
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
              disabled={!startPoint || !commonData.departureDate || !commonData.returnDate || isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              {isPending ? "AI分析中..." : "获取智能推荐"}
            </Button>
          </div>

          {/* Right Column: Features */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI智能推荐</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">个性化匹配</h4>
                    <p className="text-sm text-gray-600">基于您的偏好智能匹配最适合的目的地</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">数据分析</h4>
                    <p className="text-sm text-gray-600">综合天气、季节、热度等多维度数据</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">惊喜发现</h4>
                    <p className="text-sm text-gray-600">推荐您可能从未考虑过的绝佳目的地</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">完整规划</h4>
                    <p className="text-sm text-gray-600">不仅推荐目的地，还提供完整的行程规划</p>
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
                  <Badge variant="secondary">目的地推荐</Badge>
                  <Badge variant="secondary">推荐理由</Badge>
                  <Badge variant="secondary">最佳时间</Badge>
                  <Badge variant="secondary">行程安排</Badge>
                  <Badge variant="secondary">特色亮点</Badge>
                  <Badge variant="secondary">预算建议</Badge>
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
