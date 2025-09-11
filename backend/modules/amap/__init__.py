from .client import AmapAPIException
from .client import AmapClient
from .enums import *
from .schemas import *
from .services import *


class AMapSDK:
    """
    高德地图SDK主类，集成所有服务
    """

    def __init__(self, logger, **kwargs):
        """
        初始化高德地图SDK

        Args:
            api_key: 高德地图API密钥
            logger: 日志记录器
            **kwargs: 传递给AmapClient的其他参数
        """
        self.logger = logger
        self.client = AmapClient(logger, **kwargs)
        # 初始化各个服务
        self.geocoding = GeocodingService(self.client, logger)
        self.search = SearchService(self.client, logger)
        self.routing = RoutingService(self.client, logger)
        self.weather = WeatherService(self.client, logger)
        self.staticmaps = StaticMapsService(self.client, logger)

    async def __aenter__(self):
        """异步上下文管理器入口"""
        await self.client.__aenter__()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """异步上下文管理器出口"""
        await self.client.__aexit__(exc_type, exc_val, exc_tb)

    async def close(self):
        """关闭SDK，释放资源"""
        await self.client.close()


__all__ = [
    # 主SDK类
    "AMapSDK",
    "AmapAPIException",
    "AmapClient",
    # 枚举
    "Language",
    "Extensions",
    "RouteType",
    "RoutingStrategy",
    "WeatherType",
    "CoordinateType",
    "PoiType",
    "StaticMapSize",
    "MapType",
    # 数据结构
    "AmapResponse",
    "Location",
    "AddressComponent",
    "GeocodingResult",
    "ReverseGeocodingResult",
    "GeocodingResponse",
    "ReverseGeocodingResponse",
    "PoiPhoto",
    "PoiDetail",
    "SearchResponse",
    "SearchResult",
    "RouteStep",
    "RoutePath",
    "RouteResponse",
    "RouteResult",
    "DistanceElement",
    "DistanceMatrixResult",
    "TransitStep",
    "TransitPath",
    "TransitResponse",
    "TransitResult",
    "LiveWeather",
    "ForecastWeather",
    "WeatherResponse",
    "WeatherResult",
    "StaticMapRequest",
    "StaticMapMarker",
    "StaticMapPath",
    "StaticMapResult",
]
