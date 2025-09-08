import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Calendar, Clock, ArrowRight } from 'lucide-react';
import { NodeScheduleDetailSchema, NodeScheduleSchema } from '@/types/planning';
import { DailyPlanCard } from './DailyPlan';

interface NodeScheduleListProps {
  nodesDetails: NodeScheduleDetailSchema[];
  className?: string;
}

export const NodeScheduleList: React.FC<NodeScheduleListProps> = ({
  nodesDetails,
  className = '',
}) => {
  if (!nodesDetails || nodesDetails.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-purple-500" />
        节点详细安排
        <Badge variant="outline">{nodesDetails.length}个节点</Badge>
      </h3>
      <div className="space-y-6">
        {nodesDetails.map((node, index) => (
          <NodeScheduleCard
            key={index}
            node={node}
            nodeIndex={index + 1}
            isLast={index === nodesDetails.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

// 单个节点卡片组件
interface NodeScheduleCardProps {
  node: NodeScheduleDetailSchema;
  nodeIndex: number;
  isLast?: boolean;
}

export const NodeScheduleCard: React.FC<NodeScheduleCardProps> = ({
  node,
  nodeIndex,
  isLast = false,
}) => (
  <div className="relative">
    <Card className="relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>
      <CardHeader className="bg-purple-50 border-b border-purple-100">
        <CardTitle className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">
            {nodeIndex}
          </div>
          <div className="flex-grow">
            <h4 className="text-lg">{node.location}</h4>
            <div className="text-sm text-purple-600 mt-1">
              节点 {nodeIndex} · {node.daily_plan.length} 天行程
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {node.daily_plan.length > 0 ? (
          <div className="space-y-4">
            {node.daily_plan.map((dailyPlan, dayIndex) => (
              <DailyPlanCard
                key={dayIndex}
                dailyPlan={dailyPlan}
                showRouteInfo={false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <div>暂无详细行程安排</div>
          </div>
        )}
      </CardContent>
    </Card>

    {/* 节点间连接线和箭头 */}
    {!isLast && (
      <div className="flex justify-center py-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
          <ArrowRight className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-600">下一节点</span>
        </div>
      </div>
    )}
  </div>
);

// 节点时间安排组件（用于任务创建页面）
interface NodeScheduleInputProps {
  nodes: NodeScheduleSchema[];
  onNodesChange?: (nodes: NodeScheduleSchema[]) => void;
  readonly?: boolean;
}

export const NodeScheduleInput: React.FC<NodeScheduleInputProps> = ({
  nodes,
  onNodesChange,
  readonly = false,
}) => {
  const handleNodeChange = (index: number, updatedNode: NodeScheduleSchema) => {
    if (onNodesChange) {
      const newNodes = [...nodes];
      newNodes[index] = updatedNode;
      onNodesChange(newNodes);
    }
  };

  const handleAddNode = () => {
    if (onNodesChange) {
      const newNode: NodeScheduleSchema = {
        location: '',
        arrival_date: '',
        departure_date: '',
      };
      onNodesChange([...nodes, newNode]);
    }
  };

  const handleRemoveNode = (index: number) => {
    if (onNodesChange && nodes.length > 1) {
      const newNodes = nodes.filter((_, i) => i !== index);
      onNodesChange(newNodes);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium flex items-center gap-2">
          <MapPin className="w-4 h-4 text-purple-500" />
          节点安排
        </h4>
        {!readonly && (
          <button
            type="button"
            onClick={handleAddNode}
            className="text-sm text-purple-600 hover:text-purple-700"
          >
            + 添加节点
          </button>
        )}
      </div>

      {nodes.map((node, index) => (
        <Card key={index} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <span className="font-medium">节点 {index + 1}</span>
              </div>
              {!readonly && nodes.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveNode(index)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  移除
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                地点名称
              </label>
              {readonly ? (
                <div className="text-sm">{node.location}</div>
              ) : (
                <input
                  type="text"
                  value={node.location}
                  onChange={(e) =>
                    handleNodeChange(index, {
                      ...node,
                      location: e.target.value,
                    })
                  }
                  placeholder="请输入地点名称"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  到达日期
                </label>
                {readonly ? (
                  <div className="text-sm flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {node.arrival_date}
                  </div>
                ) : (
                  <input
                    type="date"
                    value={node.arrival_date}
                    onChange={(e) =>
                      handleNodeChange(index, {
                        ...node,
                        arrival_date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  离开日期
                </label>
                {readonly ? (
                  <div className="text-sm flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {node.departure_date}
                  </div>
                ) : (
                  <input
                    type="date"
                    value={node.departure_date}
                    onChange={(e) =>
                      handleNodeChange(index, {
                        ...node,
                        departure_date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                )}
              </div>
            </div>

            {readonly && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                停留时间:{' '}
                {(() => {
                  const arrival = new Date(node.arrival_date);
                  const departure = new Date(node.departure_date);
                  const diffTime = Math.abs(
                    departure.getTime() - arrival.getTime(),
                  );
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return `${diffDays} 天`;
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
