import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { AlertCircle, Calendar, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RequiredFieldsData {
  departureDate?: Date;
  returnDate?: Date;
  // 单一目的地和智能推荐的字段
  startPoint?: string;
  destination?: string;
  // 沿途游玩的字段
  routeStartPoint?: string;
  routeEndPoint?: string;
  // 多节点的字段 - 暂时保留
}

interface RequiredFieldsSectionProps {
  data: RequiredFieldsData;
  onDataChange: (data: RequiredFieldsData) => void;
  mode: 'single' | 'route' | 'multi' | 'smart';
  className?: string;
}

const RequiredLabel = ({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) => (
  <Label
    htmlFor={htmlFor}
    className="text-base font-medium flex items-center gap-2"
  >
    <AlertCircle className="w-4 h-4 text-red-500" />
    {children}
    <span className="text-red-500 text-lg font-bold">*</span>
  </Label>
);

export default function RequiredFieldsSection({
  data,
  onDataChange,
  mode,
  className,
}: RequiredFieldsSectionProps) {
  const updateData = (key: keyof RequiredFieldsData, value: any) => {
    onDataChange({ ...data, [key]: value });
  };

  const renderLocationFields = () => {
    switch (mode) {
      case 'single':
        return (
          <>
            <div>
              <RequiredLabel htmlFor="start-point">出发地</RequiredLabel>
              <Input
                id="start-point"
                placeholder="输入出发城市"
                value={data.startPoint || ''}
                onChange={(e) => updateData('startPoint', e.target.value)}
                className="mt-2 border-red-200 focus:border-red-500"
              />
            </div>
            <div>
              <RequiredLabel htmlFor="destination">目的地</RequiredLabel>
              <Input
                id="destination"
                placeholder="输入你想去的城市或景点"
                value={data.destination || ''}
                onChange={(e) => updateData('destination', e.target.value)}
                className="mt-2 border-red-200 focus:border-red-500"
              />
            </div>
          </>
        );

      case 'route':
        return (
          <>
            <div>
              <RequiredLabel htmlFor="route-start">出发地</RequiredLabel>
              <Input
                id="route-start"
                placeholder="输入出发城市"
                value={data.routeStartPoint || ''}
                onChange={(e) => updateData('routeStartPoint', e.target.value)}
                className="mt-2 border-red-200 focus:border-red-500"
              />
            </div>
            <div>
              <RequiredLabel htmlFor="route-end">目的地</RequiredLabel>
              <Input
                id="route-end"
                placeholder="输入目的地城市"
                value={data.routeEndPoint || ''}
                onChange={(e) => updateData('routeEndPoint', e.target.value)}
                className="mt-2 border-red-200 focus:border-red-500"
              />
            </div>
          </>
        );

      case 'smart':
        return (
          <div>
            <RequiredLabel htmlFor="smart-start">出发地</RequiredLabel>
            <Input
              id="smart-start"
              placeholder="输入出发城市"
              value={data.startPoint || ''}
              onChange={(e) => updateData('startPoint', e.target.value)}
              className="mt-2 border-red-200 focus:border-red-500"
            />
          </div>
        );

      case 'multi':
        // 多节点模式不需要在这里设置地点，因为地点在节点设置中管理
        return null;

      default:
        return null;
    }
  };

  return (
    <Card className={cn('shadow-sm border-red-100', className)}>
      <CardHeader className="bg-red-50/50">
        <CardTitle className="flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          必填信息
          <span className="text-sm font-normal text-red-600">
            (请完成以下必填项目)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {/* 地点信息 */}
        {renderLocationFields() && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-gray-700">
                地点信息
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderLocationFields()}
            </div>
          </div>
        )}

        {/* 日期信息 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-gray-700">行程日期</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <RequiredLabel htmlFor="departure-date">出发日期</RequiredLabel>
              <div className="mt-2">
                <DatePicker
                  date={data.departureDate}
                  onDateChange={(date) => updateData('departureDate', date)}
                  placeholder="选择出发日期"
                  className="w-full border-red-200 focus:border-red-500"
                />
              </div>
            </div>
            <div>
              <RequiredLabel htmlFor="return-date">返程日期</RequiredLabel>
              <div className="mt-2">
                <DatePicker
                  date={data.returnDate}
                  onDateChange={(date) => updateData('returnDate', date)}
                  placeholder="选择返程日期"
                  className="w-full border-red-200 focus:border-red-500"
                  disabled={!data.departureDate}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
