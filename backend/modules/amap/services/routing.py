from ..client import AmapClient
from ..enums import *
from ..schemas import *


class RoutingService:
    """
    路径规划服务
    """

    def __init__(self, client: AmapClient, logger):
        self.client = client
        self.logger = logger

    async def driving_route(
        self,
        origin: Location | str,
        destination: Location | str,
        strategy: RoutingStrategy = RoutingStrategy.FASTEST,
        waypoints: list[Location | str] | None = None,
        avoidpolygons: str | None = None,
        avoidroad: str | None = None,
        province: str | None = None,
        number: str | None = None,
        extensions: Extensions = Extensions.ALL,
        ferry: int | None = None,
        cartype: int | None = None,
        future: int | None = None,
    ) -> RouteResult | None:
        """
        驾车路径规划

        Args:
            origin: 起点坐标，格式：经度,纬度
            destination: 终点坐标，格式：经度,纬度
            strategy: 路径计算策略，详见RoutingStrategy枚举
            waypoints: 途经点列表，最多支持16个途经点
            avoidpolygons: 避让区域，格式：经度1,纬度1;经度2,纬度2;...
            avoidroad: 避让道路名，只支持一条道路
            province: 起点所在省份，用于提高算路精度
            number: 车牌号，用于限行规避
            extensions: 返回结果详细程度，base(基本)/all(详细)
            ferry: 是否使用轮渡，0(不使用)/1(使用)，默认使用
            cartype: 车辆类型，0(小车)/1(货车)/2(客车)/3(危化品车)
            future: 出发时间，格式：UNIX时间戳

        Returns:
            驾车路径规划结果，失败时返回None

        Raises:
            AmapAPIException: API调用失败时
        """
        # 处理坐标参数
        origin_str = str(origin) if isinstance(origin, Location) else origin
        destination_str = str(destination) if isinstance(destination, Location) else destination
        # 处理途经点
        waypoints_str = None
        if waypoints:
            if len(waypoints) > 16:
                raise ValueError("途经点最多支持16个")
            waypoint_strs = []
            for waypoint in waypoints:
                if isinstance(waypoint, Location):
                    waypoint_strs.append(str(waypoint))
                else:
                    waypoint_strs.append(waypoint)
            waypoints_str = ";".join(waypoint_strs)
        params = {
            "origin": origin_str,
            "destination": destination_str,
            "strategy": strategy.value,
            "waypoints": waypoints_str,
            "avoidpolygons": avoidpolygons,
            "avoidroad": avoidroad,
            "province": province,
            "number": number,
            "extensions": extensions.value,
            "ferry": ferry,
            "cartype": cartype,
            "future": future,
        }
        try:
            response = await self.client.get("/v3/direction/driving", params=params)
            route_response = RouteResponse(**response)
            self.logger.debug(f"驾车路径规划成功: {origin_str} -> {destination_str}")
            return route_response.route
        except Exception as e:
            self.logger.error(f"驾车路径规划失败: {origin_str} -> {destination_str}, 错误: {str(e)}")
            raise

    async def walking_route(
        self, origin: Location | str, destination: Location | str, alternative_route: int | None = None, isindoor: int | None = None
    ) -> RouteResult | None:
        """
        步行路径规划

        Args:
            origin: 起点坐标，格式：经度,纬度
            destination: 终点坐标，格式：经度,纬度
            alternative_route: 备选路径数量，可选值：0(不计算备选)/1(计算备选)
            isindoor: 是否包含室内数据，可选值：0(不包含)/1(包含)

        Returns:
            步行路径规划结果，失败时返回None

        Raises:
            AmapAPIException: API调用失败时
        """
        # 处理坐标参数
        origin_str = str(origin) if isinstance(origin, Location) else origin
        destination_str = str(destination) if isinstance(destination, Location) else destination
        params = {"origin": origin_str, "destination": destination_str, "alternative_route": alternative_route, "isindoor": isindoor}
        try:
            response = await self.client.get("/v3/direction/walking", params=params)
            route_response = RouteResponse(**response)
            self.logger.debug(f"步行路径规划成功: {origin_str} -> {destination_str}")
            return route_response.route
        except Exception as e:
            self.logger.error(f"步行路径规划失败: {origin_str} -> {destination_str}, 错误: {str(e)}")
            raise

    async def bicycling_route(self, origin: Location | str, destination: Location | str, alternative_route: int | None = None) -> RouteResult | None:
        """
        骑行路径规划

        Args:
            origin: 起点坐标，格式：经度,纬度
            destination: 终点坐标，格式：经度,纬度
            alternative_route: 备选路径数量，可选值：0(不计算备选)/1(计算备选)

        Returns:
            骑行路径规划结果，失败时返回None

        Raises:
            AmapAPIException: API调用失败时
        """
        # 处理坐标参数
        origin_str = str(origin) if isinstance(origin, Location) else origin
        destination_str = str(destination) if isinstance(destination, Location) else destination
        params = {"origin": origin_str, "destination": destination_str, "alternative_route": alternative_route}
        try:
            response = await self.client.get("/v3/direction/bicycling", params=params)
            route_response = RouteResponse(**response)
            self.logger.debug(f"骑行路径规划成功: {origin_str} -> {destination_str}")
            return route_response.route
        except Exception as e:
            self.logger.error(f"骑行路径规划失败: {origin_str} -> {destination_str}, 错误: {str(e)}")
            raise

    async def electrobike_route(
        self, origin: Location | str, destination: Location | str, alternative_route: int | None = None
    ) -> RouteResult | None:
        """
        电动车路径规划

        Args:
            origin: 起点坐标，格式：经度,纬度
            destination: 终点坐标，格式：经度,纬度
            alternative_route: 备选路径数量，可选值：0(不计算备选)/1(计算备选)

        Returns:
            电动车路径规划结果，失败时返回None

        Raises:
            AmapAPIException: API调用失败时
        """
        # 处理坐标参数
        origin_str = str(origin) if isinstance(origin, Location) else origin
        destination_str = str(destination) if isinstance(destination, Location) else destination
        params = {"origin": origin_str, "destination": destination_str, "alternative_route": alternative_route}
        try:
            response = await self.client.get("/v3/direction/electrobike", params=params)
            route_response = RouteResponse(**response)
            self.logger.debug(f"电动车路径规划成功: {origin_str} -> {destination_str}")
            return route_response.route
        except Exception as e:
            self.logger.error(f"电动车路径规划失败: {origin_str} -> {destination_str}, 错误: {str(e)}")
            raise

    async def transit_route(
        self,
        origin: Location | str,
        destination: Location | str,
        city: str,
        strategy: RoutingStrategy = RoutingStrategy.FASTEST_TRANSIT,
        alternative_route: int | None = None,
        multiexport: int | None = None,
        nightflag: int | None = None,
        date: str | None = None,
        time: str | None = None,
    ) -> TransitResult | None:
        """
        公交路径规划

        Args:
            origin: 起点坐标，格式：经度,纬度
            destination: 终点坐标，格式：经度,纬度
            city: 城市/跨城规划城市，支持citycode或cityname
            strategy: 公交换乘策略，详见RoutingStrategy枚举
            alternative_route: 备选路径数量，可选值：0(不计算备选)/1(计算备选)
            multiexport: 是否计算多个路径方案，可选值：0(不计算)/1(计算)
            nightflag: 是否包含夜班车，可选值：0(不包含)/1(包含)
            date: 出发日期，格式：YYYY-MM-DD
            time: 出发时间，格式：HH:MM

        Returns:
            公交路径规划结果，失败时返回None

        Raises:
            AmapAPIException: API调用失败时
        """
        # 处理坐标参数
        origin_str = str(origin) if isinstance(origin, Location) else origin
        destination_str = str(destination) if isinstance(destination, Location) else destination
        params = {
            "origin": origin_str,
            "destination": destination_str,
            "city": city,
            "strategy": strategy.value,
            "alternative_route": alternative_route,
            "multiexport": multiexport,
            "nightflag": nightflag,
            "date": date,
            "time": time,
        }
        try:
            response = await self.client.get("/v3/direction/transit/integrated", params=params)
            transit_response = TransitResponse(**response)
            self.logger.debug(f"公交路径规划成功: {origin_str} -> {destination_str}")
            return transit_response.route
        except Exception as e:
            self.logger.error(f"公交路径规划失败: {origin_str} -> {destination_str}, 错误: {str(e)}")
            raise

    async def distance_matrix(
        self, origins: list[Location | str], destinations: list[Location | str], route_type: RouteType = RouteType.DRIVING
    ) -> DistanceMatrixResult | None:
        """
        距离测量/路径距离查询

        Args:
            origins: 起点列表，最多支持10个起点
            destinations: 终点列表，最多支持10个终点
            route_type: 路径计算的方式和方法，详见RouteType枚举

        Returns:
            距离矩阵结果，失败时返回None

        Raises:
            AmapAPIException: API调用失败时
            ValueError: 起点或终点数量超过限制时
        """
        if len(origins) > 10:
            raise ValueError("起点最多支持10个")
        if len(destinations) > 10:
            raise ValueError("终点最多支持10个")
        # 处理起点列表
        origin_strs = []
        for origin in origins:
            if isinstance(origin, Location):
                origin_strs.append(str(origin))
            else:
                origin_strs.append(origin)
        origins_str = "|".join(origin_strs)
        # 处理终点列表
        destination_strs = []
        for destination in destinations:
            if isinstance(destination, Location):
                destination_strs.append(str(destination))
            else:
                destination_strs.append(destination)
        destinations_str = "|".join(destination_strs)
        params = {"origins": origins_str, "destinations": destinations_str, "type": route_type.value}
        try:
            response = await self.client.get("/v3/direction/distance", params=params)
            distance_result = DistanceMatrixResult(**response)
            self.logger.debug(f"距离矩阵计算成功: {len(origins)}个起点 -> {len(destinations)}个终点")
            return distance_result
        except Exception as e:
            self.logger.error(f"距离矩阵计算失败: {len(origins)}个起点 -> {len(destinations)}个终点, 错误: {str(e)}")
            raise
