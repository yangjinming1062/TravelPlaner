import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PreferencesSection, { TravelPreferences } from "@/components/shared/PreferencesSection";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserPreferences, useUpdateUserPreferences } from "@/hooks/use-api";

const PreferencesSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: existingPreferences } = useUserPreferences();
  const { mutate: updatePreferences, isPending } = useUpdateUserPreferences();
  
  const [preferences, setPreferences] = useState<TravelPreferences>({
    transportMethods: [],
    accommodationLevel: 3,
    activityTypes: [],
    scenicTypes: [],
    travelStyle: "平衡型",
    budgetType: "性价比优先",
    budgetRange: "",
    dietaryRestrictions: "",
    travelType: "独行",
    specialRequirements: ""
  });

  // 如果用户已有偏好设置，则初始化表单
  useEffect(() => {
    if (existingPreferences) {
      setPreferences({
        transportMethods: existingPreferences.preferred_transport_modes || [],
        accommodationLevel: existingPreferences.accommodation_level || 3,
        activityTypes: existingPreferences.activity_preferences || [],
        scenicTypes: existingPreferences.attraction_categories || [],
        travelStyle: existingPreferences.travel_style || "平衡型",
        budgetType: existingPreferences.budget_flexibility || "性价比优先",
        budgetRange: existingPreferences.budget_min && existingPreferences.budget_max 
          ? `${existingPreferences.budget_min}-${existingPreferences.budget_max}` 
          : "",
        dietaryRestrictions: existingPreferences.dietary_restrictions?.join(", ") || "",
        travelType: existingPreferences.group_travel_preference || "独行",
        specialRequirements: existingPreferences.custom_preferences || ""
      });
    }
  }, [existingPreferences]);

  const handleSavePreferences = () => {
    // 转换为后端 schema 格式
    const backendPreferences = {
      preferred_transport_modes: preferences.transportMethods,
      accommodation_level: preferences.accommodationLevel,
      activity_preferences: preferences.activityTypes,
      attraction_categories: preferences.scenicTypes,
      travel_style: preferences.travelStyle,
      budget_flexibility: preferences.budgetType,
      dietary_restrictions: preferences.dietaryRestrictions 
        ? preferences.dietaryRestrictions.split(",").map(s => s.trim()).filter(s => s)
        : [],
      group_travel_preference: preferences.travelType,
      custom_preferences: preferences.specialRequirements,
    };

    // 处理预算范围
    if (preferences.budgetRange) {
      const [min, max] = preferences.budgetRange.split("-").map(s => parseInt(s.trim()));
      if (!isNaN(min)) backendPreferences.budget_min = min;
      if (!isNaN(max)) backendPreferences.budget_max = max;
    }

    updatePreferences(backendPreferences, {
      onSuccess: () => {
        toast({
          title: "偏好设置已保存",
          description: "我们将为您提供更精准的推荐方案",
        });
        navigate("/");
      },
      onError: (error: any) => {
        toast({
          title: "保存失败",
          description: error.message || "无法保存偏好设置，请稍后重试",
          variant: "destructive",
        });
      }
    });
  };

  const handleSkip = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-green-600 flex items-center justify-center gap-2">
                <CheckCircle className="w-6 h-6" />
                完善你的旅游偏好
              </CardTitle>
              <p className="text-gray-600">
                设置你的旅游偏好，我们将为你提供更精准的推荐方案
              </p>
            </CardHeader>
          </Card>

          <PreferencesSection
            preferences={preferences}
            onPreferencesChange={setPreferences}
          />

          <div className="flex gap-4 mt-6">
            <Button onClick={handleSkip} variant="outline" className="flex-1">
              暂时跳过
            </Button>
            <Button 
              onClick={handleSavePreferences} 
              className="flex-1"
              disabled={isPending}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              {isPending ? "保存中..." : "保存并继续"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesSetupPage;
