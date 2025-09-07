import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { LogIn, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLogin } from "@/hooks/use-api";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { mutate: login, isPending } = useLogin();

  // 获取用户原本想要访问的页面
  const from = (location.state as any)?.from || "/";
  
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const handleLogin = () => {
    if (!formData.username || !formData.password) {
      toast({
        title: "信息不完整",
        description: "请输入用户名和密码",
        variant: "destructive",
      });
      return;
    }

    login({
      username: formData.username,
      password: formData.password
    }, {
      onSuccess: () => {
        toast({
          title: "登录成功",
          description: "欢迎回来！",
        });
        // 重定向到用户原本想要访问的页面
        navigate(from, { replace: true });
      },
      onError: (error: any) => {
        toast({
          title: "登录失败",
          description: error.message || "用户名或密码错误",
          variant: "destructive",
        });
      }
    });
  };

  const handleRegister = () => {
    navigate("/register");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-blue-600">
              智能旅游规划
            </CardTitle>
            <p className="text-gray-600">登录开始你的旅程</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                placeholder="请输入用户名"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                onKeyPress={handleKeyPress}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入密码"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                onKeyPress={handleKeyPress}
                className="mt-2"
              />
            </div>

            <Button 
              onClick={handleLogin} 
              className="w-full" 
              size="lg"
              disabled={isPending}
            >
              <LogIn className="w-4 h-4 mr-2" />
              {isPending ? "登录中..." : "登录"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">
                  还没有账号？
                </span>
              </div>
            </div>

            <Button onClick={handleRegister} variant="outline" className="w-full" size="lg">
              <UserPlus className="w-4 h-4 mr-2" />
              注册新账号
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
