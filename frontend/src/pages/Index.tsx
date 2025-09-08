import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Route,
  Network,
  Brain,
  User,
  History,
  LogIn,
} from 'lucide-react';
import { useUserProfile } from '@/hooks/use-api';
import heroImage from '@/assets/hero-travel.jpg';
import singleDestination from '@/assets/single-destination.jpg';
import routeTravel from '@/assets/route-travel.jpg';
import multiNode from '@/assets/multi-node.jpg';
import aiRecommend from '@/assets/ai-recommend.jpg';

const Index = () => {
  const navigate = useNavigate();
  const { data: userProfile } = useUserProfile();
  const isLoggedIn = !!localStorage.getItem('token');

  const planningModes = [
    {
      id: 'single',
      title: '单一目的地模式',
      description: '专注于单个目的地的深度游玩，提供目的地的景点推荐',
      icon: MapPin,
      image: singleDestination,
      gradient: 'bg-gradient-ocean',
      route: '/single/task',
    },
    {
      id: 'route',
      title: '沿途游玩模式',
      description: '侧重在目的地的游玩和推荐，同时发现并推荐沿途有价值的景点',
      icon: Route,
      image: routeTravel,
      gradient: 'bg-gradient-sunset',
      route: '/route/task',
    },
    {
      id: 'multi',
      title: '多节点模式',
      description:
        '设置先后达到的多个目的地，针对每个目的地的抵达和离开时间推荐游玩内容',
      icon: Network,
      image: multiNode,
      gradient: 'bg-gradient-nature',
      route: '/multi/task',
    },
    {
      id: 'ai',
      title: '智能推荐模式',
      description:
        '基于预算、时间、出行方式等参数由AI分析用户需求，推荐最适合的旅游目的地',
      icon: Brain,
      image: aiRecommend,
      gradient: 'bg-gradient-sky',
      route: '/smart/task',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-blue-600">智能旅游规划</h1>
            </div>

            <div className="flex items-center gap-2">
              {isLoggedIn ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/planning-history')}
                    className="hidden md:flex"
                  >
                    <History className="w-4 h-4 mr-2" />
                    规划历史
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/user-center')}
                  >
                    <User className="w-4 h-4 mr-2" />
                    {(userProfile as any)?.nickname ||
                      (userProfile as any)?.username ||
                      '用户中心'}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/login')}
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    登录
                  </Button>
                  <Button size="sm" onClick={() => navigate('/register')}>
                    注册
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

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
                onClick={() =>
                  document
                    .getElementById('planning-modes')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            选择你的规划模式
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            根据你的旅行需求，选择最合适的规划模式，开启完美的旅程
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {planningModes.map((mode, index) => {
            const IconComponent = mode.icon;

            const handleModeClick = () => {
              if (!isLoggedIn) {
                // 未登录用户点击后跳转到登录页面，并保存想要访问的页面
                navigate('/login', { state: { from: mode.route } });
              } else {
                navigate(mode.route);
              }
            };

            return (
              <Card
                key={mode.id}
                className={`group hover:shadow-travel transition-all duration-300 cursor-pointer border-0 overflow-hidden ${!isLoggedIn ? 'relative' : ''}`}
                onClick={handleModeClick}
              >
                <div
                  className={`h-48 ${mode.gradient} relative overflow-hidden`}
                >
                  <img
                    src={mode.image}
                    alt={mode.title}
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <IconComponent className="w-16 h-16 text-white drop-shadow-lg" />
                  </div>
                  {!isLoggedIn && (
                    <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      需要登录
                    </div>
                  )}
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
                      handleModeClick();
                    }}
                  >
                    {isLoggedIn ? '开始规划' : '登录后开始规划'}
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
              <p className="text-muted-foreground">
                基于大数据和AI算法，为你提供最优的旅行方案
              </p>
            </div>

            <div className="p-6">
              <div className="w-16 h-16 bg-gradient-nature rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">精准推荐</h3>
              <p className="text-muted-foreground">
                根据你的需求，推荐最适合的旅游目的地
              </p>
            </div>

            <div className="p-6">
              <div className="w-16 h-16 bg-gradient-sunset rounded-full flex items-center justify-center mx-auto mb-4">
                <Route className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">路线优化</h3>
              <p className="text-muted-foreground">
                智能优化行程路线，节省时间和成本
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
