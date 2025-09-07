import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Settings,
  History,
  LogOut,
  ArrowLeft,
  Bell,
  CreditCard,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile, usePlanningStats } from "@/hooks/use-api";

const UserCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: userInfo } = useUserProfile();
  const { data: planningStats } = usePlanningStats();

  const handleLogout = () => {
    // 清除本地存储的token
    localStorage.removeItem('token');
    toast({
      title: "退出登录",
      description: "您已成功退出登录",
    });
    navigate("/login");
  };

  const menuItems = [
    {
      icon: Settings,
      title: "偏好设置",
      description: "管理你的旅游偏好",
      path: "/preferences-setup",
      color: "text-blue-600"
    },
    {
      icon: History,
      title: "规划历史",
      description: "查看历史规划记录",
      path: "/planning-history",
      color: "text-green-600"
    },
    {
      icon: BarChart3,
      title: "统计报告",
      description: "查看你的旅行数据",
      path: "/planning-stats",
      color: "text-purple-600"
    },
    {
      icon: Bell,
      title: "消息通知",
      description: "查看系统消息",
      path: "#",
      color: "text-orange-600"
    },
    {
      icon: CreditCard,
      title: "会员服务",
      description: "升级会员享受更多功能",
      path: "#",
      color: "text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button onClick={() => navigate("/")} variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Button>
            <h1 className="text-2xl font-bold text-blue-600">个人中心</h1>
          </div>

          {/* User Info Card */}
          <Card className="mb-6 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="" />
                  <AvatarFallback>
                    <User className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{userInfo?.nickname || userInfo?.username || "旅行者"}</h2>
                  <p className="text-gray-500">{userInfo?.email || "未设置邮箱"}</p>
                  <p className="text-sm text-gray-400">{userInfo?.phone || ""}</p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {planningStats?.total_plans || 0}
                  </div>
                  <div className="text-sm text-gray-500">总规划数</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {planningStats?.favorited_plans || 0}
                  </div>
                  <div className="text-sm text-gray-500">收藏规划</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {Object.values(planningStats?.mode_distribution || {}).reduce((a, b) => a + b, 0) || 0}
                  </div>
                  <div className="text-sm text-gray-500">完成旅行</div>
                </div>
              </div>

              {/* 规划类型分布 */}
              {planningStats?.mode_distribution && (
                <>
                  <Separator className="my-4" />
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div>
                      <div className="font-medium text-blue-600">{planningStats.mode_distribution.single || 0}</div>
                      <div className="text-gray-500">单一目的地</div>
                    </div>
                    <div>
                      <div className="font-medium text-orange-600">{planningStats.mode_distribution.route || 0}</div>
                      <div className="text-gray-500">沿途游玩</div>
                    </div>
                    <div>
                      <div className="font-medium text-purple-600">{planningStats.mode_distribution.multi || 0}</div>
                      <div className="text-gray-500">多节点</div>
                    </div>
                    <div>
                      <div className="font-medium text-green-600">{planningStats.mode_distribution.smart || 0}</div>
                      <div className="text-gray-500">智能推荐</div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Menu Items */}
          <div className="grid gap-4 mb-6">
            {menuItems.map((item) => (
              <Card key={item.title} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <Link to={item.path} className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg bg-gray-100 ${item.color}`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <div className="text-gray-400">
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Logout */}
          <Card>
            <CardContent className="pt-6">
              <Button onClick={handleLogout} variant="outline" className="w-full text-red-600 hover:text-red-700 hover:border-red-300">
                <LogOut className="w-4 h-4 mr-2" />
                退出登录
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserCenterPage;
