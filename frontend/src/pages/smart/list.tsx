import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Search, Sparkles } from "lucide-react";

const SmartListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-to-r from-green-500 to-teal-500 text-white py-6">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
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
              <p className="text-white/90">管理您的AI智能推荐历史</p>
            </div>
          </div>
          <Button variant="secondary" onClick={() => navigate('/smart/task')}>
            <Plus className="w-4 h-4 mr-2" />
            新建推荐
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">搜索和筛选</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="搜索推荐标题或目的地..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button>
                <Search className="w-4 h-4 mr-2" />
                搜索
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="text-center py-12">
          <CardContent>
            <Sparkles className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">暂无智能推荐记录</h3>
            <p className="text-gray-500 mb-6">让AI为您推荐最适合的旅游目的地吧！</p>
            <Button onClick={() => navigate('/smart/task')}>
              <Plus className="w-4 h-4 mr-2" />
              获取AI推荐
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SmartListPage;
