// 规划相关常量定义

// 交通方式
export const TRANSPORT_MODES = [
  { value: '自驾（纯油）', label: '自驾（纯油）' },
  { value: '自驾（纯电）', label: '自驾（纯电）' },
  { value: '自驾（混动）', label: '自驾（混动）' },
  { value: '火车', label: '火车' },
  { value: '飞机', label: '飞机' },
  { value: '客车', label: '客车' },
] as const;

// 住宿标准
export const ACCOMMODATION_LEVELS = [
  { value: 2, label: '2星/经济' },
  { value: 3, label: '3星/舒适' },
  { value: 4, label: '4星/高档' },
  { value: 5, label: '5星/豪华' },
] as const;

// 活动类型偏好
export const ACTIVITY_PREFERENCES = [
  { value: '购物', label: '购物' },
  { value: '美食', label: '美食' },
  { value: '自然探索', label: '自然探索' },
  { value: '观光', label: '观光' },
  { value: '文化体验', label: '文化体验' },
  { value: '户外冒险', label: '户外冒险' },
] as const;

// 景点类型偏好
export const ATTRACTION_CATEGORIES = [
  { value: '文化古迹', label: '文化古迹' },
  { value: '现代都市', label: '现代都市' },
  { value: '宗教场所', label: '宗教场所' },
  { value: '自然风光', label: '自然风光' },
  { value: '历史遗迹', label: '历史遗迹' },
  { value: '娱乐休闲', label: '娱乐休闲' },
] as const;

// 旅游风格
export const TRAVEL_STYLES = [
  { value: '休闲型', label: '休闲型' },
  { value: '平衡型', label: '平衡型' },
  { value: '紧凑型', label: '紧凑型' },
] as const;

// 预算偏好
export const BUDGET_PREFERENCES = [
  { value: '节俭为主', label: '节俭为主' },
  { value: '性价比优先', label: '性价比优先' },
  { value: '舒适为主', label: '舒适为主' },
] as const;

// 出行类型
export const GROUP_TRAVEL_PREFERENCES = [
  { value: '独行', label: '独行', defaultGroupSize: 1 },
  { value: '情侣', label: '情侣', defaultGroupSize: 2 },
  { value: '夫妻', label: '夫妻', defaultGroupSize: 2 },
  { value: '亲子', label: '亲子', defaultGroupSize: 3 },
  { value: '家庭', label: '家庭', defaultGroupSize: 4 },
  { value: '朋友', label: '朋友', defaultGroupSize: 3 },
] as const;

// 路线偏好 (用于沿途游玩模式)
export const ROUTE_PREFERENCES = [
  { value: '速度优先', label: '速度优先' },
  { value: '风景优先', label: '风景优先' },
  { value: '经济优先', label: '经济优先' },
  { value: '平衡', label: '平衡' },
] as const;

// 偏好停留类型 (用于沿途游玩模式)
export const PREFERRED_STOP_TYPES = [
  { value: '历史古迹', label: '历史古迹' },
  { value: '自然景观', label: '自然景观' },
  { value: '美食体验', label: '美食体验' },
  { value: '文化场所', label: '文化场所' },
  { value: '购物中心', label: '购物中心' },
  { value: '娱乐设施', label: '娱乐设施' },
  { value: '温泉度假', label: '温泉度假' },
  { value: '户外活动', label: '户外活动' },
] as const;

// 环境偏好 (用于智能推荐模式)
export const ENVIRONMENT_PREFERENCES = [
  { value: '海边', label: '海边' },
  { value: '山地', label: '山地' },
  { value: '草原', label: '草原' },
  { value: '湖泊', label: '湖泊' },
  { value: '沙漠', label: '沙漠' },
  { value: '森林', label: '森林' },
  { value: '城市', label: '城市' },
  { value: '古镇', label: '古镇' },
] as const;

// 避免的地区 (用于智能推荐模式)
export const AVOID_REGIONS = [
  { value: '高原地区', label: '高原地区' },
  { value: '沙漠地区', label: '沙漠地区' },
  { value: '极寒地区', label: '极寒地区' },
  { value: '海岛地区', label: '海岛地区' },
  { value: '偏远山区', label: '偏远山区' },
  { value: '政治敏感区', label: '政治敏感区' },
  { value: '自然灾害区', label: '自然灾害区' },
  { value: '交通不便区', label: '交通不便区' },
] as const;

// 常见饮食限制选项
export const DIETARY_RESTRICTIONS = [
  { value: '不吃香菜', label: '不吃香菜' },
  { value: '素食主义', label: '素食主义' },
  { value: '清真', label: '清真' },
  { value: '不吃辣', label: '不吃辣' },
  { value: '海鲜过敏', label: '海鲜过敏' },
  { value: '坚果过敏', label: '坚果过敏' },
  { value: '乳糖不耐受', label: '乳糖不耐受' },
  { value: '麸质不耐受', label: '麸质不耐受' },
] as const;

// 规划状态
export const PLANNING_STATUS = [
  { value: 'pending', label: '待处理' },
  { value: 'processing', label: '处理中' },
  { value: 'completed', label: '已完成' },
  { value: 'failed', label: '失败' },
] as const;

// 偏好设置默认值
export const DEFAULT_PREFERENCES = {
  preferred_transport_modes: [],
  accommodation_level: [3],
  activity_preferences: [],
  attraction_categories: [],
  travel_style: '平衡型',
  budget_flexibility: '性价比优先',
  group_travel_preference: '家庭',
  dietary_restrictions: [],
  custom_preferences: '',
} as const;

// 前端偏好设置默认值
export const DEFAULT_TRAVEL_PREFERENCES = {
  transportMethods: [] as TransportMode[],
  accommodationLevels: [4] as AccommodationLevel[],
  activityTypes: [] as ActivityPreference[],
  scenicTypes: [] as AttractionCategory[],
  travelStyle: '平衡型' as TravelStyle,
  budgetType: '性价比优先' as BudgetPreference,
  budgetRange: '',
  dietaryRestrictions: '',
  travelType: '夫妻' as GroupTravelPreference,
  specialRequirements: '',
};

// 通用规划数据默认值
export const DEFAULT_COMMON_PLANNING_DATA = {
  planTitle: '',
  departureDate: undefined,
  returnDate: undefined,
  primaryTransport: '自驾（纯电）' as TransportMode,
  groupSize: 2, // 默认2人（夫妻）
};

// 类型定义
export type TransportMode = (typeof TRANSPORT_MODES)[number]['value'];
export type AccommodationLevel = (typeof ACCOMMODATION_LEVELS)[number]['value'];
export type ActivityPreference = (typeof ACTIVITY_PREFERENCES)[number]['value'];
export type AttractionCategory =
  (typeof ATTRACTION_CATEGORIES)[number]['value'];
export type TravelStyle = (typeof TRAVEL_STYLES)[number]['value'];
export type BudgetPreference = (typeof BUDGET_PREFERENCES)[number]['value'];
export type GroupTravelPreference =
  (typeof GROUP_TRAVEL_PREFERENCES)[number]['value'];
export type RoutePreference = (typeof ROUTE_PREFERENCES)[number]['value'];
export type PreferredStopType = (typeof PREFERRED_STOP_TYPES)[number]['value'];
export type EnvironmentPreference =
  (typeof ENVIRONMENT_PREFERENCES)[number]['value'];
export type AvoidRegion = (typeof AVOID_REGIONS)[number]['value'];
export type DietaryRestriction = (typeof DIETARY_RESTRICTIONS)[number]['value'];
export type PlanningStatus = (typeof PLANNING_STATUS)[number]['value'];
