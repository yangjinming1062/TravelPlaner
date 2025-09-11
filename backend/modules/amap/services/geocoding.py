from ..client import AmapClient
from ..enums import *
from ..schemas import *


class GeocodingService:
    """
    地理编码服务
    """

    def __init__(self, client: AmapClient, logger):
        self.client = client
        self.logger = logger

    async def geocode(
        self, address: str, city: str | None = None, extensions: Extensions = Extensions.BASE, coordsys: CoordinateType = CoordinateType.GCJ02
    ) -> list[GeocodingResult]:
        """
        地理编码：将地址转换为经纬度坐标

        Args:
            address: 结构化地址信息
            city: 指定查询的城市，可选项包括：城市中文、中文全拼、citycode、adcode
            extensions: 返回结果控制，可选值：base(基础信息)/all(全部信息)
            coordsys: 坐标系类型，可选值：gcj02(高德坐标)/wgs84(GPS坐标)

        Returns:
            地理编码结果列表

        Raises:
            AmapAPIException: API调用失败时
        """
        params = {"address": address, "city": city, "extensions": extensions.value, "coordsys": coordsys.value}

        try:
            response = await self.client.get("/v3/geocode/geo", params=params)
            geocoding_response = GeocodingResponse(**response)
            self.logger.debug(f"地理编码成功: {address} -> {len(geocoding_response.geocodes)}个结果")
            return geocoding_response.geocodes
        except Exception as e:
            self.logger.error(f"地理编码失败: {address}, 错误: {str(e)}")
            raise

    async def reverse_geocode(
        self,
        location: Location | str,
        radius: int | None = None,
        extensions: Extensions = Extensions.BASE,
        roadlevel: int | None = None,
        homeorcorp: int | None = None,
    ) -> ReverseGeocodingResult | None:
        """
        逆地理编码：将经纬度坐标转换为地址信息

        Args:
            location: 经纬度坐标，格式：经度,纬度
            radius: 搜索半径，单位：米，取值范围：0~3000，默认1000
            extensions: 返回结果控制，可选值：base(基础信息)/all(全部信息)
            roadlevel: 道路等级，可选值：0(所有道路)/1(高速公路+城市快速路)/2(含以上道路+国道)/3(含以上道路+省道)
            homeorcorp: 是否优化POI返回顺序，可选值：0(不优化)/1(家和公司优化)

        Returns:
            逆地理编码结果，如果没有找到则返回None

        Raises:
            AmapAPIException: API调用失败时
        """
        # 处理location参数
        location_str = str(location) if isinstance(location, Location) else location
        params = {"location": location_str, "radius": radius, "extensions": extensions.value, "roadlevel": roadlevel, "homeorcorp": homeorcorp}
        try:
            response = await self.client.get("/v3/geocode/regeo", params=params)
            reverse_response = ReverseGeocodingResponse(**response)
            self.logger.debug(f"逆地理编码成功: {location_str}")
            return reverse_response.regeocode
        except Exception as e:
            self.logger.error(f"逆地理编码失败: {location_str}, 错误: {str(e)}")
            raise

    async def batch_geocode(
        self, addresses: list[str], city: str | None = None, extensions: Extensions = Extensions.BASE
    ) -> list[list[GeocodingResult]]:
        """
        批量地理编码

        Args:
            addresses: 地址列表，最多20个
            city: 指定查询的城市
            extensions: 返回结果控制

        Returns:
            批量地理编码结果，每个地址对应一个结果列表

        Raises:
            AmapAPIException: API调用失败时
            ValueError: 地址列表为空或超过20个时
        """
        if not addresses:
            raise ValueError("地址列表不能为空")
        if len(addresses) > 20:
            raise ValueError("批量地理编码一次最多支持20个地址")
        # 使用|分隔多个地址
        address_str = "|".join(addresses)
        params = {"address": address_str, "city": city, "extensions": extensions.value, "batch": "true"}
        try:
            response = await self.client.get("/v3/geocode/geo", params=params)
            geocoding_response = GeocodingResponse(**response)
            # 按地址数量分组结果
            results = []
            geocodes = geocoding_response.geocodes
            # 高德API的批量接口返回结果的顺序与输入顺序对应
            # 如果某个地址没有找到结果，对应位置可能为空
            per_address_count = len(geocodes) // len(addresses) if geocodes else 0
            for i in range(len(addresses)):
                start_idx = i * per_address_count
                end_idx = (i + 1) * per_address_count
                address_results = geocodes[start_idx:end_idx] if geocodes else []
                results.append(address_results)
            self.logger.debug(f"批量地理编码成功: {len(addresses)}个地址")
            return results
        except Exception as e:
            self.logger.error(f"批量地理编码失败: {len(addresses)}个地址, 错误: {str(e)}")
            raise

    async def batch_reverse_geocode(
        self, locations: list[Location | str], radius: int | None = None, extensions: Extensions = Extensions.BASE
    ) -> list[ReverseGeocodingResult | None]:
        """
        批量逆地理编码

        Args:
            locations: 坐标列表，最多20个
            radius: 搜索半径
            extensions: 返回结果控制

        Returns:
            批量逆地理编码结果列表

        Raises:
            AmapAPIException: API调用失败时
            ValueError: 坐标列表为空或超过20个时
        """
        if not locations:
            raise ValueError("坐标列表不能为空")
        if len(locations) > 20:
            raise ValueError("批量逆地理编码一次最多支持20个坐标")
        # 转换坐标格式并用|分隔
        location_strs = []
        for location in locations:
            if isinstance(location, Location):
                location_strs.append(str(location))
            else:
                location_strs.append(location)
        location_str = "|".join(location_strs)
        params = {"location": location_str, "radius": radius, "extensions": extensions.value, "batch": "true"}
        try:
            response = await self.client.get("/v3/geocode/regeo", params=params)
            # 解析响应 - 批量逆地理编码返回格式可能不同
            # 这里需要根据实际API响应格式来调整
            if "regeocodes" in response:
                # 批量返回格式
                regeocodes = response.get("regeocodes", [])
                results = []
                for regeocode_data in regeocodes:
                    if regeocode_data:
                        try:
                            result = ReverseGeocodingResult(**regeocode_data)
                            results.append(result)
                        except Exception:
                            results.append(None)
                    else:
                        results.append(None)
                return results
            else:
                # 单个返回格式
                reverse_response = ReverseGeocodingResponse(**response)
                return [reverse_response.regeocode] if reverse_response.regeocode else [None]
        except Exception as e:
            self.logger.error(f"批量逆地理编码失败: {len(locations)}个坐标, 错误: {str(e)}")
            raise
