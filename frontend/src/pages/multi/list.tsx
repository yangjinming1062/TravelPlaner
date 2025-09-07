import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Search, MapPin } from "lucide-react";

const MultiListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-6">
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
              <h1 className="text-2xl font-bold">多节点规划</h1>
              <p className="text-white/90">管理您的多节点旅行规划</p>
            </div>
          </div>
          <Button variant="secondary" onClick={() => navigate('/multi/task')}>
            <Plus className="w-4 h-4 mr-2" />
            新建规划
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
                placeholder="搜索规划标题或节点..."
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
            <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">暂无多节点规划</h3>
            <p className="text-gray-500 mb-6">开始创建您的第一个多节点旅行规划吧！</p>
            <Button onClick={() => navigate('/multi/task')}>
              <Plus className="w-4 h-4 mr-2" />
              创建新规划
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MultiListPage;
