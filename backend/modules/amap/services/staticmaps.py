import base64
from typing import Any

from ..client import AmapClient
from ..enums import *
from ..schemas import *


class StaticMapsService:
    """
    静态地图服务
    """

    def __init__(self, client: AmapClient, logger):
        self.client = client
        self.logger = logger

    async def generate_static_map(
        self, request: StaticMapRequest, format: str = "png", traffic: int | None = None, labels: int | None = None, logo: int | None = None
    ) -> StaticMapResult:
        """
        生成静态地图

        Args:
            request: 静态地图请求参数
            format: 返回图片格式，可选值：png/jpg，默认png
            traffic: 是否显示实时交通，可选值：0(不显示)/1(显示)
            labels: 是否显示标注，可选值：0(不显示)/1(显示)
            logo: 是否显示logo，可选值：0(不显示)/1(显示)

        Returns:
            包含图片数据的字典

        Raises:
            AmapAPIException: API调用失败时
        """
        # 构建基础参数（只包含非None值）
        params = {"size": request.size}

        # 添加格式参数
        if format:
            params["format"] = format

        if traffic is not None:
            params["traffic"] = traffic

        if labels is not None:
            params["labels"] = labels

        if logo is not None:
            params["logo"] = logo

        # 添加地图中心点（高德地图API使用location参数）
        if request.center:
            params["location"] = str(request.center)  # 改为location参数

        # 添加缩放级别
        if request.zoom is not None:
            params["zoom"] = request.zoom

        # 添加地图类型
        if request.maptype:
            params["maptype"] = request.maptype

        # 添加比例
        if request.scale is not None:
            params["scale"] = request.scale

        # 添加标记点
        if request.markers:
            markers_str = self._format_markers(request.markers)
            if markers_str:
                params["markers"] = markers_str

        # 添加路径
        if request.paths:
            paths_str = self._format_paths(request.paths)
            if paths_str:
                params["paths"] = paths_str

        try:
            response = await self.client.get("/v3/staticmap", params=params)

            # 静态地图API返回的是图片数据
            if "content" in response:
                # 如果是二进制数据，进行base64编码
                image_data = response["content"]
                if isinstance(image_data, bytes):
                    image_base64 = base64.b64encode(image_data).decode("utf-8")
                    result = StaticMapResult(
                        status="success",
                        format=format,
                        size=request.size,
                        data=image_base64,
                        content_type=response.get("content_type", f"image/{format}"),
                    )
                else:
                    result = StaticMapResult(
                        status="success",
                        format=format,
                        size=request.size,
                        data=image_data,
                        content_type=response.get("content_type", f"image/{format}"),
                    )

                self.logger.debug(f"静态地图生成成功: {request.size}")
                return result
            else:
                # JSON响应格式 - 适配为 StaticMapResult
                result = StaticMapResult(
                    status="success",
                    format=format,
                    size=request.size,
                    data="",  # JSON响应时数据为空
                    content_type=f"image/{format}",
                    url=response.get("url"),  # 可能返回URL
                )
                self.logger.debug(f"静态地图生成成功: {request.size}")
                return result

        except Exception as e:
            self.logger.error(f"静态地图生成失败: {str(e)}")
            raise

    def _format_markers(self, markers: list[StaticMapMarker]) -> str:
        """
        格式化标记点参数

        Args:
            markers: 标记点列表

        Returns:
            格式化的标记点字符串
        """
        marker_strs = []

        for marker in markers:
            marker_parts = [str(marker.location)]

            if marker.size:
                marker_parts.append(f"size:{marker.size}")

            if marker.color:
                marker_parts.append(f"color:{marker.color}")

            if marker.label:
                marker_parts.append(f"label:{marker.label}")

            marker_str = "|".join(marker_parts)
            marker_strs.append(marker_str)

        return ";".join(marker_strs)

    def _format_paths(self, paths: list[StaticMapPath]) -> str:
        """
        格式化路径参数

        Args:
            paths: 路径列表

        Returns:
            格式化的路径字符串
        """
        path_strs = []

        for path in paths:
            path_parts = []

            if path.color:
                path_parts.append(f"color:{path.color}")

            if path.weight is not None:
                path_parts.append(f"weight:{path.weight}")

            if path.opacity is not None:
                path_parts.append(f"opacity:{path.opacity}")

            # 添加路径点
            points_str = "|".join([str(point) for point in path.points])
            path_parts.append(points_str)

            path_str = "|".join(path_parts)
            path_strs.append(path_str)

        return ";".join(path_strs)

    async def simple_map(
        self,
        center: Location | str,
        zoom: int = 10,
        size: StaticMapSize = StaticMapSize.SIZE_600_480,
        maptype: MapType = MapType.ROADMAP,
        markers: list[StaticMapMarker] | None = None,
    ) -> StaticMapResult:
        """
        生成简单静态地图

        Args:
            center: 地图中心点
            zoom: 缩放级别，取值范围：1-18
            size: 地图尺寸
            maptype: 地图类型
            markers: 标记点列表

        Returns:
            包含图片数据的字典

        Raises:
            AmapAPIException: API调用失败时
        """
        if isinstance(center, str):
            # 尝试解析字符串坐标
            try:
                lon, lat = center.split(",")
                center_location = Location(longitude=float(lon), latitude=float(lat))
            except (ValueError, IndexError):
                raise ValueError(f"无效的坐标格式: {center}")
        else:
            center_location = center

        request = StaticMapRequest(center=center_location, zoom=zoom, size=size.value, maptype=maptype.value, markers=markers)

        return await self.generate_static_map(request)

    async def route_map(
        self,
        route_points: list[Location | str],
        size: StaticMapSize = StaticMapSize.SIZE_800_600,
        path_color: str = "0x0000FF",
        path_weight: int = 5,
        start_marker: StaticMapMarker | None = None,
        end_marker: StaticMapMarker | None = None,
    ) -> StaticMapResult:
        """
        生成路径地图

        Args:
            route_points: 路径点列表
            size: 地图尺寸
            path_color: 路径颜色，16进制格式，如0x0000FF（蓝色）
            path_weight: 路径粗细，取值范围：1-10
            start_marker: 起点标记
            end_marker: 终点标记

        Returns:
            包含图片数据的字典

        Raises:
            AmapAPIException: API调用失败时
        """
        if not route_points:
            raise ValueError("路径点列表不能为空")

        # 转换路径点格式
        locations = []
        for point in route_points:
            if isinstance(point, str):
                try:
                    lon, lat = point.split(",")
                    location = Location(longitude=float(lon), latitude=float(lat))
                except (ValueError, IndexError):
                    raise ValueError(f"无效的坐标格式: {point}")
            else:
                location = point
            locations.append(location)

        # 创建路径
        path = StaticMapPath(points=locations, color=path_color, weight=path_weight, opacity=0.8)

        # 创建标记点
        markers = []
        if start_marker:
            markers.append(start_marker)
        else:
            # 默认起点标记
            start_marker = StaticMapMarker(location=locations[0], color="green", size="mid", label="S")
            markers.append(start_marker)

        if end_marker:
            markers.append(end_marker)
        else:
            # 默认终点标记
            end_marker = StaticMapMarker(location=locations[-1], color="red", size="mid", label="E")
            markers.append(end_marker)

        # 计算地图中心点（路径中点）
        center_lon = sum(loc.longitude for loc in locations) / len(locations)
        center_lat = sum(loc.latitude for loc in locations) / len(locations)
        center = Location(longitude=center_lon, latitude=center_lat)

        request = StaticMapRequest(
            center=center, zoom=12, size=size.value, maptype=MapType.ROADMAP.value, markers=markers, paths=[path]  # 根据路径自动调整
        )

        return await self.generate_static_map(request)

    async def poi_map(self, pois: list[dict[str, Any]], size: StaticMapSize = StaticMapSize.SIZE_600_480, auto_zoom: bool = True) -> StaticMapResult:
        """
        生成POI标记地图

        Args:
            pois: POI列表，每个POI包含location、name等信息
            size: 地图尺寸
            auto_zoom: 是否自动调整缩放级别

        Returns:
            包含图片数据的字典

        Raises:
            AmapAPIException: API调用失败时
        """
        if not pois:
            raise ValueError("POI列表不能为空")

        markers = []
        locations = []

        for i, poi in enumerate(pois):
            # 解析POI位置
            location = poi.get("location")
            if isinstance(location, str):
                try:
                    lon, lat = location.split(",")
                    location = Location(longitude=float(lon), latitude=float(lat))
                except (ValueError, IndexError):
                    continue
            elif not isinstance(location, Location):
                continue

            locations.append(location)

            # 创建标记
            marker = StaticMapMarker(location=location, label=str(i + 1), color="red", size="mid")  # 使用数字标记
            markers.append(marker)

        if not locations:
            raise ValueError("没有有效的POI坐标")

        # 计算地图中心点
        center_lon = sum(loc.longitude for loc in locations) / len(locations)
        center_lat = sum(loc.latitude for loc in locations) / len(locations)
        center = Location(longitude=center_lon, latitude=center_lat)

        # 自动计算缩放级别
        zoom = 12
        if auto_zoom and len(locations) > 1:
            # 计算坐标范围
            min_lon = min(loc.longitude for loc in locations)
            max_lon = max(loc.longitude for loc in locations)
            min_lat = min(loc.latitude for loc in locations)
            max_lat = max(loc.latitude for loc in locations)

            # 根据坐标范围计算合适的缩放级别
            lon_range = max_lon - min_lon
            lat_range = max_lat - min_lat
            max_range = max(lon_range, lat_range)

            if max_range > 1:
                zoom = 8
            elif max_range > 0.1:
                zoom = 10
            elif max_range > 0.01:
                zoom = 12
            else:
                zoom = 14

        request = StaticMapRequest(center=center, zoom=zoom, size=size.value, maptype=MapType.ROADMAP.value, markers=markers)

        return await self.generate_static_map(request)
