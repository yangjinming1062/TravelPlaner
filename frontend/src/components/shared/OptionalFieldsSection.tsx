import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings, Users } from 'lucide-react';
import { TRANSPORT_MODES } from '@/constants/planning';
import type { TransportMode } from '@/constants/planning';
import { cn } from '@/lib/utils';

export interface OptionalFieldsData {
  planTitle: string;
  groupSize: number;
  primaryTransport: TransportMode;
}

interface OptionalFieldsSectionProps {
  data: OptionalFieldsData;
  onDataChange: (data: OptionalFieldsData) => void;
  showTransport?: boolean;
  onGroupSizeChange?: (newSize: number) => void;
  className?: string;
}

export default function OptionalFieldsSection({
  data,
  onDataChange,
  showTransport = true,
  onGroupSizeChange,
  className,
}: OptionalFieldsSectionProps) {
  const updateData = (key: keyof OptionalFieldsData, value: any) => {
    if (key === 'groupSize' && onGroupSizeChange) {
      onGroupSizeChange(value);
    } else {
      onDataChange({ ...data, [key]: value });
    }
  };

  return (
    <Card className={cn('shadow-sm', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-700">
          <Settings className="w-5 h-5" />
          基本设置
          <span className="text-sm font-normal text-gray-500">
            (可选，系统会提供智能默认值)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 规划标题 */}
        <div>
          <Label htmlFor="plan-title" className="text-base font-medium">
            规划标题
          </Label>
          <Input
            id="plan-title"
            placeholder="请输入规划标题（可自动生成）"
            value={data.planTitle}
            onChange={(e) => updateData('planTitle', e.target.value)}
            className="mt-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            留空时系统将根据您的行程自动生成标题
          </p>
        </div>

        {/* 出行人数 */}
        <div>
          <Label
            htmlFor="group-size"
            className="text-base font-medium flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            出行人数
          </Label>
          <Input
            id="group-size"
            type="number"
            min="1"
            max="20"
            placeholder="请输入出行人数"
            value={data.groupSize}
            onChange={(e) =>
              updateData('groupSize', parseInt(e.target.value) || 1)
            }
            className="mt-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            系统会根据出行类型设置默认人数
          </p>
        </div>

        {/* 主要交通方式 */}
        {showTransport && (
          <div>
            <Label
              htmlFor="primary-transport"
              className="text-base font-medium"
            >
              主要交通方式
            </Label>
            <Select
              value={data.primaryTransport}
              onValueChange={(value) => updateData('primaryTransport', value)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="选择主要交通方式" />
              </SelectTrigger>
              <SelectContent>
                {TRANSPORT_MODES.map((transport) => (
                  <SelectItem key={transport.value} value={transport.value}>
                    {transport.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              用于路线规划，可以与偏好设置中的交通方式不同
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
