import { useState } from "react";
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
import PreferencesSection, { type TravelPreferences } from "@/components/shared/PreferencesSection";
import CommonPlanningFields, { type CommonPlanningData } from "@/components/shared/CommonPlanningFields";

const RoutePlanning = () => {
  const navigate = useNavigate();
  
  // 基础规划信息
  const [commonData, setCommonData] = useState<CommonPlanningData>({
    planTitle: "",
    departureDate: undefined,
    returnDate: undefined,
    primaryTransport: "",
  });

  // 沿途游玩特有信息
  const [startPoint, setStartPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");
  const [routePreference, setRoutePreference] = useState("");
  const [maxDetourDistance, setMaxDetourDistance] = useState([50]);
  const [preferredStopTypes, setPreferredStopTypes] = useState<string[]>([]);

  // 偏好设置
  const [preferences, setPreferences] = useState<TravelPreferences>({
    transportMethods: [],
    accommodationLevel: 3,
    activityTypes: [],
    scenicTypes: [],
    travelStyle: "",
    budgetType: "",
    budgetRange: "",
    dietaryRestrictions: "",
    travelType: "",
    specialRequirements: "",
  });

  const stopTypeOptions = [
    { id: "historical", label: "历史古迹" },
    { id: "natural", label: "自然景观" },
    { id: "food", label: "美食体验" },
    { id: "cultural", label: "文化场所" },
    { id: "shopping", label: "购物中心" },
    { id: "entertainment", label: "娱乐设施" },
    { id: "spa", label: "温泉度假" },
    { id: "outdoor", label: "户外活动" },
  ];

  const toggleStopType = (type: string) => {
    if (preferredStopTypes.includes(type)) {
      setPreferredStopTypes(preferredStopTypes.filter(t => t !== type));
    } else {
      setPreferredStopTypes([...preferredStopTypes, type]);
    }
  };

  const handlePlanGenerate = () => {
    const planData = {
      type: "route-planning",
      common: commonData,
      specific: { 
        startPoint, 
        endPoint, 
        routePreference, 
        maxDetourDistance: maxDetourDistance[0],
        preferredStopTypes 
      },
      preferences
    };
    console.log("生成沿途游玩规划:", planData);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-sunset text-white py-6">
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
            <h1 className="text-2xl font-bold">沿途游玩模式</h1>
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
            <Card className="shadow-travel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-accent" />
                  路线信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="startPoint">出发地</Label>
                  <Input
                    id="startPoint"
                    placeholder="输入出发城市"
                    value={startPoint}
                    onChange={(e) => setStartPoint(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="endPoint">目的地</Label>
                  <Input
                    id="endPoint"
                    placeholder="输入目的地城市"
                    value={endPoint}
                    onChange={(e) => setEndPoint(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="route-preference">路线偏好</Label>
                  <Select value={routePreference} onValueChange={setRoutePreference}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="选择路线偏好" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="speed">速度优先</SelectItem>
                      <SelectItem value="scenery">风景优先</SelectItem>
                      <SelectItem value="economy">经济优先</SelectItem>
                      <SelectItem value="balanced">平衡</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base font-medium">最大绕行距离</Label>
                  <div className="mt-3">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-sm text-muted-foreground">10km</span>
                      <div className="flex-1">
                        <Slider
                          value={maxDetourDistance}
                          onValueChange={setMaxDetourDistance}
                          max={200}
                          min={10}
                          step={10}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">200km</span>
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-medium">{maxDetourDistance[0]}km</span>
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
              disabled={!startPoint || !endPoint || !commonData.departureDate}
            >
              <Send className="w-4 h-4 mr-2" />
              规划沿途路线
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
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">最优路线</h4>
                    <p className="text-sm text-muted-foreground">计算最佳行驶路线，减少绕路和回头路</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">沿途发现</h4>
                    <p className="text-sm text-muted-foreground">推荐沿途值得停留的景点和美食</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">时间平衡</h4>
                    <p className="text-sm text-muted-foreground">合理安排驾驶时间与游玩时间的比例</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">灵活调整</h4>
                    <p className="text-sm text-muted-foreground">根据实际情况可随时调整行程安排</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-accent/5 to-accent/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-accent" />
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

            <Card className="border-accent/20">
              <CardHeader>
                <CardTitle className="text-accent">适合场景</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-accent rounded-full" />
                    自驾游爱好者
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-accent rounded-full" />
                    时间充裕的长途旅行
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-accent rounded-full" />
                    喜欢探索未知景点
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-accent rounded-full" />
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

export default RoutePlanning;