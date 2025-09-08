import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Settings2, ChevronDown, ChevronUp, Info } from 'lucide-react';
import {
  TRANSPORT_MODES,
  ACCOMMODATION_LEVELS,
  ACTIVITY_PREFERENCES,
  ATTRACTION_CATEGORIES,
  TRAVEL_STYLES,
  BUDGET_PREFERENCES,
  GROUP_TRAVEL_PREFERENCES,
} from '@/constants/planning';
import type {
  TransportMode,
  AccommodationLevel,
  ActivityPreference,
  AttractionCategory,
  TravelStyle,
  BudgetPreference,
  GroupTravelPreference,
} from '@/constants/planning';
import { cn } from '@/lib/utils';

export interface TravelPreferences {
  transportMethods: TransportMode[];
  accommodationLevels: AccommodationLevel[];
  activityTypes: ActivityPreference[];
  scenicTypes: AttractionCategory[];
  travelStyle: TravelStyle;
  budgetType: BudgetPreference;
  budgetRange?: string;
  dietaryRestrictions: string;
  travelType: GroupTravelPreference;
  specialRequirements: string;
}

interface CollapsiblePreferencesSectionProps {
  preferences: TravelPreferences;
  onPreferencesChange: (preferences: TravelPreferences) => void;
  onTravelTypeChange?: (travelType: GroupTravelPreference) => void;
  className?: string;
}

export default function CollapsiblePreferencesSection({
  preferences,
  onPreferencesChange,
  onTravelTypeChange,
  className,
}: CollapsiblePreferencesSectionProps) {
  // 智能判断是否应该默认展开
  const hasUserPreferences = () => {
    return (
      preferences.transportMethods.length > 0 ||
      preferences.accommodationLevels.length > 0 ||
      preferences.activityTypes.length > 0 ||
      preferences.scenicTypes.length > 0 ||
      preferences.travelStyle !== '平衡型' ||
      preferences.budgetType !== '性价比优先' ||
      preferences.dietaryRestrictions.trim() !== '' ||
      preferences.travelType !== '朋友' ||
      preferences.specialRequirements.trim() !== ''
    );
  };

  const [isOpen, setIsOpen] = useState(hasUserPreferences());

  // 当偏好设置发生变化时，重新评估是否应该保持展开状态
  useEffect(() => {
    const shouldBeOpen = hasUserPreferences();
    if (shouldBeOpen && !isOpen) {
      setIsOpen(true);
    }
  }, [preferences, isOpen]);

  const updatePreferences = (key: keyof TravelPreferences, value: any) => {
    onPreferencesChange({ ...preferences, [key]: value });

    // 如果是出行类型变化，通知父组件
    if (key === 'travelType' && onTravelTypeChange) {
      onTravelTypeChange(value as GroupTravelPreference);
    }
  };

  const getPreferencesCount = () => {
    let count = 0;
    if (preferences.transportMethods.length > 0) count++;
    if (preferences.accommodationLevels.length > 0) count++;
    if (preferences.activityTypes.length > 0) count++;
    if (preferences.scenicTypes.length > 0) count++;
    if (preferences.travelStyle !== '平衡型') count++;
    if (preferences.budgetType !== '性价比优先') count++;
    if (preferences.dietaryRestrictions.trim() !== '') count++;
    if (preferences.travelType !== '朋友') count++;
    if (preferences.specialRequirements.trim() !== '') count++;
    return count;
  };

  const preferencesCount = getPreferencesCount();

  return (
    <Card className={cn('shadow-sm', className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="hover:bg-gray-50 cursor-pointer transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-primary" />
                偏好设置
                <span className="text-sm font-normal text-gray-500">
                  (可选，用于个性化推荐)
                </span>
                {preferencesCount > 0 && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                    已设置 {preferencesCount} 项
                  </span>
                )}
              </div>
              <Button variant="ghost" size="sm" className="p-1 h-auto">
                {isOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6 pt-0">
            {/* 提示信息 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-blue-800 font-medium mb-1">
                    个性化推荐提示
                  </p>
                  <p className="text-blue-700">
                    设置您的偏好可以让我们为您提供更精准的旅行方案。如果暂时没有特殊要求，可以跳过此部分，我们会使用默认的推荐设置。
                  </p>
                </div>
              </div>
            </div>

            {/* 交通方式偏好 */}
            <div>
              <Label className="text-base font-medium">
                偏好交通方式（多选）
              </Label>
              <div className="grid grid-cols-2 gap-3 mt-3">
                {TRANSPORT_MODES.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={option.value}
                      checked={preferences.transportMethods.includes(
                        option.value,
                      )}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updatePreferences('transportMethods', [
                            ...preferences.transportMethods,
                            option.value,
                          ]);
                        } else {
                          updatePreferences(
                            'transportMethods',
                            preferences.transportMethods.filter(
                              (t) => t !== option.value,
                            ),
                          );
                        }
                      }}
                    />
                    <Label htmlFor={option.value} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* 住宿标准 */}
            <div>
              <Label className="text-base font-medium">住宿标准（多选）</Label>
              <div className="grid grid-cols-2 gap-3 mt-3">
                {ACCOMMODATION_LEVELS.map((level) => (
                  <div
                    key={level.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`accommodation-${level.value}`}
                      checked={preferences.accommodationLevels.includes(
                        level.value,
                      )}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updatePreferences('accommodationLevels', [
                            ...preferences.accommodationLevels,
                            level.value,
                          ]);
                        } else {
                          updatePreferences(
                            'accommodationLevels',
                            preferences.accommodationLevels.filter(
                              (l) => l !== level.value,
                            ),
                          );
                        }
                      }}
                    />
                    <Label
                      htmlFor={`accommodation-${level.value}`}
                      className="text-sm"
                    >
                      {level.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* 活动类型偏好 */}
            <div>
              <Label className="text-base font-medium">
                活动类型偏好（多选）
              </Label>
              <div className="grid grid-cols-2 gap-3 mt-3">
                {ACTIVITY_PREFERENCES.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`activity-${option.value}`}
                      checked={preferences.activityTypes.includes(option.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updatePreferences('activityTypes', [
                            ...preferences.activityTypes,
                            option.value,
                          ]);
                        } else {
                          updatePreferences(
                            'activityTypes',
                            preferences.activityTypes.filter(
                              (t) => t !== option.value,
                            ),
                          );
                        }
                      }}
                    />
                    <Label
                      htmlFor={`activity-${option.value}`}
                      className="text-sm"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* 景点类型偏好 */}
            <div>
              <Label className="text-base font-medium">
                景点类型偏好（多选）
              </Label>
              <div className="grid grid-cols-2 gap-3 mt-3">
                {ATTRACTION_CATEGORIES.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`scenic-${option.value}`}
                      checked={preferences.scenicTypes.includes(option.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updatePreferences('scenicTypes', [
                            ...preferences.scenicTypes,
                            option.value,
                          ]);
                        } else {
                          updatePreferences(
                            'scenicTypes',
                            preferences.scenicTypes.filter(
                              (t) => t !== option.value,
                            ),
                          );
                        }
                      }}
                    />
                    <Label
                      htmlFor={`scenic-${option.value}`}
                      className="text-sm"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 旅游风格 */}
              <div>
                <Label htmlFor="travel-style" className="text-base font-medium">
                  旅游风格
                </Label>
                <Select
                  value={preferences.travelStyle}
                  onValueChange={(value) =>
                    updatePreferences('travelStyle', value)
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="选择旅游风格" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRAVEL_STYLES.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 预算偏好 */}
              <div>
                <Label htmlFor="budget-type" className="text-base font-medium">
                  预算偏好
                </Label>
                <Select
                  value={preferences.budgetType}
                  onValueChange={(value) =>
                    updatePreferences('budgetType', value)
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="选择预算偏好" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUDGET_PREFERENCES.map((budget) => (
                      <SelectItem key={budget.value} value={budget.value}>
                        {budget.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 出行类型 */}
            <div>
              <Label htmlFor="travel-type" className="text-base font-medium">
                出行类型
              </Label>
              <Select
                value={preferences.travelType}
                onValueChange={(value) =>
                  updatePreferences('travelType', value)
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="选择出行类型" />
                </SelectTrigger>
                <SelectContent>
                  {GROUP_TRAVEL_PREFERENCES.map((group) => (
                    <SelectItem key={group.value} value={group.value}>
                      {group.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 饮食限制 */}
            <div>
              <Label htmlFor="dietary" className="text-base font-medium">
                饮食限制
              </Label>
              <Textarea
                id="dietary"
                placeholder="请输入饮食偏好或限制，如：不吃香菜、素食主义等"
                value={preferences.dietaryRestrictions}
                onChange={(e) =>
                  updatePreferences('dietaryRestrictions', e.target.value)
                }
                className="mt-2"
                rows={2}
              />
            </div>

            {/* 特殊需求 */}
            <div>
              <Label
                htmlFor="special-requirements"
                className="text-base font-medium"
              >
                特殊需求
              </Label>
              <Textarea
                id="special-requirements"
                placeholder="请输入其他特殊需求或注意事项"
                value={preferences.specialRequirements}
                onChange={(e) =>
                  updatePreferences('specialRequirements', e.target.value)
                }
                className="mt-2"
                rows={3}
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
