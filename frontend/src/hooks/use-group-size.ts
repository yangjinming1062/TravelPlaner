import { useRef } from 'react';
import { GROUP_TRAVEL_PREFERENCES } from '@/constants/planning';
import type { GroupTravelPreference } from '@/constants/planning';
import type { CommonPlanningData } from '@/components/shared/CommonPlanningFields';

/**
 * 管理出行人数的自定义Hook
 * 处理出行类型变化时的自动推断逻辑，支持用户手动编辑
 */
export const useGroupSize = (
  commonData: CommonPlanningData,
  setCommonData: (data: CommonPlanningData | ((prev: CommonPlanningData) => CommonPlanningData)) => void
) => {
  // 跟踪用户是否手动编辑过人数
  const userEditedRef = useRef(false);

  /**
   * 处理出行类型变化
   * 如果用户未手动编辑过，则自动更新人数为出行类型的默认值
   */
  const handleTravelTypeChange = (travelType: GroupTravelPreference) => {
    if (!userEditedRef.current) {
      const selectedGroup = GROUP_TRAVEL_PREFERENCES.find(g => g.value === travelType);
      if (selectedGroup) {
        setCommonData(prev => ({ ...prev, groupSize: selectedGroup.defaultGroupSize }));
      }
    }
  };

  /**
   * 处理用户手动编辑人数
   * 标记为用户已编辑，之后不再自动更新
   */
  const handleGroupSizeChange = (newSize: number) => {
    userEditedRef.current = true;
    setCommonData(prev => ({ ...prev, groupSize: newSize }));
  };

  /**
   * 重置编辑状态（用于表单重置等场景）
   */
  const resetEditStatus = () => {
    userEditedRef.current = false;
  };

  return {
    handleTravelTypeChange,
    handleGroupSizeChange,
    resetEditStatus,
    isUserEdited: userEditedRef.current,
  };
};
