import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock } from 'lucide-react';
import { HighlightSchema } from '@/types/planning';

interface HighlightsProps {
  highlights: HighlightSchema[];
  className?: string;
}

export const HighlightsList: React.FC<HighlightsProps> = ({
  highlights,
  className = '',
}) => {
  if (!highlights || highlights.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Star className="w-5 h-5 text-yellow-500" />
        行程亮点
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        {highlights.map((highlight, index) => (
          <HighlightCard key={index} highlight={highlight} />
        ))}
      </div>
    </div>
  );
};

// 单个亮点卡片组件
interface HighlightCardProps {
  highlight: HighlightSchema;
}

export const HighlightCard: React.FC<HighlightCardProps> = ({ highlight }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader className="pb-3">
      <CardTitle className="text-base flex items-start justify-between">
        <span className="flex-grow">{highlight.name}</span>
        {highlight.best_visit_time && (
          <Badge variant="outline" className="ml-2 text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {highlight.best_visit_time}
          </Badge>
        )}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-gray-600 leading-relaxed">
        {highlight.description}
      </p>
    </CardContent>
  </Card>
);

// 紧凑型亮点展示组件（用于列表页面等空间有限的地方）
interface CompactHighlightsProps {
  highlights: HighlightSchema[];
  maxItems?: number;
}

export const CompactHighlights: React.FC<CompactHighlightsProps> = ({
  highlights,
  maxItems = 3,
}) => {
  if (!highlights || highlights.length === 0) {
    return null;
  }

  const displayHighlights = highlights.slice(0, maxItems);
  const hasMore = highlights.length > maxItems;

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700 flex items-center gap-1">
        <Star className="w-4 h-4 text-yellow-500" />
        亮点特色
      </div>
      <div className="space-y-1">
        {displayHighlights.map((highlight, index) => (
          <div
            key={index}
            className="text-sm text-gray-600 flex items-start gap-2"
          >
            <span className="text-yellow-500 text-xs mt-1">●</span>
            <span className="flex-grow">{highlight.name}</span>
          </div>
        ))}
        {hasMore && (
          <div className="text-xs text-gray-400">
            +{highlights.length - maxItems} 个更多亮点
          </div>
        )}
      </div>
    </div>
  );
};
