import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRegister } from '@/hooks/use-api';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutate: register, isPending } = useRegister();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleRegister = () => {
    // 表单验证
    if (!formData.username || !formData.phone || !formData.password) {
      toast({
        title: '信息不完整',
        description: '请填写所有必填字段',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: '密码不匹配',
        description: '两次输入的密码不一致',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: '密码过短',
        description: '密码至少需要6位字符',
        variant: 'destructive',
      });
      return;
    }

    register(
      {
        username: formData.username,
        password: formData.password,
        phone: formData.phone,
        email: formData.email || undefined,
      },
      {
        onSuccess: () => {
          toast({
            title: '注册成功',
            description: '欢迎加入智能旅游规划！',
          });
          // 注册成功后跳转到偏好设置页面
          navigate('/preferences-setup');
        },
        onError: (error: any) => {
          toast({
            title: '注册失败',
            description: error.message || '注册过程中出现错误，请稍后重试',
            variant: 'destructive',
          });
        },
      },
    );
  };

  const handleBack = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-blue-600">
              注册账号
            </CardTitle>
            <p className="text-gray-600">创建你的专属旅游规划账号</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="username">用户名 *</Label>
              <Input
                id="username"
                placeholder="请输入用户名"
                value={formData.username}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, username: e.target.value }))
                }
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="phone">手机号 *</Label>
              <Input
                id="phone"
                placeholder="请输入手机号"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="请输入邮箱地址（可选）"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="password">密码 *</Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入密码（至少6位）"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">确认密码 *</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                className="mt-2"
              />
            </div>

            <Button
              onClick={handleRegister}
              className="w-full"
              size="lg"
              disabled={isPending}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {isPending ? '注册中...' : '注册'}
            </Button>

            <Button onClick={handleBack} variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回登录
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
