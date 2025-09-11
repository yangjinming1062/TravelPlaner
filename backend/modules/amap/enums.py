from enum import Enum


class Language(str, Enum):
    """语言设置"""

    ZH = "zh"  # 中文
    EN = "en"  # 英文


class Extensions(str, Enum):
    """返回数据扩展"""

    BASE = "base"  # 基础信息
    ALL = "all"  # 全部信息


class RouteType(str, Enum):
    """路径规划类型"""

    DRIVING = "driving"  # 驾车
    WALKING = "walking"  # 步行
    TRANSIT = "transit"  # 公交
    BICYCLING = "bicycling"  # 骑行
    ELECTROBIKE = "electrobike"  # 电动车


class RoutingStrategy(str, Enum):
    """路径规划策略"""

    # 驾车策略
    FASTEST = "0"  # 速度最快
    SHORTEST = "1"  # 距离最短
    AVOID_CONGESTION = "2"  # 避免拥堵
    AVOID_HIGHWAY = "3"  # 避免高速
    AVOID_TOLL = "4"  # 避免收费
    AVOID_HIGHWAY_TOLL = "5"  # 避免高速和收费
    FASTEST_HIGHWAY = "6"  # 高速优先
    FASTEST_TOLL = "7"  # 收费优先
    FASTEST_HIGHWAY_TOLL = "8"  # 高速和收费优先
    AVOID_FERRY = "9"  # 避免轮渡

    # 公交策略
    FASTEST_TRANSIT = "0"  # 最快捷模式
    LEAST_TRANSFER = "1"  # 最少换乘
    LEAST_WALK = "2"  # 最少步行
    COMFORTABLE = "3"  # 最舒适
    AVOID_SUBWAY = "4"  # 不乘地铁


class WeatherType(str, Enum):
    """天气查询类型"""

    LIVE = "live"  # 实况天气
    FORECAST = "forecast"  # 预报天气


class CoordinateType(str, Enum):
    """坐标系类型"""

    GCJ02 = "gcj02"  # 高德坐标系（默认）
    WGS84 = "wgs84"  # GPS坐标系


class PoiType(str, Enum):
    """POI类型"""

    # 汽车服务
    AUTO_SERVICE = "010000"
    # 汽车销售
    AUTO_SALES = "020000"
    # 汽车维修
    AUTO_REPAIR = "030000"
    # 摩托车服务
    MOTORCYCLE_SERVICE = "040000"
    # 餐饮服务
    DINING = "050000"
    # 购物服务
    SHOPPING = "060000"
    # 生活服务
    LIFE_SERVICE = "070000"
    # 体育休闲服务
    SPORTS_RECREATION = "080000"
    # 医疗保健服务
    MEDICAL = "090000"
    # 住宿服务
    ACCOMMODATION = "100000"
    # 风景名胜
    SCENIC_SPOT = "110000"
    # 商务住宅
    BUSINESS_RESIDENCE = "120000"
    # 政府机构及社会团体
    GOVERNMENT = "130000"
    # 科教文化服务
    EDUCATION_CULTURE = "140000"
    # 交通设施服务
    TRANSPORTATION = "150000"
    # 金融保险服务
    FINANCE_INSURANCE = "160000"
    # 公司企业
    COMPANY = "170000"
    # 道路附属设施
    ROAD_FACILITY = "180000"
    # 地名地址信息
    PLACE_NAME = "190000"
    # 公共设施
    PUBLIC_FACILITY = "200000"


class StaticMapSize(str, Enum):
    """静态地图尺寸"""

    SIZE_400_300 = "400*300"
    SIZE_500_400 = "500*400"
    SIZE_600_480 = "600*480"
    SIZE_800_600 = "800*600"
    SIZE_1024_768 = "1024*768"


class MapType(str, Enum):
    """地图类型"""

    ROADMAP = "roadmap"  # 路网地图
    SATELLITE = "satellite"  # 卫星地图
