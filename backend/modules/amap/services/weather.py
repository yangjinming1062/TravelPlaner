from ..client import AmapClient
from ..enums import *
from ..schemas import *


class WeatherService:
    """
    天气服务
    """

    def __init__(self, client: AmapClient, logger):
        self.client = client
        self.logger = logger

    async def get_weather(
        self, city: str, weather_type: WeatherType = WeatherType.LIVE, extensions: Extensions = Extensions.BASE
    ) -> WeatherResult | None:
        """
        获取天气信息

        Args:
            city: 城市编码，adcode，支持县级以上（包括县级）行政区
                  可输入城市中文名、citycode、adcode
            weather_type: 天气查询类型，live(实况天气)/forecast(预报天气)
            extensions: 预报天气时可选值：base(当天天气)/all(当天+未来3天天气)
                       实况天气时此参数无效

        Returns:
            天气查询结果，失败时返回None

        Raises:
            AmapAPIException: API调用失败时
        """
        params = {"city": city, "extensions": extensions.value if weather_type == WeatherType.FORECAST else None}

        # 根据天气类型选择不同的API端点
        if weather_type == WeatherType.LIVE:
            endpoint = "/v3/weather/weatherInfo"
        else:
            endpoint = "/v3/weather/weatherInfo"

        # 实况天气和预报天气使用相同端点，通过extensions参数区分
        if weather_type == WeatherType.LIVE:
            params["extensions"] = "base"
        else:
            # forecast类型已经在上面设置了extensions参数
            pass

        try:
            response = await self.client.get(endpoint, params=params)

            # 解析响应
            weather_response = WeatherResponse(**response)

            # 构造天气结果
            if weather_type == WeatherType.LIVE and weather_response.lives:
                # 实况天气
                live_weather = weather_response.lives[0]
                result = WeatherResult(
                    province=live_weather.province, city=live_weather.city, adcode=live_weather.adcode, lives=weather_response.lives, forecasts=None
                )
                self.logger.debug(f"实况天气获取成功: {city} -> {live_weather.weather} {live_weather.temperature}°C")
            elif weather_type == WeatherType.FORECAST and weather_response.forecasts:
                # 预报天气 - 从响应的基础信息中获取城市信息
                forecast_data = weather_response.forecasts[0] if weather_response.forecasts else None
                if forecast_data:
                    # 展开预报数据中的casts
                    all_forecasts = forecast_data.casts if forecast_data.casts else []
                    result = WeatherResult(
                        province=forecast_data.province or "",
                        city=forecast_data.city or "",
                        adcode=forecast_data.adcode or "",
                        lives=None,
                        forecasts=all_forecasts,
                    )
                    self.logger.debug(f"预报天气获取成功: {city} -> {len(all_forecasts)}天预报")
                else:
                    result = None
            else:
                result = None

            return result

        except Exception as e:
            self.logger.error(f"天气信息获取失败: {city}, 类型: {weather_type.value}, 错误: {str(e)}")
            raise

    async def get_live_weather(self, city: str) -> LiveWeather | None:
        """
        获取实况天气

        Args:
            city: 城市编码，支持citycode、adcode、中文名

        Returns:
            实况天气信息，失败时返回None

        Raises:
            AmapAPIException: API调用失败时
        """
        try:
            result = await self.get_weather(city, WeatherType.LIVE)
            if result and result.lives:
                return result.lives[0]
            return None
        except Exception as e:
            self.logger.error(f"实况天气获取失败: {city}, 错误: {str(e)}")
            raise

    async def get_forecast_weather(self, city: str, extensions: Extensions = Extensions.ALL) -> list[ForecastWeather]:
        """
        获取预报天气

        Args:
            city: 城市编码，支持citycode、adcode、中文名
            extensions: 返回数据的详细程度，base(当天)/all(当天+未来3天)

        Returns:
            预报天气信息列表，失败时返回空列表

        Raises:
            AmapAPIException: API调用失败时
        """
        try:
            result = await self.get_weather(city, WeatherType.FORECAST, extensions)
            if result and result.forecasts:
                return result.forecasts
            return []
        except Exception as e:
            self.logger.error(f"预报天气获取失败: {city}, 错误: {str(e)}")
            raise

    async def get_weather_by_location(
        self, adcode: str, weather_type: WeatherType = WeatherType.LIVE, extensions: Extensions = Extensions.BASE
    ) -> WeatherResult | None:
        """
        根据行政区代码获取天气信息

        Args:
            adcode: 行政区划代码，支持县级以上（包括县级）行政区
            weather_type: 天气查询类型
            extensions: 返回数据详细程度

        Returns:
            天气查询结果，失败时返回None

        Raises:
            AmapAPIException: API调用失败时
        """
        return await self.get_weather(adcode, weather_type, extensions)

    async def batch_weather_query(
        self, cities: list[str], weather_type: WeatherType = WeatherType.LIVE, extensions: Extensions = Extensions.BASE
    ) -> list[WeatherResult | None]:
        """
        批量查询天气信息

        Args:
            cities: 城市列表，最多支持20个城市
            weather_type: 天气查询类型
            extensions: 返回数据详细程度

        Returns:
            天气查询结果列表，对应输入城市的顺序

        Raises:
            AmapAPIException: API调用失败时
            ValueError: 城市列表为空或超过20个时
        """
        if not cities:
            raise ValueError("城市列表不能为空")

        if len(cities) > 20:
            raise ValueError("批量天气查询一次最多支持20个城市")

        results = []

        # 由于高德天气API不支持真正的批量查询，这里使用并发请求
        import asyncio

        async def get_single_weather(city: str) -> WeatherResult | None:
            try:
                return await self.get_weather(city, weather_type, extensions)
            except Exception as e:
                self.logger.warning(f"城市天气查询失败: {city}, 错误: {str(e)}")
                return None

        try:
            # 并发执行所有查询
            tasks = [get_single_weather(city) for city in cities]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            # 处理异常结果
            processed_results = []
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    self.logger.error(f"城市天气查询异常: {cities[i]}, 错误: {str(result)}")
                    processed_results.append(None)
                else:
                    processed_results.append(result)

            self.logger.debug(f"批量天气查询完成: {len(cities)}个城市")
            return processed_results

        except Exception as e:
            self.logger.error(f"批量天气查询失败: {len(cities)}个城市, 错误: {str(e)}")
            raise
