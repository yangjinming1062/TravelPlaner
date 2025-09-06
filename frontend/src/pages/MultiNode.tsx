import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Network, MapPin, Calendar, Plus, Trash2, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DatePicker } from "@/components/ui/date-picker";
import PreferencesSection, { type TravelPreferences } from "@/components/shared/PreferencesSection";
import CommonPlanningFields, { type CommonPlanningData } from "@/components/shared/CommonPlanningFields";

interface NodeInfo {
  id: string;
  city: string;
  arrivalDate?: Date;
  departureDate?: Date;
  order: number;
}

const MultiNode = () => {
  const navigate = useNavigate();
  
  // 基础规划信息
  const [commonData, setCommonData] = useState<CommonPlanningData>({
    planTitle: "",
    departureDate: undefined,
    returnDate: undefined,
    primaryTransport: "",
  });

  // 多节点特有信息
  const [startPoint, setStartPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");
  const [routeOptimization, setRouteOptimization] = useState("");
  
  const [nodes, setNodes] = useState<NodeInfo[]>([
    { id: "1", city: "", arrivalDate: undefined, departureDate: undefined, order: 1 }
  ]);

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

  const addNode = () => {
    const newNode: NodeInfo = {
      id: Date.now().toString(),
      city: "",
      arrivalDate: undefined,
      departureDate: undefined,
      order: nodes.length + 1
    };
    setNodes([...nodes, newNode]);
  };

  const removeNode = (id: string) => {
    if (nodes.length > 1) {
      const updatedNodes = nodes.filter(node => node.id !== id);
      // 重新排序
      updatedNodes.forEach((node, index) => {
        node.order = index + 1;
      });
      setNodes(updatedNodes);
    }
  };

  const updateNode = (id: string, field: keyof NodeInfo, value: any) => {
    setNodes(nodes.map(node => 
      node.id === id ? { ...node, [field]: value } : node
    ));
  };

  const handlePlanGenerate = () => {
    const planData = {
      type: "multi-node",
      common: commonData,
      specific: { 
        startPoint, 
        endPoint, 
        routeOptimization,
        nodes: nodes.filter(node => node.city.trim() !== "")
      },
      preferences
    };
    console.log("生成多节点规划:", planData);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-nature text-white py-6">
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
            <h1 className="text-2xl font-bold">多节点模式</h1>
            <p className="text-white/90">精确控制复杂行程的每个节点</p>
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

            {/* 多节点规划信息 */}
            <Card className="shadow-travel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="w-5 h-5 text-secondary" />
                  多节点路线信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startPoint">起点城市</Label>
                    <Input
                      id="startPoint"
                      placeholder="输入起点城市"
                      value={startPoint}
                      onChange={(e) => setStartPoint(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endPoint">终点城市</Label>
                    <Input
                      id="endPoint"
                      placeholder="输入终点城市"
                      value={endPoint}
                      onChange={(e) => setEndPoint(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="route-optimization">路线优化偏好</Label>
                  <Select value={routeOptimization} onValueChange={setRouteOptimization}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="选择路线优化偏好" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="speed">速度优先</SelectItem>
                      <SelectItem value="scenery">风景优先</SelectItem>
                      <SelectItem value="economy">经济优先</SelectItem>
                      <SelectItem value="balanced">平衡</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 节点信息 */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-base font-medium">中转节点安排</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addNode}
                      className="flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      添加节点
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {nodes.map((node, index) => (
                      <div key={node.id} className="border rounded-lg p-4 bg-muted/30">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">节点 {node.order}</h4>
                          {nodes.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeNode(node.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`city-${node.id}`}>城市名称</Label>
                            <Input
                              id={`city-${node.id}`}
                              placeholder="输入城市名称"
                              value={node.city}
                              onChange={(e) => updateNode(node.id, "city", e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`arrival-${node.id}`}>到达日期</Label>
                            <div className="mt-1">
                              <DatePicker
                                date={node.arrivalDate}
                                onDateChange={(date) => updateNode(node.id, "arrivalDate", date)}
                                placeholder="选择到达日期"
                                className="w-full"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor={`departure-${node.id}`}>离开日期</Label>
                            <div className="mt-1">
                              <DatePicker
                                date={node.departureDate}
                                onDateChange={(date) => updateNode(node.id, "departureDate", date)}
                                placeholder="选择离开日期"
                                disabled={!node.arrivalDate}
                                className="w-full"
                              />
                            </div>
                          </div>
                        </div>
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
              disabled={!startPoint || !endPoint || !commonData.departureDate || nodes.every(node => !node.city.trim())}
            >
              <Send className="w-4 h-4 mr-2" />
              生成多节点行程
            </Button>
          </div>

          {/* Right Column: Features */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>模式特点</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">精确控制</h4>
                    <p className="text-sm text-muted-foreground">精确控制每个节点的到达时间和停留天数</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">复杂行程</h4>
                    <p className="text-sm text-muted-foreground">支持多个中转城市的复杂旅行安排</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">路线优化</h4>
                    <p className="text-sm text-muted-foreground">优化整体路线和交通安排，降低成本</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">灵活调整</h4>
                    <p className="text-sm text-muted-foreground">可随时调整节点顺序和停留时间</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-success/5 to-success/10">
              <CardHeader>
                <CardTitle>包含服务</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">节点排序</Badge>
                  <Badge variant="secondary">交通方案</Badge>
                  <Badge variant="secondary">住宿预订</Badge>
                  <Badge variant="secondary">时间管理</Badge>
                  <Badge variant="secondary">费用分配</Badge>
                  <Badge variant="secondary">景点推荐</Badge>
                  <Badge variant="secondary">应急预案</Badge>
                  <Badge variant="secondary">实时调整</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-success/20">
              <CardHeader>
                <CardTitle className="text-success">适用人群</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-success rounded-full" />
                    商务差旅人士
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-success rounded-full" />
                    长期旅行计划
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-success rounded-full" />
                    多城市深度游
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-success rounded-full" />
                    团队组织出行
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

export default MultiNode;