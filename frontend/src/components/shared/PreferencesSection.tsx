import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings2, Star } from "lucide-react";
import {
  TRANSPORT_MODES,
  ACTIVITY_PREFERENCES,
  ATTRACTION_CATEGORIES,
  TRAVEL_STYLES,
  BUDGET_PREFERENCES,
  GROUP_TRAVEL_PREFERENCES,
  DIETARY_RESTRICTIONS,
} from "@/constants/planning";
import type {
  TransportMode,
  ActivityPreference,
  AttractionCategory,
  TravelStyle,
  BudgetPreference,
  GroupTravelPreference,
} from "@/constants/planning";

interface PreferencesSectionProps {
  preferences: TravelPreferences;
  onPreferencesChange: (preferences: TravelPreferences) => void;
}

export interface TravelPreferences {
  transportMethods: TransportMode[];
  accommodationLevel: number;
  activityTypes: ActivityPreference[];
  scenicTypes: AttractionCategory[];
  travelStyle: TravelStyle;
  budgetType: BudgetPreference;
  budgetRange?: string;
  dietaryRestrictions: string;
  travelType: GroupTravelPreference;
  specialRequirements: string;
}

export default function PreferencesSection({ preferences, onPreferencesChange }: PreferencesSectionProps) {
  const updatePreferences = (key: keyof TravelPreferences, value: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    onPreferencesChange({ ...preferences, [key]: value });
  };

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    } else {
      return [...array, item];
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-primary" />
          偏好设置
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 交通方式偏好 */}
        <div>
          <Label className="text-base font-medium">偏好交通方式（多选）</Label>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {TRANSPORT_MODES.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={option.value}
                  checked={preferences.transportMethods.includes(option.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updatePreferences("transportMethods", [...preferences.transportMethods, option.value]);
                    } else {
                      updatePreferences("transportMethods", preferences.transportMethods.filter(t => t !== option.value));
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
          <Label className="text-base font-medium">住宿标准</Label>
          <div className="mt-3">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-sm text-muted-foreground">1星</span>
              <div className="flex-1">
                <Slider
                  value={[preferences.accommodationLevel]}
                  onValueChange={(values) => updatePreferences("accommodationLevel", values[0])}
                  max={5}
                  min={1}
                  step={1}
                />
              </div>
              <span className="text-sm text-muted-foreground">5星</span>
            </div>
            <div className="flex items-center gap-1 justify-center">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < preferences.accommodationLevel
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="ml-2 text-sm font-medium">{preferences.accommodationLevel}星标准</span>
            </div>
          </div>
        </div>

        {/* 活动类型偏好 */}
        <div>
          <Label className="text-base font-medium">活动类型偏好（多选）</Label>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {ACTIVITY_PREFERENCES.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`activity-${option.value}`}
                  checked={preferences.activityTypes.includes(option.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updatePreferences("activityTypes", [...preferences.activityTypes, option.value]);
                    } else {
                      updatePreferences("activityTypes", preferences.activityTypes.filter(t => t !== option.value));
                    }
                  }}
                />
                <Label htmlFor={`activity-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* 景点类型偏好 */}
        <div>
          <Label className="text-base font-medium">景点类型偏好（多选）</Label>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {ATTRACTION_CATEGORIES.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`scenic-${option.value}`}
                  checked={preferences.scenicTypes.includes(option.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updatePreferences("scenicTypes", [...preferences.scenicTypes, option.value]);
                    } else {
                      updatePreferences("scenicTypes", preferences.scenicTypes.filter(t => t !== option.value));
                    }
                  }}
                />
                <Label htmlFor={`scenic-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 旅游风格 */}
          <div>
            <Label htmlFor="travel-style" className="text-base font-medium">旅游风格</Label>
            <Select value={preferences.travelStyle} onValueChange={(value) => updatePreferences("travelStyle", value)}>
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
            <Label htmlFor="budget-type" className="text-base font-medium">预算偏好</Label>
            <Select value={preferences.budgetType} onValueChange={(value) => updatePreferences("budgetType", value)}>
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
          <Label htmlFor="travel-type" className="text-base font-medium">出行类型</Label>
          <Select value={preferences.travelType} onValueChange={(value) => updatePreferences("travelType", value)}>
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
          <Label htmlFor="dietary" className="text-base font-medium">饮食限制</Label>
          <Textarea
            id="dietary"
            placeholder="请输入饮食偏好或限制，如：不吃香菜、素食主义等"
            value={preferences.dietaryRestrictions}
            onChange={(e) => updatePreferences("dietaryRestrictions", e.target.value)}
            className="mt-2"
            rows={2}
          />
        </div>

        {/* 特殊需求 */}
        <div>
          <Label htmlFor="special-requirements" className="text-base font-medium">特殊需求</Label>
          <Textarea
            id="special-requirements"
            placeholder="请输入其他特殊需求或注意事项"
            value={preferences.specialRequirements}
            onChange={(e) => updatePreferences("specialRequirements", e.target.value)}
            className="mt-2"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}