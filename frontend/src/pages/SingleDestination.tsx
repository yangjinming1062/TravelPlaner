import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, Clock, Users, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import PreferencesSection, { type TravelPreferences } from "@/components/shared/PreferencesSection";
import CommonPlanningFields, { type CommonPlanningData } from "@/components/shared/CommonPlanningFields";
import { useCreateSinglePlan } from "@/hooks/use-api";
import { format } from "date-fns";

const SingleDestination = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutate: createPlan, isPending } = useCreateSinglePlan();
  
  // 基础规划信息
  const [commonData, setCommonData] = useState<CommonPlanningData>({
    planTitle: "",
    departureDate: undefined,
    returnDate: undefined,
    primaryTransport: "自驾",
  });

  // 单一目的地特有信息
  const [destination, setDestination] = useState("");
  const [startPoint, setStartPoint] = useState("");

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

  const handlePlanGenerate = () => {
    // 验证必填字段
    if (!destination || !startPoint || !commonData.departureDate || !commonData.returnDate) {
      toast({
        title: "信息不完整",
        description: "请填写所有必填字段。",
        variant: "destructive",
      });
      return;
    }

    // 构造请求数据
    const requestData = {
      title: commonData.planTitle || `前往${destination}的旅行计划`,
      source: startPoint,
      target: destination,
      departure_date: commonData.departureDate ? format(commonData.departureDate, "yyyy-MM-dd") : "",
      return_date: commonData.returnDate ? format(commonData.returnDate, "yyyy-MM-dd") : "",
      group_size: preferences.travelType === "家庭" ? 4 : 
                  preferences.travelType === "朋友" ? 3 : 
                  preferences.travelType === "情侣" ? 2 : 1,
      transport_mode: commonData.primaryTransport,
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
        navigate(`/plan-result/single/${taskId}`);
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
      <header className="bg-gradient-ocean text-white py-6">
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
            <h1 className="text-2xl font-bold">单一目的地模式</h1>
            <p className="text-white/90">专注于单个目的地的深度游玩</p>
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

            {/* 目的地规划信息 */}
            <Card className="shadow-travel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  目的地信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  <Label htmlFor="destination">目的地 *</Label>
                  <Input
                    id="destination"
                    placeholder="输入你想去的城市或景点"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="mt-2"
                  />
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
              disabled={!destination || !startPoint || !commonData.departureDate || !commonData.returnDate || isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              {isPending ? "生成中..." : "生成专属旅游方案"}
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
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">深度体验</h4>
                    <p className="text-sm text-muted-foreground">充分挖掘单个目的地的精彩之处，避免走马观花</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">景点优化</h4>
                    <p className="text-sm text-muted-foreground">智能推荐目的地内部最值得游览的景点和活动</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">住宿位置</h4>
                    <p className="text-sm text-muted-foreground">根据行程安排推荐最佳住宿位置，节省交通时间</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">时间安排</h4>
                    <p className="text-sm text-muted-foreground">合理分配各景点游览时间，确保旅程轻松愉快</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-primary/5 to-primary-glow/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  规划包含
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">景点推荐</Badge>
                  <Badge variant="secondary">路线规划</Badge>
                  <Badge variant="secondary">住宿建议</Badge>
                  <Badge variant="secondary">美食推荐</Badge>
                  <Badge variant="secondary">交通指引</Badge>
                  <Badge variant="secondary">费用预算</Badge>
                  <Badge variant="secondary">最佳时间</Badge>
                  <Badge variant="secondary">注意事项</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleDestination;