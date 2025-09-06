import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Heart, 
  HeartOff,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRoutePlanResult, useUpdatePlanFavorite } from "@/hooks/use-api";

const RoutePlanningResult = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: planResult, isLoading, isError, error } = useRoutePlanResult(taskId || "");
  const { mutate: updateFavorite } = useUpdatePlanFavorite();
  
  const [isFavorite, setIsFavorite] = useState(false);
  
  useEffect(() => {
    if (planResult) {
      setIsFavorite(planResult.is_favorite);
    }
  }, [planResult]);

  const handleFavoriteToggle = () => {
    if (!taskId) return;
    
    updateFavorite(
      { taskType: "route", taskId, data: { is_favorite: !isFavorite } },
      {
        onSuccess: () => {
          setIsFavorite(!isFavorite);
          toast({
            title: !isFavorite ? "已添加到收藏" : "已取消收藏",
          });
        },
        onError: (error) => {
          toast({
            title: "操作失败",
            description: error.message || "无法更新收藏状态，请稍后重试。",
            variant: "destructive",
          });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-lg">正在生成您的旅行计划...</p>
          <p className="text-muted-foreground">这可能需要一些时间</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto text-destructive" />
          <h2 className="text-2xl font-bold mt-4">获取规划结果失败</h2>
          <p className="mt-2 text-muted-foreground">
            {error?.message || "无法获取旅行计划，请稍后重试。"}
          </p>
          <Button 
            className="mt-6" 
            onClick={() => navigate(-1)}
          >
            返回上一页
          </Button>
        </div>
      </div>
    );
  }

  if (!planResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">未找到规划结果</h2>
          <p className="mt-2 text-muted-foreground">
            该旅行计划可能仍在生成中或已被删除。
          </p>
          <Button 
            className="mt-6" 
            onClick={() => navigate(-1)}
          >
            返回上一页
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-sunset text-white py-6">
        <div className="container mx-auto px-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-white hover:bg-white/20"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{planResult.plan_title}</h1>
            <p className="text-white/90">{planResult.plan_description}</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-white hover:bg-white/20"
            onClick={handleFavoriteToggle}
          >
            {isFavorite ? (
              <Heart className="w-5 h-5 fill-white" />
            ) : (
              <HeartOff className="w-5 h-5" />
            )}
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* 基本信息卡片 */}
        <Card className="mb-8 shadow-travel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-accent" />
              规划概览
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{planResult.total_days} 天</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>¥{planResult.estimated_budget}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>1 人出行</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className={`w-4 h-4 ${isFavorite ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                <span>{isFavorite ? "已收藏" : "未收藏"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 途经点列表 */}
        {planResult.waypoints.length > 0 && (
          <Card className="mb-8 shadow-travel">
            <CardHeader>
              <CardTitle>途经点推荐</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {planResult.waypoints.map((waypoint, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="font-semibold">{waypoint.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{waypoint.description}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-primary">预计游览时间: {waypoint.estimated_visit_time}</span>
                      {waypoint.rating && (
                        <Badge variant="secondary">{waypoint.rating} 分</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 详细路线信息 */}
        {planResult.route_plan.length > 0 && (
          <Card className="mb-8 shadow-travel">
            <CardHeader>
              <CardTitle>详细路线信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {planResult.route_plan.map((route, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">
                        {route.from_location} → {route.to_location}
                      </h3>
                      <Badge variant="outline">{route.transport_type}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{route.estimated_time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{route.total_distance} km</span>
                      </div>
                      {route.cost && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">¥{route.cost}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{route.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 每日行程 */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">每日行程安排</h2>
          {planResult.daily_plan.map((day, index) => (
            <Card key={index} className="shadow-travel">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>第 {index + 1} 天</span>
                  <Badge variant="secondary">{day.date}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* 住宿信息 */}
                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <h3 className="font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 bg-accent rounded-full"></span>
                    住宿安排
                  </h3>
                  <div className="mt-2 ml-4">
                    <p className="font-medium">{day.accommodation.name}</p>
                    <p className="text-sm text-muted-foreground">{day.accommodation.type} | {day.accommodation.price_range}</p>
                    {day.accommodation.description && (
                      <p className="text-sm mt-1">{day.accommodation.description}</p>
                    )}
                  </div>
                </div>

                <Separator className="my-4" />

                {/* 活动安排 */}
                <div>
                  <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 bg-accent rounded-full"></span>
                    活动安排
                  </h3>
                  <div className="space-y-3">
                    {day.activities.map((activity, activityIndex) => (
                      <div key={activityIndex} className="flex items-start gap-3">
                        <div className="mt-1 w-2 h-2 bg-accent rounded-full flex-shrink-0"></div>
                        <div>
                          <p className="font-medium">{activity.time} - {activity.name}</p>
                          {activity.location && (
                            <p className="text-sm text-muted-foreground">{activity.location}</p>
                          )}
                          {activity.description && (
                            <p className="text-sm mt-1">{activity.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 路线规划 */}
                {day.route_plan && day.route_plan.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <h3 className="font-semibold flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 bg-accent rounded-full"></span>
                        路线规划
                      </h3>
                      <div className="space-y-3">
                        {day.route_plan.map((route, routeIndex) => (
                          <div key={routeIndex} className="flex items-start gap-3">
                            <div className="mt-1 w-2 h-2 bg-accent rounded-full flex-shrink-0"></div>
                            <div>
                              <p className="font-medium">
                                {route.from_location} → {route.to_location}
                              </p>
                              <div className="text-sm text-muted-foreground mt-1">
                                <p>{route.transport_type} | 预计时间: {route.estimated_time}</p>
                                <p>距离: {route.total_distance} km</p>
                                {route.cost && <p>费用: ¥{route.cost}</p>}
                              </div>
                              {route.description && (
                                <p className="text-sm mt-1">{route.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* 备注 */}
                {day.notes && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        <span className="w-2 h-2 bg-accent rounded-full"></span>
                        备注
                      </h3>
                      <p className="text-sm mt-2 ml-4">{day.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoutePlanningResult;