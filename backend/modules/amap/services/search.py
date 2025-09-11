from ..client import AmapClient
from ..enums import *
from ..schemas import *


class SearchService:
    """
    搜索服务
    """

    def __init__(self, client: AmapClient, logger):
        self.client = client
        self.logger = logger

    async def text_search(
        self,
        keywords: str,
        region: str | None = None,
        city_limit: bool = False,
        children: int | None = None,
        offset: int = 20,
        page: int = 1,
        extensions: Extensions = Extensions.BASE,
        language: Language = Language.ZH,
    ) -> SearchResult:
        """
        关键字搜索POI

        Args:
            keywords: 查询关键字，多个关键字用"|"分割
            region: 搜索区域，可以是城市中文名、中文全拼、citycode、adcode
            city_limit: 仅返回指定城市数据，默认False
            children: 是否返回子POI，可选值：1(返回子POI)/0(不返回)
            offset: 每页记录数据，强烈建议不超过25，超过25可能造成访问报错
            page: 当前页数，最大翻页数100
            extensions: 返回结果控制，base返回基本地址信息；all返回地址信息、附近POI内容、道路信息以及道路交叉口信息
            language: 返回结果语言类型，可选值：zh(中文)/en(英文)

        Returns:
            搜索结果

        Raises:
            AmapAPIException: API调用失败时
        """
        params = {
            "keywords": keywords,
            "region": region,
            "city_limit": "true" if city_limit else "false",
            "children": children,
            "offset": offset,
            "page": page,
            "extensions": extensions.value,
            "language": language.value,
        }
        try:
            response = await self.client.get("/v5/place/text", params=params)
            search_response = SearchResponse(**response)
            result = SearchResult(count=int(response.get("count", "0")), pois=search_response.pois, suggestion=search_response.suggestion)
            self.logger.debug(f"关键字搜索成功: {keywords} -> {len(result.pois)}个结果")
            return result
        except Exception as e:
            self.logger.error(f"关键字搜索失败: {keywords}, 错误: {str(e)}")
            raise

    async def nearby_search(
        self,
        location: Location | str,
        keywords: str | None = None,
        types: PoiType | str | None = None,
        radius: int = 1000,
        offset: int = 20,
        page: int = 1,
        extensions: Extensions = Extensions.BASE,
        language: Language = Language.ZH,
    ) -> SearchResult:
        """
        周边搜索POI

        Args:
            location: 中心点坐标，格式：经度,纬度
            keywords: 查询关键字，多个关键字用"|"分割
            types: 查询POI类型，多个类型用"|"分割
            radius: 搜索半径，单位：米，取值范围：0~50000，默认1000
            offset: 每页记录数据，强烈建议不超过25
            page: 当前页数，最大翻页数100
            extensions: 返回结果控制
            language: 返回结果语言类型

        Returns:
            搜索结果

        Raises:
            AmapAPIException: API调用失败时
        """
        location_str = str(location) if isinstance(location, Location) else location
        types_str = types.value if isinstance(types, PoiType) else types
        params = {
            "location": location_str,
            "keywords": keywords,
            "types": types_str,
            "radius": radius,
            "offset": offset,
            "page": page,
            "extensions": extensions.value,
            "language": language.value,
        }
        try:
            response = await self.client.get("/v5/place/around", params=params)
            search_response = SearchResponse(**response)
            result = SearchResult(count=int(response.get("count", "0")), pois=search_response.pois, suggestion=search_response.suggestion)
            self.logger.debug(f"周边搜索成功: {location_str} -> {len(result.pois)}个结果")
            return result
        except Exception as e:
            self.logger.error(f"周边搜索失败: {location_str}, 错误: {str(e)}")
            raise

    async def polygon_search(
        self,
        polygon: str,
        keywords: str | None = None,
        types: PoiType | str | None = None,
        offset: int = 20,
        page: int = 1,
        extensions: Extensions = Extensions.BASE,
        language: Language = Language.ZH,
    ) -> SearchResult:
        """
        多边形区域搜索POI

        Args:
            polygon: 多边形区域坐标点，格式：经度1,纬度1;经度2,纬度2;...经度n,纬度n
                    多边形为矩形时，可传入左上右下两顶点坐标，格式：左上经度,左上纬度;右下经度,右下纬度
            keywords: 查询关键字，多个关键字用"|"分割
            types: 查询POI类型，多个类型用"|"分割
            offset: 每页记录数据，强烈建议不超过25
            page: 当前页数，最大翻页数100
            extensions: 返回结果控制
            language: 返回结果语言类型

        Returns:
            搜索结果

        Raises:
            AmapAPIException: API调用失败时
        """
        types_str = types.value if isinstance(types, PoiType) else types
        params = {
            "polygon": polygon,
            "keywords": keywords,
            "types": types_str,
            "offset": offset,
            "page": page,
            "extensions": extensions.value,
            "language": language.value,
        }
        try:
            response = await self.client.get("/v5/place/polygon", params=params)
            search_response = SearchResponse(**response)
            result = SearchResult(count=int(response.get("count", "0")), pois=search_response.pois, suggestion=search_response.suggestion)
            self.logger.debug(f"多边形搜索成功: {polygon} -> {len(result.pois)}个结果")
            return result
        except Exception as e:
            self.logger.error(f"多边形搜索失败: {polygon}, 错误: {str(e)}")
            raise

    async def poi_detail(self, poi_id: str, extensions: Extensions = Extensions.ALL, language: Language = Language.ZH) -> PoiDetail | None:
        """
        获取POI详细信息

        Args:
            poi_id: POI的ID
            extensions: 返回结果控制，建议使用all获取详细信息
            language: 返回结果语言类型

        Returns:
            POI详细信息，如果未找到则返回None

        Raises:
            AmapAPIException: API调用失败时
        """
        params = {"id": poi_id, "extensions": extensions.value, "language": language.value}
        try:
            response = await self.client.get("/v5/place/detail", params=params)
            search_response = SearchResponse(**response)
            if poi := search_response.pois[0] if search_response.pois else None:
                self.logger.debug(f"POI详情获取成功: {poi_id} -> {poi.name}")
                return poi
            else:
                self.logger.warning(f"POI详情未找到: {poi_id}")
                return None
        except Exception as e:
            self.logger.error(f"POI详情获取失败: {poi_id}, 错误: {str(e)}")
            raise

    async def category_search(
        self,
        category: PoiType | str,
        region: str | None = None,
        city_limit: bool = False,
        offset: int = 20,
        page: int = 1,
        extensions: Extensions = Extensions.BASE,
        language: Language = Language.ZH,
    ) -> SearchResult:
        """
        分类搜索POI

        Args:
            category: POI分类，可以是PoiType枚举或分类代码字符串
            region: 搜索区域
            city_limit: 仅返回指定城市数据
            offset: 每页记录数据
            page: 当前页数
            extensions: 返回结果控制
            language: 返回结果语言类型

        Returns:
            搜索结果

        Raises:
            AmapAPIException: API调用失败时
        """
        category_str = category.value if isinstance(category, PoiType) else category
        params = {
            "types": category_str,
            "region": region,
            "city_limit": "true" if city_limit else "false",
            "offset": offset,
            "page": page,
            "extensions": extensions.value,
            "language": language.value,
        }
        try:
            response = await self.client.get("/v5/place/text", params=params)
            search_response = SearchResponse(**response)
            result = SearchResult(count=int(response.get("count", "0")), pois=search_response.pois, suggestion=search_response.suggestion)
            self.logger.debug(f"分类搜索成功: {category_str} -> {len(result.pois)}个结果")
            return result
        except Exception as e:
            self.logger.error(f"分类搜索失败: {category_str}, 错误: {str(e)}")
            raise
