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
  { value: '观光游览', label: '观光游览' },
  { value: '美食体验', label: '美食体验' },
  { value: '文化探索', label: '文化探索' },
  { value: '自然户外', label: '自然户外' },
  { value: '休闲娱乐', label: '休闲娱乐' },
  { value: '购物消费', label: '购物消费' },
  { value: '摄影记录', label: '摄影记录' },
  { value: '特色体验', label: '特色体验' },
  { value: '运动健身', label: '运动健身' },
  { value: '亲子互动', label: '亲子互动' },
] as const;

// 景点类型偏好
export const ATTRACTION_CATEGORIES = [
  { value: '自然风光，山川湖海，自然公园，风景名胜', label: '自然风光' },
  { value: '历史人文，古迹遗址，传统建筑，历史文化', label: '历史人文' },
  { value: '宗教文化，寺庙教堂，道观，宗教圣地', label: '宗教文化' },
  { value: '现代都市，摩天大楼，商业中心，城市地标', label: '现代都市' },
  { value: '博物艺术，博物馆，美术馆，展览馆，艺术中心', label: '博物艺术' },
  {
    value: '娱乐体验，主题公园，游乐园，演出场所，娱乐设施',
    label: '娱乐体验',
  },
  { value: '特色小镇，古镇，民族村落，特色街区，文化街', label: '特色小镇' },
] as const;

// 旅游风格
export const TRAVEL_STYLES = [
  {
    value: '节奏缓慢，时间宽松，不紧迫，重点是放松和享受',
    label: '休闲型',
  },
  {
    value: '时间安排适中，既有游览内容也有休息时间',
    label: '平衡型',
  },
  {
    value: '时间安排紧密，尽可能多地体验和游览',
    label: '紧凑型',
  },
] as const;

// 预算偏好
export const BUDGET_PREFERENCES = [
  {
    value: '严格控制预算，优选经济实惠的住宿、餐饮和交通方式，避免高消费项目',
    label: '节俭为主',
  },
  {
    value: '在合理预算范围内追求最佳体验，平衡价格与质量，选择性价比高的服务',
    label: '性价比优先',
  },
  {
    value: '注重旅行体验和舒适度，愿意为优质服务和设施支付更高费用',
    label: '舒适为主',
  },
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
  { value: '自然生态', label: '自然生态' },
  { value: '人文古迹', label: '人文古迹' },
  { value: '特色小镇', label: '特色小镇' },
  { value: '美食集中地', label: '美食集中地' },
  { value: '休闲度假', label: '休闲度假' },
  { value: '娱乐体验', label: '娱乐体验' },
  { value: '购物特产', label: '购物特产' },
  { value: '观景打卡', label: '观景打卡' },
] as const;

// 环境偏好 (用于智能推荐模式)
export const ENVIRONMENT_PREFERENCES = [
  { value: '海滨度假', label: '海滨度假' },
  { value: '山水风光', label: '山水风光' },
  { value: '草原风情', label: '草原风情' },
  { value: '森林氧吧', label: '森林氧吧' },
  { value: '都市风尚', label: '都市风尚' },
  { value: '古镇民俗', label: '古镇民俗' },
  { value: '田园乡村', label: '田园乡村' },
  { value: '特色地貌', label: '特色地貌' },
] as const;

// 避免的地区 (用于智能推荐模式)
export const AVOID_REGIONS = [
  // 身体健康相关
  { value: '海拔反应区', label: '海拔反应区' },
  { value: '气候不适应', label: '气候不适应' },
  { value: '体力要求高', label: '体力要求高' },
  { value: '过敏风险区', label: '过敏风险区' },
  { value: '老幼不宜区', label: '老幼不宜区' },
  { value: '医疗不便区', label: '医疗不便区' },

  // 旅游体验相关
  { value: '过度商业化', label: '过度商业化' },
  { value: '人流过于拥挤', label: '人流过于拥挤' },
  { value: '消费水平过高', label: '消费水平过高' },
  { value: '语言交流困难', label: '语言交流困难' },
  { value: '住宿条件较差', label: '住宿条件较差' },
  { value: '安全风险较高', label: '安全风险较高' },

  // 便利度相关
  { value: '交通极不便利', label: '交通极不便利' },
  { value: '网络信号很差', label: '网络信号很差' },
  { value: '旅游设施匮乏', label: '旅游设施匮乏' },

  // 时间季节相关
  { value: '恶劣天气多发', label: '恶劣天气多发' },
  { value: '季节性关闭区', label: '季节性关闭区' },
  { value: '旅游旺季拥挤', label: '旅游旺季拥挤' },
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
  dietary_restrictions: '',
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
export type PlanningStatus = (typeof PLANNING_STATUS)[number]['value'];
