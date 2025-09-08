// 导入常量类型定义
import type {
  TransportMode,
  AccommodationLevel,
  ActivityPreference,
  AttractionCategory,
  TravelStyle,
  BudgetPreference,
  GroupTravelPreference,
  RoutePreference,
  PreferredStopType,
  EnvironmentPreference,
  AvoidRegion,
  DietaryRestriction,
  PlanningStatus,
} from '../constants/planning';

// 规划相关类型定义
export interface SchemaBase {
  [key: string]: unknown;
}

export interface DateFilterSchema {
  started_at: string;
  ended_at: string;
}

export interface PaginateRequest {
  page?: number;
  size?: number;
  sort?: string[];
  export?: boolean;
  key?: string[];
}

export interface PaginateResponse {
  total: number;
  data: unknown[];
}

export interface PlanningPreferencesSchema {
  preferred_transport_modes?: TransportMode[];
  accommodation_level?: number[];
  activity_preferences?: ActivityPreference[];
  attraction_categories?: AttractionCategory[];
  travel_style?: TravelStyle;
  budget_min?: number;
  budget_max?: number;
  budget_flexibility?: BudgetPreference;
  dietary_restrictions?: DietaryRestriction[];
  group_travel_preference?: GroupTravelPreference;
  custom_preferences?: string;
}

export interface PlanningTaskBase {
  title: string;
  source: string;
  departure_date: string;
  return_date: string;
  group_size: number;
  transport_mode: TransportMode;
}

export interface PlanningTaskItemBase extends PlanningTaskBase {
  id: number;
  status: PlanningStatus;
  created_at: string;
}

export interface PlanningResultBase {
  id: number;
  plan_title: string;
  plan_description: string;
  total_days: number;
  estimated_budget: number;
  is_favorite: boolean;
}

export interface RoutePlanSchema {
  from_location: string;
  from_time: string;
  to_location: string;
  to_time: string;
  transport_type: string;
  description: string;
  total_distance: number;
  estimated_time: string;
  cost?: number;
}

export interface AccommodationPlanSchema {
  name: string;
  type: string;
  price_range: string;
  description?: string;
}

export interface ActivityPlanSchema {
  time: string;
  name: string;
  description?: string;
  location?: string;
}

export interface HighlightSchema {
  name: string;
  description: string;
  best_visit_time?: string;
}

export interface DailyPlanSchema {
  date: string;
  accommodation: AccommodationPlanSchema;
  activities: ActivityPlanSchema[];
  route_plan?: RoutePlanSchema[];
  notes?: string;
}

// 单一目的地规划
export interface PlanningSingleResultSchema extends PlanningResultBase {
  daily_plan: DailyPlanSchema[];
  highlights: HighlightSchema[];
  tips: string[];
}

export interface PlanningSingleTaskSchema
  extends PlanningTaskBase,
    PlanningPreferencesSchema {
  target: string;
}

export interface PlanningSingleListRequest extends PaginateRequest {
  query?: {
    id?: number;
    title?: string;
    source?: string;
    target?: string;
    status?: string;
    created_at?: DateFilterSchema;
  };
  sort?: string[];
}

export interface PlanningSingleListResponse extends PaginateResponse {
  data: Array<PlanningTaskItemBase & { target: string }>;
}

// 沿途游玩规划
export interface WaypointSchema {
  name: string;
  description: string;
  estimated_visit_time: string;
  rating?: number;
  latitude: number;
  longitude: number;
  notes?: string;
}

export interface PlanningRouteResultSchema {
  daily_plan: DailyPlanSchema[];
  route_plan: RoutePlanSchema[];
  waypoints: WaypointSchema[];
}

export interface PlanningRouteTaskSchema
  extends PlanningTaskBase,
    PlanningPreferencesSchema {
  target: string;
  max_stopovers: number;
  max_stopover_duration: number;
  route_preference: RoutePreference;
  max_detour_distance: number;
  preferred_stop_types: PreferredStopType[];
}

export interface PlanningRouteListRequest extends PaginateRequest {
  query?: {
    id?: number;
    title?: string;
    source?: string;
    target?: string;
    status?: string;
    created_at?: DateFilterSchema;
  };
  sort?: string[];
}

export interface PlanningRouteListResponse extends PaginateResponse {
  data: Array<PlanningTaskItemBase & { target: string }>;
}

// 多节点规划
export interface NodeScheduleDetailSchema {
  location: string;
  daily_plan: DailyPlanSchema[];
}

export interface PlanningMultiResultSchema extends PlanningResultBase {
  nodes_details: NodeScheduleDetailSchema[];
  route_plan: RoutePlanSchema[];
  highlights: HighlightSchema[];
}

export interface NodeScheduleSchema {
  location: string;
  arrival_date: string;
  departure_date: string;
}

export interface PlanningMultiTaskSchema
  extends PlanningTaskBase,
    PlanningPreferencesSchema {
  nodes_schedule: NodeScheduleSchema[];
}

export interface PlanningMultiListRequest extends PaginateRequest {
  query?: PlanningTaskItemBase & {
    created_at?: DateFilterSchema;
  };
  sort?: string[];
}

export interface PlanningMultiListResponse extends PaginateResponse {
  data: PlanningTaskItemBase[];
}

// 智能推荐规划
export interface PlanningSmartResultSchema extends PlanningResultBase {
  destination: string;
  recommendation_reasons: string[];
  destination_highlights: HighlightSchema[];
  daily_plan: DailyPlanSchema[];
}

export interface PlanningSmartTaskSchema
  extends PlanningTaskBase,
    PlanningPreferencesSchema {
  max_travel_distance: number;
  preferred_environment: EnvironmentPreference;
  avoid_regions: AvoidRegion[];
}

export interface PlanningSmartListRequest extends PaginateRequest {
  query?: {
    id?: number;
    title?: string;
    destination?: string;
    created_at?: DateFilterSchema;
  };
  sort?: string[];
}

export interface PlanningSmartListResponse extends PaginateResponse {
  data: Array<PlanningTaskItemBase & { destination: string }>;
}

// 通用规划操作
export interface PlanningResultFavoriteRequest {
  is_favorite?: boolean;
}

export interface FeedbackRequest {
  user_rating?: number;
  user_feedback?: string;
}

export interface PlanningStatsResponse {
  total_plans: number;
  favorited_plans: number;
  mode_distribution: {
    single: number;
    route: number;
    multi: number;
    smart: number;
  };
}
