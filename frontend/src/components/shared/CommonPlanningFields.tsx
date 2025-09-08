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
import { DatePicker } from '@/components/ui/date-picker';
import { Calendar, MapPin } from 'lucide-react';
import { TRANSPORT_MODES } from '@/constants/planning';
import type { TransportMode } from '@/constants/planning';

export interface CommonPlanningData {
  planTitle: string;
  departureDate?: Date;
  returnDate?: Date;
  primaryTransport: TransportMode;
  groupSize: number;
}

interface CommonPlanningFieldsProps {
  data: CommonPlanningData;
  onDataChange: (data: CommonPlanningData) => void;
  showTransport?: boolean;
  onGroupSizeChange?: (newSize: number) => void;
}

export default function CommonPlanningFields({
  data,
  onDataChange,
  showTransport = true,
  onGroupSizeChange,
}: CommonPlanningFieldsProps) {
  const updateData = (key: keyof CommonPlanningData, value: any) => {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    if (key === 'groupSize' && onGroupSizeChange) {
      onGroupSizeChange(value);
    } else {
      onDataChange({ ...data, [key]: value });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          基本信息
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 规划标题 */}
        <div>
          <Label htmlFor="plan-title">规划标题</Label>
          <Input
            id="plan-title"
            placeholder="请输入规划标题（可自动生成）"
            value={data.planTitle}
            onChange={(e) => updateData('planTitle', e.target.value)}
            className="mt-2"
          />
        </div>

        {/* 日期选择 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="departure-date">出发日期 *</Label>
            <div className="mt-2">
              <DatePicker
                date={data.departureDate}
                onDateChange={(date) => updateData('departureDate', date)}
                placeholder="选择出发日期"
                className="w-full"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="return-date">返程日期 *</Label>
            <div className="mt-2">
              <DatePicker
                date={data.returnDate}
                onDateChange={(date) => updateData('returnDate', date)}
                placeholder="选择返程日期"
                className="w-full"
                disabled={!data.departureDate}
              />
            </div>
          </div>
        </div>

        {/* 出行人数 */}
        <div>
          <Label htmlFor="group-size">出行人数</Label>
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
        </div>

        {/* 主要交通方式 */}
        {showTransport && (
          <div>
            <Label htmlFor="primary-transport">主要交通方式</Label>
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
