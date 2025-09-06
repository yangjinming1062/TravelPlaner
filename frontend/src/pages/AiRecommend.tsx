import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Brain, Sparkles, TrendingUp, Send, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PreferencesSection, { type TravelPreferences } from "@/components/shared/PreferencesSection";
import CommonPlanningFields, { type CommonPlanningData } from "@/components/shared/CommonPlanningFields";

const AiRecommend = () => {
  const navigate = useNavigate();
  
  // 基础规划信息
  const [commonData, setCommonData] = useState<CommonPlanningData>({
    planTitle: "",
    departureDate: undefined,
    returnDate: undefined,
    primaryTransport: "",
  });

  // AI推荐特有信息
  const [maxTravelDistance, setMaxTravelDistance] = useState([1000]);
  const [environmentPreference, setEnvironmentPreference] = useState("");
  const [avoidedRegions, setAvoidedRegions] = useState<string[]>([]);

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

  const environmentOptions = [
    { value: "seaside", label: "海边海岸" },
    { value: "mountain", label: "高山山脉" },
    { value: "grassland", label: "草原牧场" },
    { value: "desert", label: "沙漠戈壁" },
    { value: "forest", label: "森林丛林" },
    { value: "lake", label: "湖泊河流" },
    { value: "city", label: "城市都市" },
    { value: "countryside", label: "乡村田园" },
  ];

  const avoidRegionOptions = [
    { id: "plateau", label: "高原地区" },
    { id: "desert", label: "沙漠地区" },
    { id: "cold", label: "极寒地区" },
    { id: "island", label: "海岛地区" },
    { id: "remote", label: "偏远山区" },
    { id: "political", label: "政治敏感区" },
    { id: "disaster", label: "自然灾害区" },
    { id: "traffic", label: "交通不便区" },
  ];

  const toggleAvoidRegion = (region: string) => {
    if (avoidedRegions.includes(region)) {
      setAvoidedRegions(avoidedRegions.filter(r => r !== region));
    } else {
      setAvoidedRegions([...avoidedRegions, region]);
    }
  };

  const handleRecommendation = () => {
    const planData = {
      type: "ai-recommend",
      common: commonData,
      specific: {
        maxTravelDistance: maxTravelDistance[0],
        environmentPreference,
        avoidedRegions
      },
      preferences
    };
    console.log("生成AI推荐:", planData);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-sky text-white py-6">
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
            <h1 className="text-2xl font-bold">智能推荐模式</h1>
            <p className="text-white/90">AI为你推荐最适合的旅游目的地</p>
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
              showTransport={false}
            />

            {/* AI智能推荐信息 */}
            <Card className="shadow-travel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary-glow" />
                  智能分析参数
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium">最大出行距离</Label>
                  <div className="mt-3">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-sm text-muted-foreground">100km</span>
                      <div className="flex-1">
                        <Slider
                          value={maxTravelDistance}
                          onValueChange={setMaxTravelDistance}
                          max={3000}
                          min={100}
                          step={100}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">3000km</span>
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-medium">{maxTravelDistance[0]}km</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="environment-preference">环境偏好</Label>
                  <Select value={environmentPreference} onValueChange={setEnvironmentPreference}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="选择您偏好的环境类型" />
                    </SelectTrigger>
                    <SelectContent>
                      {environmentOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base font-medium">避免的地区（多选）</Label>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {avoidRegionOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`avoid-${option.id}`}
                          checked={avoidedRegions.includes(option.id)}
                          onCheckedChange={() => toggleAvoidRegion(option.id)}
                        />
                        <Label htmlFor={`avoid-${option.id}`} className="text-sm">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary-glow" />
                    <span className="font-medium">AI 智能分析</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    系统将基于您的预算、时间、偏好等信息，运用大数据和AI算法为您推荐最适合的旅游目的地和完整方案。
                  </p>
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
              onClick={handleRecommendation}
              disabled={!commonData.departureDate || !environmentPreference}
            >
              <Send className="w-4 h-4 mr-2" />
              获取AI推荐方案
            </Button>
          </div>

          {/* Right Column: AI Features */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-glow" />
                  AI优势
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary-glow rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">智能匹配</h4>
                    <p className="text-sm text-muted-foreground">基于大数据分析，精准匹配您的需求和偏好</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary-glow rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">多方案对比</h4>
                    <p className="text-sm text-muted-foreground">提供多个候选方案，帮助您做出最佳选择</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary-glow rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">实时更新</h4>
                    <p className="text-sm text-muted-foreground">基于最新数据和用户反馈持续优化推荐</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary-glow rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">个性化定制</h4>
                    <p className="text-sm text-muted-foreground">根据个人喜好定制专属的旅行方案</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-primary-glow/5 to-primary/5">
              <CardHeader>
                <CardTitle>推荐内容</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">目的地推荐</Badge>
                  <Badge variant="secondary">最佳时间</Badge>
                  <Badge variant="secondary">预算分配</Badge>
                  <Badge variant="secondary">行程规划</Badge>
                  <Badge variant="secondary">住宿建议</Badge>
                  <Badge variant="secondary">交通方案</Badge>
                  <Badge variant="secondary">必游景点</Badge>
                  <Badge variant="secondary">美食推荐</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary-glow/20">
              <CardHeader>
                <CardTitle className="text-primary-glow">智能特色</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-primary-glow rounded-full" />
                    基于机器学习的智能算法
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-primary-glow rounded-full" />
                    百万用户数据训练优化
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-primary-glow rounded-full" />
                    实时天气和季节性推荐
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-primary-glow rounded-full" />
                    动态价格和性价比分析
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-primary-glow/10 to-primary/10 border-primary-glow/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-sky rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI 推荐保证</h3>
                    <p className="text-sm text-muted-foreground">不满意推荐结果，免费重新生成</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiRecommend;