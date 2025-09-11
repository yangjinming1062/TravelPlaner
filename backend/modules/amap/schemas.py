from typing import Any

from pydantic import BaseModel
from pydantic import Field
from pydantic import field_validator


# region 基础数据结构


class AmapResponse(BaseModel):
    """高德API通用响应结构"""

    status: str = Field(..., description="状态码")
    info: str = Field(..., description="状态信息")
    infocode: str = Field(..., description="状态码")
    count: str | None = Field(None, description="返回结果数目")


class Location(BaseModel):
    """经纬度坐标"""

    longitude: float = Field(..., description="经度")
    latitude: float = Field(..., description="纬度")

    @field_validator("longitude", "latitude", mode="before")
    @classmethod
    def parse_coordinate(cls, v):
        """解析坐标值，支持字符串输入"""
        if isinstance(v, str):
            return float(v)
        return v

    @classmethod
    def from_string(cls, location_str: str) -> "Location":
        """从字符串创建Location对象，格式：经度,纬度"""
        if isinstance(location_str, str) and "," in location_str:
            lon_str, lat_str = location_str.split(",", 1)
            return cls(longitude=float(lon_str), latitude=float(lat_str))
        raise ValueError(f"Invalid location string format: {location_str}")

    def __str__(self) -> str:
        return f"{self.longitude},{self.latitude}"


# endregion

# region 地理编码服务


class AddressComponent(BaseModel):
    """地址组件"""

    country: str | None = Field(None, description="国家")
    province: str | None = Field(None, description="省份")
    city: str | list | None = Field(None, description="城市")
    district: str | None = Field(None, description="区县")
    township: str | None = Field(None, description="乡镇")
    street: str | None = Field(None, description="街道")
    number: str | None = Field(None, description="门牌号")
    building: str | dict | None = Field(None, description="建筑物")

    @field_validator("city", mode="before")
    @classmethod
    def parse_city(cls, v):
        """解析city字段，处理列表和字符串"""
        if isinstance(v, list):
            return v[0] if v else None
        return v

    @field_validator("building", mode="before")
    @classmethod
    def parse_building(cls, v):
        """解析building字段，处理字典和字符串"""
        if isinstance(v, dict):
            return v.get("name", str(v))
        return v


class GeocodingResult(BaseModel):
    """地理编码结果"""

    formatted_address: str = Field(..., description="格式化地址")
    location: Location = Field(..., description="经纬度坐标")
    level: str | None = Field(None, description="匹配级别")
    adcode: str | None = Field(None, description="行政区划代码")

    @field_validator("location", mode="before")
    @classmethod
    def parse_location(cls, v):
        """解析location字段，支持字符串输入"""
        if isinstance(v, str):
            return Location.from_string(v)
        return v


class ReverseGeocodingResult(BaseModel):
    """逆地理编码结果"""

    formatted_address: str = Field(..., description="格式化地址")
    address_component: AddressComponent = Field(..., description="地址组件", alias="addressComponent")
    adcode: str | None = Field(None, description="行政区划代码")
    business: str | None = Field(None, description="商圈信息")

    class Config:
        populate_by_name = True


class GeocodingResponse(AmapResponse):
    """地理编码响应"""

    geocodes: list[GeocodingResult] = Field(default_factory=list, description="地理编码结果")


class ReverseGeocodingResponse(AmapResponse):
    """逆地理编码响应"""

    regeocode: ReverseGeocodingResult | None = Field(None, description="逆地理编码结果")


# endregion

# region 搜索服务


class PoiPhoto(BaseModel):
    """POI照片"""

    title: str | None = Field(None, description="照片标题")
    url: str = Field(..., description="照片URL")


class PoiDetail(BaseModel):
    """POI详细信息"""

    id: str = Field(..., description="POI唯一标识")
    name: str = Field(..., description="POI名称")
    type: str | None = Field(None, description="POI类型")
    typecode: str | None = Field(None, description="POI类型编码")
    biz_type: str | None = Field(None, description="商户类型")
    address: str | None = Field(None, description="地址")
    location: Location = Field(..., description="经纬度坐标")
    tel: str | None = Field(None, description="电话")
    distance: str | None = Field(None, description="距离（搜索中心点）")
    business_area: str | None = Field(None, description="商圈")
    adcode: str | None = Field(None, description="行政区划代码")
    adname: str | None = Field(None, description="行政区划名称")
    photos: list[PoiPhoto] | None = Field(None, description="照片列表")
    tag: str | None = Field(None, description="标签")
    website: str | None = Field(None, description="网址")
    email: str | None = Field(None, description="邮箱")
    pcode: str | None = Field(None, description="省编码")
    pname: str | None = Field(None, description="省名称")
    citycode: str | None = Field(None, description="城市编码")
    cityname: str | None = Field(None, description="城市名称")

    @field_validator("location", mode="before")
    @classmethod
    def parse_location(cls, v):
        """解析location字段，支持字符串输入"""
        if isinstance(v, str):
            return Location.from_string(v)
        return v


class SearchResult(BaseModel):
    """搜索结果"""

    count: int = Field(..., description="结果总数")
    pois: list[PoiDetail] = Field(..., description="POI列表")
    suggestion: dict[str, Any] | None = Field(None, description="搜索建议")


class SearchResponse(AmapResponse):
    """搜索响应"""

    pois: list[PoiDetail] = Field(default_factory=list, description="POI列表")
    suggestion: dict[str, Any] | None = Field(None, description="搜索建议")


# endregion

# region 路径规划服务


class RouteStep(BaseModel):
    """路径步骤"""

    instruction: str = Field(..., description="导航指令")
    orientation: str | None = Field(None, description="方向")
    distance: int | None = Field(None, description="距离（米）")
    duration: int | None = Field(None, description="耗时（秒）")
    polyline: str | None = Field(None, description="路径坐标串")
    action: str | None = Field(None, description="动作")
    assistant_action: str | None = Field(None, description="辅助动作")
    step_distance: str | None = Field(None, description="步骤距离（高德API字段）")

    @field_validator("distance", mode="before")
    @classmethod
    def parse_distance(cls, v):
        """解析distance字段，支持字符串输入"""
        if isinstance(v, str):
            try:
                return int(v)
            except ValueError:
                return None
        return v

    @field_validator("duration", mode="before")
    @classmethod
    def parse_duration(cls, v):
        """解析duration字段，支持字符串输入"""
        if isinstance(v, str):
            try:
                return int(v)
            except ValueError:
                return None
        return v

    @field_validator("action", mode="before")
    @classmethod
    def parse_action(cls, v):
        """解析action字段，处理空数组情况"""
        if isinstance(v, list) and len(v) == 0:
            return None
        return v

    @field_validator("assistant_action", mode="before")
    @classmethod
    def parse_assistant_action(cls, v):
        """解析assistant_action字段，处理空数组情况"""
        if isinstance(v, list) and len(v) == 0:
            return None
        return v

    @field_validator("orientation", mode="before")
    @classmethod
    def parse_orientation(cls, v):
        """解析orientation字段，处理空数组情况"""
        if isinstance(v, list) and len(v) == 0:
            return None
        return v


class RoutePath(BaseModel):
    """路径信息"""

    distance: int | None = Field(None, description="总距离（米）")
    duration: int | None = Field(None, description="总耗时（秒）")
    strategy: str | None = Field(None, description="导航策略")
    tolls: int | None = Field(None, description="收费（元）")
    toll_distance: int | None = Field(None, description="收费路段距离（米）")
    restriction: int | None = Field(None, description="限行状态")
    steps: list[RouteStep] = Field(default_factory=list, description="路径步骤")
    polyline: str | None = Field(None, description="完整路径坐标串")

    @field_validator("distance", mode="before")
    @classmethod
    def parse_distance(cls, v):
        """解析distance字段，支持字符串输入"""
        if isinstance(v, str):
            try:
                return int(v)
            except ValueError:
                return None
        return v

    @field_validator("duration", mode="before")
    @classmethod
    def parse_duration(cls, v):
        """解析duration字段，支持字符串输入"""
        if isinstance(v, str):
            try:
                return int(v)
            except ValueError:
                return None
        return v


class RouteResult(BaseModel):
    """路径规划结果"""

    origin: str = Field(..., description="起点坐标")
    destination: str = Field(..., description="终点坐标")
    paths: list[RoutePath] = Field(default_factory=list, description="路径列表")
    count: int | None = Field(None, description="路径数量")
    taxi_cost: str | None = Field(None, description="出租车费用（元）")

    @field_validator("count", mode="before")
    @classmethod
    def parse_count(cls, v):
        """解析count字段，支持字符串输入"""
        if isinstance(v, str):
            try:
                return int(v)
            except ValueError:
                return None
        return v


class RouteResponse(AmapResponse):
    """路径规划响应"""

    route: RouteResult | None = Field(None, description="路径规划结果")


class DistanceElement(BaseModel):
    """距离元素"""

    origin_index: str | None = Field(None, description="起点索引")
    destination_index: str | None = Field(None, description="终点索引")
    distance: str | None = Field(None, description="距离，单位：米")
    duration: str | None = Field(None, description="时间，单位：秒")
    status: str | None = Field(None, description="状态信息")


class DistanceMatrixResult(BaseModel):
    """距离矩阵结果"""

    status: str = Field(description="状态码")
    info: str = Field(description="状态信息")
    infocode: str = Field(description="状态码")
    origin_count: str | None = Field(None, description="起点数量")
    destination_count: str | None = Field(None, description="终点数量")
    results: list[DistanceElement] = Field(default_factory=list, description="距离矩阵详情")


class TransitStep(BaseModel):
    """公交步骤"""

    instruction: str = Field(..., description="导航文字")
    distance: int = Field(..., description="距离（米）")
    duration: int = Field(..., description="耗时（秒）")
    polyline: str | None = Field(None, description="路径坐标串")
    walking: dict[str, Any] | None = Field(None, description="步行信息")
    bus: dict[str, Any] | None = Field(None, description="公交信息")
    railway: dict[str, Any] | None = Field(None, description="地铁信息")


class TransitPath(BaseModel):
    """公交路径"""

    distance: int = Field(..., description="总距离（米）")
    duration: int = Field(..., description="总耗时（秒）")
    walking_distance: int = Field(..., description="步行距离（米）")
    cost: float | None = Field(None, description="费用（元）")
    steps: list[TransitStep] = Field(..., description="公交步骤")


class TransitResult(BaseModel):
    """公交路径规划结果"""

    origin: str = Field(..., description="起点坐标")
    destination: str = Field(..., description="终点坐标")
    transits: list[TransitPath] = Field(..., description="公交路径列表")
    count: int = Field(..., description="路径数量")


class TransitResponse(AmapResponse):
    """公交路径响应"""

    route: TransitResult | None = Field(None, description="公交路径结果")


# endregion

# region 天气服务


class LiveWeather(BaseModel):
    """实时天气"""

    province: str = Field(..., description="省份")
    city: str = Field(..., description="城市")
    adcode: str = Field(..., description="行政区编码")
    weather: str = Field(..., description="天气现象")
    temperature: str = Field(..., description="实时气温")
    winddirection: str = Field(..., description="风向")
    windpower: str = Field(..., description="风力等级")
    humidity: str = Field(..., description="空气湿度")
    reporttime: str = Field(..., description="数据发布时间")


class ForecastWeather(BaseModel):
    """天气预报"""

    date: str | None = Field(None, description="日期")
    week: str | None = Field(None, description="星期")
    dayweather: str | None = Field(None, description="白天天气现象")
    nightweather: str | None = Field(None, description="夜晚天气现象")
    daytemp: str | None = Field(None, description="白天温度")
    nighttemp: str | None = Field(None, description="夜晚温度")
    daywind: str | None = Field(None, description="白天风向")
    nightwind: str | None = Field(None, description="夜晚风向")
    daypower: str | None = Field(None, description="白天风力")
    nightpower: str | None = Field(None, description="夜晚风力")


class WeatherResult(BaseModel):
    """天气查询结果"""

    province: str | None = Field(None, description="省份")
    city: str | None = Field(None, description="城市")
    adcode: str | None = Field(None, description="行政区编码")
    lives: list[LiveWeather] | None = Field(None, description="实时天气")
    forecasts: list[ForecastWeather] | None = Field(None, description="天气预报")


class ForecastData(BaseModel):
    """预报数据容器"""

    province: str | None = Field(None, description="省份")
    city: str | None = Field(None, description="城市")
    adcode: str | None = Field(None, description="行政区编码")
    reporttime: str | None = Field(None, description="报告时间")
    casts: list[ForecastWeather] | None = Field(None, description="预报列表")


class WeatherResponse(AmapResponse):
    """天气响应"""

    lives: list[LiveWeather] | None = Field(None, description="实时天气")
    forecasts: list[ForecastData] | None = Field(None, description="预报天气数据")

    @field_validator("lives", mode="before")
    @classmethod
    def parse_lives(cls, v):
        """解析实时天气数据，处理空列表情况"""
        if isinstance(v, list):
            if not v:  # 空列表
                return None
            # 过滤掉无效的条目
            valid_lives = []
            for item in v:
                if isinstance(item, dict) and item:  # 非空字典
                    valid_lives.append(item)
            return valid_lives if valid_lives else None
        return v

    # 为了向后兼容，也支持直接的forecasts字段
    @field_validator("forecasts", mode="before")
    @classmethod
    def parse_forecasts(cls, v):
        """解析预报数据，支持不同的数据结构"""
        if isinstance(v, list) and v:
            # 检查第一个元素是否包含casts字段
            first_item = v[0]
            if isinstance(first_item, dict) and "casts" in first_item:
                # 高德API的预报天气响应格式
                return [ForecastData(**item) for item in v]
            else:
                # 直接的ForecastWeather列表格式
                return [ForecastData(casts=v)]
        return v


# endregion

# region 静态地图服务


class StaticMapMarker(BaseModel):
    """静态地图标记"""

    location: Location = Field(..., description="标记位置")
    label: str | None = Field(None, description="标记标签")
    color: str | None = Field(None, description="标记颜色")
    size: str | None = Field(None, description="标记大小")

    @field_validator("location", mode="before")
    @classmethod
    def parse_location(cls, v):
        """解析location字段，支持字符串输入"""
        if isinstance(v, str):
            return Location.from_string(v)
        return v


class StaticMapPath(BaseModel):
    """静态地图路径"""

    points: list[Location] = Field(..., description="路径点列表")
    color: str | None = Field(None, description="路径颜色")
    weight: int | None = Field(None, description="路径粗细")
    opacity: float | None = Field(None, description="路径透明度")

    @field_validator("points", mode="before")
    @classmethod
    def parse_points(cls, v):
        """解析路径点列表，支持字符串输入"""
        if isinstance(v, list):
            parsed_points = []
            for point in v:
                if isinstance(point, str):
                    parsed_points.append(Location.from_string(point))
                else:
                    parsed_points.append(point)
            return parsed_points
        return v


class StaticMapRequest(BaseModel):
    """静态地图请求"""

    center: Location | None = Field(None, description="地图中心点")
    zoom: int | None = Field(None, description="缩放级别")
    size: str = Field(..., description="地图尺寸")
    maptype: str | None = Field(None, description="地图类型")
    markers: list[StaticMapMarker] | None = Field(None, description="标记列表")
    paths: list[StaticMapPath] | None = Field(None, description="路径列表")
    scale: int | None = Field(None, description="地图比例")

    @field_validator("center", mode="before")
    @classmethod
    def parse_center(cls, v):
        """解析中心点，支持字符串输入"""
        if isinstance(v, str):
            return Location.from_string(v)
        return v


class StaticMapResult(BaseModel):
    """静态地图结果"""

    status: str = Field(description="状态信息")
    format: str = Field(description="图片格式")
    size: str | None = Field(None, description="图片尺寸")
    data: str | bytes = Field(description="图片数据，base64编码的字符串或二进制数据")
    content_type: str | None = Field(None, description="内容类型")
    url: str | None = Field(None, description="图片URL（如果有）")


# endregion
