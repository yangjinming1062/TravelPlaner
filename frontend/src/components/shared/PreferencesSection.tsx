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
import { useState } from "react";

interface PreferencesSectionProps {
  preferences: TravelPreferences;
  onPreferencesChange: (preferences: TravelPreferences) => void;
}

export interface TravelPreferences {
  transportMethods: string[];
  accommodationLevel: number;
  activityTypes: string[];
  scenicTypes: string[];
  travelStyle: string;
  budgetType: string;
  budgetRange?: string;
  dietaryRestrictions: string;
  travelType: string;
  specialRequirements: string;
}

const transportOptions = [
  { id: "self-drive-gas", label: "自驾（油车）" },
  { id: "self-drive-electric", label: "自驾（纯电）" },
  { id: "self-drive-hybrid", label: "自驾（混动）" },
  { id: "train", label: "火车" },
  { id: "flight", label: "飞机" },
  { id: "bus", label: "客车" },
];

const activityOptions = [
  { id: "shopping", label: "购物" },
  { id: "sightseeing", label: "观光" },
  { id: "food", label: "美食" },
  { id: "culture", label: "文化体验" },
  { id: "nature", label: "自然探索" },
  { id: "adventure", label: "户外冒险" },
];

const scenicOptions = [
  { id: "cultural", label: "文化古迹" },
  { id: "natural", label: "自然风光" },
  { id: "modern", label: "现代都市" },
  { id: "historical", label: "历史遗迹" },
  { id: "religious", label: "宗教场所" },
  { id: "entertainment", label: "娱乐休闲" },
];

export default function PreferencesSection({ preferences, onPreferencesChange }: PreferencesSectionProps) {
  const updatePreferences = (key: keyof TravelPreferences, value: any) => {
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
            {transportOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={option.id}
                  checked={preferences.transportMethods.includes(option.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updatePreferences("transportMethods", [...preferences.transportMethods, option.id]);
                    } else {
                      updatePreferences("transportMethods", preferences.transportMethods.filter(t => t !== option.id));
                    }
                  }}
                />
                <Label htmlFor={option.id} className="text-sm">
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
            {activityOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`activity-${option.id}`}
                  checked={preferences.activityTypes.includes(option.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updatePreferences("activityTypes", [...preferences.activityTypes, option.id]);
                    } else {
                      updatePreferences("activityTypes", preferences.activityTypes.filter(t => t !== option.id));
                    }
                  }}
                />
                <Label htmlFor={`activity-${option.id}`} className="text-sm">
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
            {scenicOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`scenic-${option.id}`}
                  checked={preferences.scenicTypes.includes(option.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updatePreferences("scenicTypes", [...preferences.scenicTypes, option.id]);
                    } else {
                      updatePreferences("scenicTypes", preferences.scenicTypes.filter(t => t !== option.id));
                    }
                  }}
                />
                <Label htmlFor={`scenic-${option.id}`} className="text-sm">
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
                <SelectItem value="leisure">休闲型</SelectItem>
                <SelectItem value="balanced">平衡型</SelectItem>
                <SelectItem value="intensive">紧凑型</SelectItem>
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
                <SelectItem value="budget">节俭为主</SelectItem>
                <SelectItem value="value">性价比优先</SelectItem>
                <SelectItem value="comfort">舒适为主</SelectItem>
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
              <SelectItem value="solo">独行</SelectItem>
              <SelectItem value="couple">情侣</SelectItem>
              <SelectItem value="family">家庭</SelectItem>
              <SelectItem value="friends">朋友</SelectItem>
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