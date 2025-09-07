import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MapPin, Route, Network, Brain } from "lucide-react";
import heroImage from "@/assets/hero-travel.jpg";
import singleDestination from "@/assets/single-destination.jpg";
import routeTravel from "@/assets/route-travel.jpg";
import multiNode from "@/assets/multi-node.jpg";
import aiRecommend from "@/assets/ai-recommend.jpg";

const Index = () => {
  const navigate = useNavigate();

  const planningModes = [
    {
      id: "single",
      title: "单一目的地模式",
      description: "专注于单个目的地的深度游玩，提供目的地内部景点推荐，优化住宿位置和行程安排",
      icon: MapPin,
      image: singleDestination,
      gradient: "bg-gradient-ocean",
      route: "/single/task"
    },
    {
      id: "route",
      title: "沿途游玩模式", 
      description: "规划从出发地到目的地的最优路线，发现并推荐沿途有价值的景点，平衡路程时间和游玩体验",
      icon: Route,
      image: routeTravel,
      gradient: "bg-gradient-sunset",
      route: "/route/task"
    },
    {
      id: "multi",
      title: "多节点模式",
      description: "支持多个中转城市的复杂行程，精确控制每个节点的到达和停留时间，优化整体路线和交通安排",
      icon: Network,
      image: multiNode,
      gradient: "bg-gradient-nature",
      route: "/multi/task"
    },
    {
      id: "ai",
      title: "智能推荐模式",
      description: "基于预算、时间、出行方式的智能目的地推荐，AI分析用户需求，推荐最适合的旅游目的地，提供完整的目的地规划方案",
      icon: Brain,
      image: aiRecommend,
      gradient: "bg-gradient-sky",
      route: "/smart/task"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="h-[60vh] bg-cover bg-center bg-no-repeat relative"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40" />
          <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
            <div className="max-w-2xl text-white">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                智能旅游规划
                <span className="block text-primary-glow">让旅行更美好</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-white/90">
                四种专业规划模式，为你量身定制完美的旅行方案
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white/90 text-primary hover:bg-white shadow-glow"
                onClick={() => document.getElementById('planning-modes')?.scrollIntoView({ behavior: 'smooth' })}
              >
                开始规划旅程
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Planning Modes Section */}
      <section id="planning-modes" className="py-20 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">选择你的规划模式</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            根据你的旅行需求，选择最合适的规划模式，开启完美的旅程
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {planningModes.map((mode, index) => {
            const IconComponent = mode.icon;
            
            return (
              <Card 
                key={mode.id} 
                className="group hover:shadow-travel transition-all duration-300 cursor-pointer border-0 overflow-hidden"
                onClick={() => navigate(mode.route)}
              >
                <div className={`h-48 ${mode.gradient} relative overflow-hidden`}>
                  <img 
                    src={mode.image} 
                    alt={mode.title}
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <IconComponent className="w-16 h-16 text-white drop-shadow-lg" />
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {mode.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <CardDescription className="text-base mb-6 leading-relaxed">
                    {mode.description}
                  </CardDescription>
                  
                  <Button 
                    className="w-full group-hover:shadow-soft transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(mode.route);
                    }}
                  >
                    开始规划
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-16">为什么选择我们</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="p-6">
              <div className="w-16 h-16 bg-gradient-ocean rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">智能算法</h3>
              <p className="text-muted-foreground">基于大数据和AI算法，为你提供最优的旅行方案</p>
            </div>
            
            <div className="p-6">
              <div className="w-16 h-16 bg-gradient-nature rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">精准定位</h3>
              <p className="text-muted-foreground">精确的地理位置服务，不错过任何美景</p>
            </div>
            
            <div className="p-6">
              <div className="w-16 h-16 bg-gradient-sunset rounded-full flex items-center justify-center mx-auto mb-4">
                <Route className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">路线优化</h3>
              <p className="text-muted-foreground">智能优化行程路线，节省时间和成本</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;