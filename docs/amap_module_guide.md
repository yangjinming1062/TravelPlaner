# Amap (高德地图) SDK 模块

## 目录

- [模块概述](#模块概述)
- [核心特性](#核心特性)
- [架构设计](#架构设计)
- [快速上手](#快速上手)
- [核心组件详解](#核心组件详解)
  - [`AMapSDK`](#amapsdk)
  - [`AmapClient`](#amapclient)
- [服务接口详解](#服务接口详解)
  - [地理编码服务 (GeocodingService)](#地理编码服务-geocodingservice)
  - [路径规划服务 (RoutingService)](#路径规划服务-routingservice)
  - [搜索服务 (SearchService)](#搜索服务-searchservice)
  - [天气服务 (WeatherService)](#天气服务-weatherservice)
  - [静态地图服务 (StaticMapsService)](#静态地图服务-staticmapsservice)
- [数据结构 (Schemas)](#数据结构-schemas)
- [枚举类型 (Enums)](#枚举类型-enums)
- [异常处理](#异常处理)
- [配置](#配置)

## 模块概述

[amap](backend/modules/amap) 模块是一个功能全面、异步优先的高德地图 API Python SDK。它封装了高德开放平台的常用服务，旨在为开发者提供一个现代化、健壮且易于使用的接口，以便在项目中快速集成地理信息功能。

本模块支持的功能包括：
- **地理/逆地理编码**：地址与经纬度坐标之间的相互转换。
- **路径规划**：支持驾车、步行、骑行、公交等多种出行方式的路线规划。
- **POI 搜索**：关键字搜索、周边搜索、多边形搜索等。
- **天气查询**：获取实时天气和天气预报。
- **静态地图**：生成包含标记、路径的静态地图图片。

## 核心特性

- **异步优先**: 基于 `aiohttp` 实现全异步 I/O，性能卓越，适合高并发场景。
- **请求队列与速率控制**: 内置请求队列和令牌桶速率限制器，有效避免因超出高德 API QPS（每秒查询率）限制而导致的请求失败。
- **自动重试**: 对因配额问题导致的临时性 API 错误（如 `10021`, `10022`）进行自动、带延迟的重试，提升系统健壮性。
- **类型安全**: 全面使用 Pydantic 模型定义 API 的请求和响应数据结构，提供自动数据校验和清晰的 IDE 提示。
- **模块化设计**: 功能按服务（Service）划分，结构清晰，易于扩展和维护。
- **统一入口**: 通过 `AMapSDK` 类提供所有服务的统一访问入口，简化使用。
- **上下文管理**: 支持 `async with` 语法，自动管理客户端会话和后台任务的生命周期。

## 架构设计

本模块采用分层设计，各组件职责分明：

1.  **`AMapSDK` (主入口)**:
    -   顶层封装，作为用户与 SDK 交互的主要接口。
    -   在初始化时，创建并持有一个 `AmapClient` 实例和所有服务（如 `GeocodingService`, `RoutingService`）的实例。
    -   将服务实例作为自己的属性，方便用户调用（例如 `sdk.geocoding.geocode(...)`）。

2.  **`AmapClient` (核心客户端)**:
    -   负责所有与高德 API 的底层通信。
    -   管理 `aiohttp.ClientSession`，执行异步 HTTP 请求。
    -   内置 `AmapRequestQueue` (请求队列) 和 `RateLimiter` (速率控制器)。
    -   一个后台 `worker` 任务从队列中取出请求，在遵循速率限制的前提下执行它们。
    -   处理通用的 API 参数（如 `key`, `sig`）、构造 URL、以及解析和验证响应。
    -   实现错误处理和自动重试逻辑。

3.  **`*Service` (服务层)**:
    -   按功能划分的业务逻辑层，如 `GeocodingService`, `RoutingService` 等。
    -   每个服务都持有一个 `AmapClient` 实例，并使用它来发送请求。
    -   定义了与具体业务功能对应的方法（如 `geocode`, `driving_route`）。
    -   负责准备特定 API 端点的请求参数，并调用 `AmapClient` 的 `get` 或 `post` 方法。
    -   将返回的原始数据解析为对应的 Pydantic `Schema` 对象，返回给调用者。

4.  **`Schemas` (数据模型)**:
    -   使用 Pydantic `BaseModel` 定义了所有 API 的响应数据结构（如 `GeocodingResult`, `RoutePath`）。
    -   提供了数据验证、类型转换和清晰的数据访问接口。

5.  **`Enums` (枚举)**:
    -   定义了 API 中使用的常量参数（如 `RouteType`, `WeatherType`），使代码更具可读性和健壮性。

**工作流程**:
用户调用 `AMapSDK` 的某个服务方法 -> 该方法准备参数并调用 `AmapClient` -> `AmapClient` 将请求封装成 `AmapRequest` 对象放入队列 -> 后台 `worker` 从队列中获取请求 -> `worker` 通过速率限制器检查 -> `worker` 发送 HTTP 请求 -> `worker` 收到响应并存入结果字典 -> 服务方法从结果字典中获取结果 -> 服务方法将结果解析为 `Schema` 对象并返回给用户。

## 快速上手

以下是一个简单的示例，演示如何初始化 SDK 并进行一次地理编码查询。

```python
import asyncio
import logging
from modules.amap import AMapSDK, Location

# 假设项目配置已加载
# from config import CONFIG

async def main():
    # 推荐使用 async with 来管理 SDK 的生命周期
    async with AMapSDK(logger=logging.getLogger("amap_test")) as sdk:
        try:
            # 1. 地理编码：将地址转换为坐标
            address = "北京市朝阳区阜通东大街6号"
            geocoding_results = await sdk.geocoding.geocode(address=address, city="北京")
            if geocoding_results:
                first_result = geocoding_results[0]
                print(f"地址 '{address}' 的坐标是: {first_result.location}")

                # 2. 逆地理编码：将坐标转换为地址
                location = first_result.location
                reverse_result = await sdk.geocoding.reverse_geocode(location=location)
                if reverse_result:
                    print(f"坐标 {location} 的地址是: {reverse_result.formatted_address}")

            # 3. 驾车路径规划
            origin = Location(longitude=116.481488, latitude=39.990464) # 望京SOHO
            destination = Location(longitude=116.403963, latitude=39.915119) # 天安门
            route_result = await sdk.routing.driving_route(origin=origin, destination=destination)
            if route_result and route_result.paths:
                path = route_result.paths[0]
                print(f"从望京SOHO到天安门的驾车距离: {path.distance / 1000:.2f} 公里, "
                      f"预计耗时: {path.duration / 60:.0f} 分钟")

        except Exception as e:
            print(f"发生错误: {e}")

if __name__ == "__main__":
    # 配置日志
    logging.basicConfig(level=logging.DEBUG)
    asyncio.run(main())
```

## 核心组件详解

### `AMapSDK`

这是与 SDK 交互的主类。

- **初始化**: `AMapSDK(logger, **kwargs)`
  - `logger`: 一个标准的 `logging.Logger` 实例，用于记录 SDK 内部日志。
  - `**kwargs`: 其他参数将传递给 `AmapClient`，通常用于覆盖从 `config` 文件加载的默认配置。
- **上下文管理**:
  - `async with AMapSDK(...) as sdk:`: 这是推荐的使用方式。进入上下文时，它会自动启动后台的请求处理任务；退出时，会安全地停止后台任务并关闭网络会z话。
- **服务访问**:
  - 初始化后，可以通过 `sdk.<service_name>` 的方式访问各个服务，例如：
    - `sdk.geocoding`: 地理编码服务
    - `sdk.routing`: 路径规划服务
    - `sdk.search`: 搜索服务
    - `sdk.weather`: 天气服务
    - `sdk.staticmaps`: 静态地图服务

### `AmapClient`

`AmapClient` 是 SDK 的引擎，处理所有底层的复杂性。开发者通常不需要直接与它交互，但了解其工作原理有助于更好地使用 SDK。

- **请求处理**: 所有 `*Service` 的请求都会被 `AmapClient` 放入一个内部的异步队列中。
- **后台任务 (`worker`)**: 一个独立的 `asyncio.Task` 在后台运行，持续从队列中消费请求。
- **速率控制**: 在发送每个请求之前，`worker` 会检查 `RateLimiter`。如果当前请求速率超过了配置的阈值（`amap_max_requests_per_second`），`worker` 会异步等待，直到可以发送下一个请求为止。
- **错误与重试**: 如果 API 返回特定的可重试错误码（通常与 QPS 或配额有关），`AmapClient` 会在延迟一段时间后（指数退避策略），将该请求重新放回队列的末尾，以便稍后重试。

## 服务接口详解

所有服务方法都是异步的 (`async def`)。

### 地理编码服务 (GeocodingService)

- **`geocode(address, city=None)`**: 将结构化的地址信息转换为经纬度坐标。
- **`reverse_geocode(location, radius=None)`**: 将经纬度坐标转换为结构化地址信息。
- **`batch_geocode(addresses, city=None)`**: 批量进行地理编码（最多20个地址）。
- **`batch_reverse_geocode(locations, radius=None)`**: 批量进行逆地理编码（最多20个坐标）。

### 路径规划服务 (RoutingService)

- **`driving_route(origin, destination, strategy, waypoints=None)`**: 驾车路径规划。
- **`walking_route(origin, destination)`**: 步行路径规划。
- **`bicycling_route(origin, destination)`**: 骑行路径规划。
- **`electrobike_route(origin, destination)`**: 电动车路径规划。
- **`transit_route(origin, destination, city, strategy)`**: 公交路径规划。
- **`distance_matrix(origins, destinations, route_type)`**: 计算多个起点和终点之间的距离矩阵（最多10x10）。

### 搜索服务 (SearchService)

- **`text_search(keywords, region=None, page=1, offset=20)`**: 根据关键字搜索 POI (兴趣点)。
- **`nearby_search(location, keywords=None, types=None, radius=1000)`**: 搜索指定中心点周边的 POI。
- **`polygon_search(polygon, keywords=None, types=None)`**: 在指定多边形区域内搜索 POI。
- **`poi_detail(poi_id)`**: 获取指定 POI 的详细信息。
- **`category_search(category, region=None)`**: 根据分类搜索 POI。

### 天气服务 (WeatherService)

- **`get_weather(city, weather_type, extensions)`**: 获取天气信息，可以是实时或预报。
- **`get_live_weather(city)`**: 获取实时天气。
- **`get_forecast_weather(city, extensions)`**: 获取预报天气。
- **`batch_weather_query(cities, weather_type)`**: 批量查询多个城市的天气（通过并发实现）。

### 静态地图服务 (StaticMapsService)

- **`generate_static_map(request)`**: 根据详细的 `StaticMapRequest` 参数生成静态地图。
- **`simple_map(center, zoom, size, markers=None)`**: 快速生成一个带中心点和可选标记的简单地图。
- **`route_map(route_points, size, start_marker=None, end_marker=None)`**: 生成一张包含指定路径的地图。
- **`poi_map(pois, size, auto_zoom=True)`**: 生成一张标记了多个 POI 的地图。

## 数据结构 (Schemas)

模块使用 Pydantic 模型来定义所有数据结构，这些模型位于 `modules/amap/schemas.py`。这为您提供了强大的类型提示和数据验证能力。

**主要数据模型示例**:
- `Location`: 表示一个经纬度坐标，包含 `longitude` 和 `latitude` 字段。
- `GeocodingResult`: 地理编码结果，包含 `formatted_address` 和 `location`。
- `ReverseGeocodingResult`: 逆地理编码结果，包含 `formatted_address` 和 `address_component`。
- `PoiDetail`: POI 详细信息，包含 `id`, `name`, `type`, `location`, `address` 等。
- `RoutePath`: 一条规划好的路径，包含 `distance`, `duration`, `strategy`, `steps` (步骤列表) 等。
- `LiveWeather`: 实时天气信息。
- `ForecastWeather`: 天气预报信息。

**使用示例**:
```python
# route_result 是从 driving_route 返回的对象
if route_result and route_result.paths:
    path = route_result.paths[0]
    print(f"距离: {path.distance} 米")
    for step in path.steps:
        print(f"- {step.instruction}")
```

## 枚举类型 (Enums)

为了提高代码的可读性和防止参数错误，模块在 `modules/amap/enums.py` 中定义了大量的枚举类型。

**常用枚举示例**:
- `RouteType`: 路径规划类型 (`DRIVING`, `WALKING`, `TRANSIT`, ...)。
- `RoutingStrategy`: 路径规划策略 (`FASTEST`, `SHORTEST`, `AVOID_CONGESTION`, ...)。
- `WeatherType`: 天气查询类型 (`LIVE`, `FORECAST`)。
- `PoiType`: POI 类型分类 (`DINING`, `SHOPPING`, `SCENIC_SPOT`, ...)。
- `StaticMapSize`: 预设的静态地图尺寸。

**使用示例**:
```python
from modules.amap.enums import RoutingStrategy

# 使用枚举指定策略，而不是硬编码的字符串 "0"
route_result = await sdk.routing.driving_route(
    origin=...,
    destination=...,
    strategy=RoutingStrategy.FASTEST
)
```

## 异常处理

当 API 请求失败或发生其他错误时，SDK 会抛出 `AmapAPIException` 异常。

- **`AmapAPIException`**:
  - `message`: 错误的描述信息。
  - `status_code`: 高德 API 返回的状态码 (`status` 字段)。
  - `info_code`: 高德 API 返回的信息码 (`infocode` 字段)。

建议在调用 SDK 方法时使用 `try...except` 块来捕获此异常。

```python
from modules.amap.client import AmapAPIException

try:
    result = await sdk.geocoding.geocode("一个无效的地址")
except AmapAPIException as e:
    print(f"API 请求失败: {e.message}, status: {e.status_code}, infocode: {e.info_code}")
```

## 配置

SDK 的行为通过项目的全局配置进行控制。相关配置项通常定义在 `config.py` 或 `config.yaml` 中，主要包括：

- `amap_key`: **必需**，您的高德地图 API Key。
- `amap_sig`: (可选) 数字签名密钥，用于增强安全性。
- `amap_base_url`: API 的基础 URL，默认为 `https://restapi.amap.com`。
- `amap_timeout`: 请求超时时间（秒）。
- `amap_retry_count`: 失败后重试的最大次数。
- `amap_retry_delay`: 每次重试的基础延迟时间。
- `amap_max_requests_per_second`: 客户端每秒最大请求数，用于速率控制。
