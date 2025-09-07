import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft,
  Search,
  Calendar,
  MapPin,
  Star,
  Eye,
  Filter,
  Heart,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  useSinglePlansList, 
  useRoutePlansList, 
  useMultiPlansList, 
  useSmartPlansList,
  useUpdatePlanFavorite
} from "@/hooks/use-api";

interface PlanRecord {
  id: string;
  title: string;
  type: "single" | "route" | "multi" | "smart";
  destination: string;
  source: string;
  departureDate: string;
  returnDate: string;
  status: "completed" | "processing" | "pending" | "failed";
  is_favorite?: boolean;
  created_at: string;
  group_size: number;
  transport_mode: string;
}

const PlanningHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // 从URL参数初始化筛选条件
  const initialType = searchParams.get('type') || "all";
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState(initialType);
  const [filterStatus, setFilterStatus] = useState("all");
  const [allPlans, setAllPlans] = useState<PlanRecord[]>([]);

  const { mutate: updateFavorite } = useUpdatePlanFavorite();

  // 查询各种类型的规划列表
  const singlePlansQuery = useSinglePlansList({ page: 0, size: 100 });
  const routePlansQuery = useRoutePlansList({ page: 0, size: 100 });
  const multiPlansQuery = useMultiPlansList({ page: 0, size: 100 });
  const smartPlansQuery = useSmartPlansList({ page: 0, size: 100 });

  // 监听URL参数变化
  useEffect(() => {
    const typeParam = searchParams.get('type') || "all";
    if (typeParam !== filterType) {
      setFilterType(typeParam);
    }
  }, [searchParams]);

  // 合并所有规划数据
  useEffect(() => {
    const plans: PlanRecord[] = [];

    // 单一目的地规划
    if (singlePlansQuery.data?.data) {
      const singleData = singlePlansQuery.data as any;
      plans.push(...singleData.data.map((plan: any) => ({
        ...plan,
        type: "single" as const,
        destination: plan.target || "未知目的地"
      })));
    }

    // 沿途游玩规划  
    if (routePlansQuery.data?.data) {
      const routeData = routePlansQuery.data as any;
      plans.push(...routeData.data.map((plan: any) => ({
        ...plan,
        type: "route" as const,
        destination: plan.target || "未知目的地"
      })));
    }

    // 多节点规划
    if (multiPlansQuery.data?.data) {
      const multiData = multiPlansQuery.data as any;
      plans.push(...multiData.data.map((plan: any) => ({
        ...plan,
        type: "multi" as const,
        destination: "多个节点"
      })));
    }

    // 智能推荐规划
    if (smartPlansQuery.data?.data) {
      const smartData = smartPlansQuery.data as any;
      plans.push(...smartData.data.map((plan: any) => ({
        ...plan,
        type: "smart" as const,
        destination: plan.destination || "AI推荐目的地"
      })));
    }

    // 按创建时间排序
    plans.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setAllPlans(plans);
  }, [singlePlansQuery.data, routePlansQuery.data, multiPlansQuery.data, smartPlansQuery.data]);

  const getTypeText = (type: string) => {
    const typeMap = {
      single: "单一目的地",
      route: "沿途游玩",
      multi: "多节点",
      smart: "智能推荐"
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      completed: "已完成",
      processing: "处理中",
      pending: "待处理",
      failed: "失败"
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusVariant = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    const variantMap: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      completed: "default",
      processing: "secondary",
      pending: "outline",
      failed: "destructive"
    };
    return variantMap[status] || "outline";
  };

  const handleViewDetails = (plan: PlanRecord) => {
    const path = `/${plan.type}/result/${plan.id}`;
    navigate(path);
  };

  const handleToggleFavorite = (plan: PlanRecord) => {
    updateFavorite({
      taskType: plan.type,
      taskId: plan.id,
      data: { is_favorite: !plan.is_favorite }
    }, {
      onSuccess: () => {
        toast({
          title: plan.is_favorite ? "已取消收藏" : "已添加收藏",
        });
        // 重新获取数据
        singlePlansQuery.refetch();
        routePlansQuery.refetch();
        multiPlansQuery.refetch();
        smartPlansQuery.refetch();
      },
      onError: (error: any) => {
        toast({
          title: "操作失败",
          description: error.message || "无法更新收藏状态",
          variant: "destructive",
        });
      }
    });
  };

  const filteredRecords = allPlans.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || record.type === filterType;
    const matchesStatus = filterStatus === "all" || record.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const isLoading = singlePlansQuery.isLoading || routePlansQuery.isLoading || 
                   multiPlansQuery.isLoading || smartPlansQuery.isLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button onClick={() => navigate("/")} variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回首页
              </Button>
              <h1 className="text-2xl font-bold text-blue-600">
                {filterType === "all" ? "规划历史" : `${getTypeText(filterType)}规划历史`}
              </h1>
            </div>
            
            {filterType !== "all" && (
              <Button 
                onClick={() => navigate(`/${filterType}/task`)}
                className="flex items-center gap-2"
              >
                <Heart className="w-4 h-4" />
                创建新的{getTypeText(filterType)}规划
              </Button>
            )}
          </div>

          {/* Filters */}
          <Card className="mb-6 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="搜索规划标题、目的地或出发地..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterType} onValueChange={(value) => {
                  setFilterType(value);
                  // 更新URL参数
                  const newParams = new URLSearchParams(searchParams);
                  if (value === "all") {
                    newParams.delete('type');
                  } else {
                    newParams.set('type', value);
                  }
                  setSearchParams(newParams, { replace: true });
                }}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="规划类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类型</SelectItem>
                    <SelectItem value="single">单一目的地</SelectItem>
                    <SelectItem value="route">沿途游玩</SelectItem>
                    <SelectItem value="multi">多节点</SelectItem>
                    <SelectItem value="smart">智能推荐</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="completed">已完成</SelectItem>
                    <SelectItem value="processing">处理中</SelectItem>
                    <SelectItem value="pending">待处理</SelectItem>
                    <SelectItem value="failed">失败</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <Card>
              <CardContent className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                <p className="text-gray-500">加载规划历史中...</p>
              </CardContent>
            </Card>
          )}

          {/* Records List */}
          {!isLoading && (
            <div className="grid gap-4">
              {filteredRecords.map((record) => (
                <Card key={`${record.type}-${record.id}`} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{record.title || `${getTypeText(record.type)}规划`}</h3>
                          <Badge variant={getStatusVariant(record.status)}>
                            {getStatusText(record.status)}
                          </Badge>
                          <Badge variant="outline">{getTypeText(record.type)}</Badge>
                          {record.is_favorite && (
                            <Badge variant="secondary" className="text-red-600">
                              <Heart className="w-3 h-3 mr-1 fill-current" />
                              收藏
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {record.source} → {record.destination}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(record.departureDate).toLocaleDateString()} - {new Date(record.returnDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-400">
                            创建于 {new Date(record.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleFavorite(record)}
                          className={record.is_favorite ? "text-red-600 hover:text-red-700" : "text-gray-400 hover:text-red-500"}
                        >
                          <Heart className={`w-4 h-4 ${record.is_favorite ? 'fill-current' : ''}`} />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(record)}>
                          <Eye className="w-4 h-4 mr-2" />
                          查看详情
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && filteredRecords.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-gray-500">
                  <Filter className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">没有找到符合条件的规划记录</p>
                  <p className="text-sm">尝试调整搜索条件或创建新的规划</p>
                </div>
                <div className="mt-6">
                  <Button onClick={() => navigate("/")} className="mr-2">
                    创建新规划
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setSearchTerm("");
                    setFilterType("all");
                    setFilterStatus("all");
                  }}>
                    清除筛选
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanningHistoryPage;
