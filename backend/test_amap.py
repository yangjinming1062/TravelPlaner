import asyncio

from config import CONFIG
from modules.amap import *
from utils import get_logger


async def test_geocoding_service(sdk: AMapSDK):
    """测试地理编码服务"""
    print("\n🔍 测试地理编码服务...")

    try:
        # 测试正向地理编码
        print("  📍 测试正向地理编码：北京大学")
        results = await sdk.geocoding.geocode("北京大学")

        if results:
            result = results[0]
            print(f"    ✅ 地址: {result.formatted_address}")
            print(f"    ✅ 坐标: {result.location}")
            print(f"    ✅ 行政区代码: {result.adcode}")
            print(f"    ✅ 层级: {result.level}")
        else:
            print("    ❌ 未找到地理编码结果")
            return False

        # 测试逆向地理编码
        print("\n  📍 测试逆向地理编码：116.310003,39.992086")
        location = Location(longitude=116.310003, latitude=39.992086)
        reverse_result = await sdk.geocoding.reverse_geocode(location)

        if reverse_result:
            print(f"    ✅ 格式化地址: {reverse_result.formatted_address}")
            print(f"    ✅ 地址组件: {reverse_result.address_component}")
        else:
            print("    ❌ 逆向地理编码失败")
            return False

        return True

    except Exception as e:
        print(f"    ❌ 地理编码测试失败: {e}")
        return False


async def test_search_service(sdk: AMapSDK):
    """测试搜索服务"""
    print("\n🔍 测试POI搜索服务...")

    try:
        # 测试文本搜索
        print("  🔎 测试文本搜索：北京大学")
        search_result = await sdk.search.text_search(keywords="北京大学")

        if search_result.pois:
            poi = search_result.pois[0]
            print(f"    ✅ POI名称: {poi.name}")
            print(f"    ✅ POI地址: {poi.address}")
            print(f"    ✅ POI坐标: {poi.location}")
            print(f"    ✅ POI类型: {poi.type}")
            print(f"    ✅ 总数量: {search_result.count}")
        else:
            print("    ❌ 未找到POI搜索结果")
            return False

        # 测试周边搜索
        print("\n  🔎 测试周边搜索：天安门附近的餐厅")
        tiananmen = Location(longitude=116.397499, latitude=39.908722)
        nearby_result = await sdk.search.nearby_search(location=tiananmen, types=PoiType.DINING, radius=1000, offset=5)

        if nearby_result.pois:
            print(f"    ✅ 找到 {len(nearby_result.pois)} 个附近餐厅")
            for i, poi in enumerate(nearby_result.pois[:3], 1):
                print(f"      {i}. {poi.name} - {poi.address}")
        else:
            print("    ❌ 未找到周边搜索结果")
            return False

        return True

    except Exception as e:
        print(f"    ❌ 搜索服务测试失败: {e}")
        return False


async def test_routing_service(sdk: AMapSDK):
    """测试路径规划服务"""
    print("\n🔍 测试路径规划服务...")

    try:
        # 起点：北京大学，终点：清华大学
        origin = Location(longitude=116.310003, latitude=39.992086)  # 北京大学
        destination = Location(longitude=116.333374, latitude=40.007581)  # 清华大学

        # 测试驾车路径规划
        print("  🚗 测试驾车路径规划：北京大学 → 清华大学")
        driving_result = await sdk.routing.driving_route(origin=origin, destination=destination, strategy=RoutingStrategy.FASTEST)

        if driving_result and driving_result.paths:
            path = driving_result.paths[0]
            print(f"    ✅ 驾车距离: {path.distance}米")
            print(f"    ✅ 驾车时间: {path.duration}秒")
            print(f"    ✅ 路径策略: {path.strategy}")
            print(f"    ✅ 通行费: {path.tolls}元")
            print(f"    ✅ 出租车费用: {driving_result.taxi_cost}元")
        else:
            print("    ❌ 驾车路径规划失败")
            return False

        # 测试步行路径规划
        print("\n  🚶 测试步行路径规划：同样路线")
        walking_result = await sdk.routing.walking_route(origin, destination)

        if walking_result and walking_result.paths:
            path = walking_result.paths[0]
            print(f"    ✅ 步行距离: {path.distance}米")
            print(f"    ✅ 步行时间: {path.duration}秒")
        else:
            print("    ❌ 步行路径规划失败")
            return False

        return True

    except Exception as e:
        print(f"    ❌ 路径规划测试失败: {e}")
        return False


async def test_weather_service(sdk: AMapSDK):
    """测试天气服务"""
    print("\n🔍 测试天气服务...")

    try:
        # 测试实时天气
        print("  🌤️ 测试实时天气：北京朝阳区")
        live_weather = await sdk.weather.get_live_weather("110105")  # 朝阳区

        if live_weather:
            print(f"    ✅ 城市: {live_weather.city}")
            print(f"    ✅ 天气: {live_weather.weather}")
            print(f"    ✅ 温度: {live_weather.temperature}°C")
            print(f"    ✅ 风向: {live_weather.winddirection}")
            print(f"    ✅ 风力: {live_weather.windpower}")
            print(f"    ✅ 湿度: {live_weather.humidity}%")
            print(f"    ✅ 报告时间: {live_weather.reporttime}")
        else:
            print("    ❌ 获取实时天气失败")
            return False

        # 测试预报天气
        print("\n  📅 测试预报天气：北京朝阳区")
        forecast_result = await sdk.weather.get_weather("110105", WeatherType.FORECAST, Extensions.ALL)

        if forecast_result and forecast_result.forecasts:
            print(f"    ✅ 预报城市: {forecast_result.city}")
            print(f"    ✅ 预报省份: {forecast_result.province}")
            forecast = forecast_result.forecasts[0]
            print(f"    ✅ 日期: {forecast.date}")
            print(f"    ✅ 白天天气: {forecast.dayweather}")
            print(f"    ✅ 夜间天气: {forecast.nightweather}")
            print(f"    ✅ 白天温度: {forecast.daytemp}°C")
            print(f"    ✅ 夜间温度: {forecast.nighttemp}°C")
        else:
            print("    ❌ 获取预报天气失败")
            return False

        # 测试批量天气查询
        print("\n  🌍 测试批量天气查询：北京、上海、广州")
        cities = ["110000", "310000", "440100"]  # 北京、上海、广州
        batch_results = await sdk.weather.batch_weather_query(cities)

        city_names = ["北京", "上海", "广州"]
        for i, (city_name, weather_result) in enumerate(zip(city_names, batch_results)):
            if weather_result and weather_result.lives:
                live_weather = weather_result.lives[0]
                print(f"    ✅ {city_name}: {live_weather.weather} {live_weather.temperature}°C")
            else:
                print(f"    ❌ {city_name}: 获取失败")

        return True

    except Exception as e:
        print(f"    ❌ 天气服务测试失败: {e}")
        return False


async def test_staticmaps_service(sdk: AMapSDK):
    """测试静态地图服务"""
    print("\n🔍 测试静态地图服务...")

    try:
        # 测试简单地图生成
        print("  🗺️ 测试静态地图生成：天安门")
        center = Location(longitude=116.397499, latitude=39.908722)

        from modules.amap.enums import StaticMapSize

        result = await sdk.staticmaps.simple_map(center=center, zoom=15, size=StaticMapSize.SIZE_400_300)

        if result.status == "success":
            print(f"    ✅ 地图生成成功")
            print(f"    ✅ 格式: {result.format}")
            print(f"    ✅ 数据大小: {len(result.data or b'')} bytes")
        else:
            print("    ❌ 静态地图生成失败")
            return False

        return True

    except Exception as e:
        print(f"    ❌ 静态地图测试失败: {e}")
        return False


async def test_error_handling(sdk: AMapSDK):
    """测试错误处理"""
    print("\n🔍 测试错误处理...")

    try:
        # 测试无效地址
        print("  ❗ 测试无效地址处理")
        try:
            results = await sdk.geocoding.geocode("这是一个不存在的地址_12345")
            if not results:
                print("    ✅ 正确处理了无效地址（返回空结果）")
            else:
                print("    ⚠️ 无效地址竟然有结果")
        except Exception as e:
            print(f"    ✅ 正确抛出异常: {type(e).__name__}")

        # 测试无效城市代码
        print("  ❗ 测试无效城市代码")
        try:
            weather = await sdk.weather.get_live_weather("999999")
            if not weather:
                print("    ✅ 正确处理了无效城市代码")
        except Exception as e:
            print(f"    ✅ 正确抛出异常: {type(e).__name__}")

        return True

    except Exception as e:
        print(f"    ❌ 错误处理测试失败: {e}")
        return False


async def main():
    """主测试函数"""
    print(f"🔑 API密钥: {CONFIG.amap_key[:8]}...")
    # 创建SDK实例
    print("📦 创建AMapSDK实例...")
    try:
        async with AMapSDK(get_logger(filename="test-amap")) as sdk:
            print("✅ SDK创建成功")
            # 运行测试
            tests = [
                ("地理编码服务", test_geocoding_service),
                ("POI搜索服务", test_search_service),
                ("路径规划服务", test_routing_service),
                ("天气服务", test_weather_service),
                ("静态地图服务", test_staticmaps_service),
                ("错误处理", test_error_handling),
            ]

            passed = 0
            total = len(tests)
            for test_name, test_func in tests:
                try:
                    success = await test_func(sdk)
                    if success:
                        passed += 1
                        print(f"✅ {test_name} 测试通过")
                    else:
                        print(f"❌ {test_name} 测试失败")
                except Exception as e:
                    print(f"❌ {test_name} 测试异常: {e}")
                    import traceback

                    traceback.print_exc()

            print("\n" + "=" * 80)
            print(f"📊 测试结果: {passed}/{total} 通过")

            if passed == total:
                print("🎉 所有集成测试通过！高德API SDK功能正常")
                return True
            else:
                print("⚠️  部分测试失败，请检查网络连接和API配置")
                return False

    except Exception as e:
        print(f"❌ SDK创建失败: {e}")
        import traceback

        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("🚀 启动高德地图API集成测试...")
    success = asyncio.run(main())

    print("\n" + "=" * 80)
    if success:
        print("✅ 集成测试完成，所有功能正常工作")
    else:
        print("❌ 集成测试失败，请检查配置和网络")
    print("=" * 80)
