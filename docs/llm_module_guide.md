# LLM 模块

## 概述

[LLM](backend/modules/llm)模块是一个高度模块化、功能完整的语言模型管理系统，为TravelPlanner项目提供智能对话和工具调用能力。该模块采用现代化的异步架构设计，集成了完整的会话管理、工具调用、请求管理、压缩优化和监控指标等功能。

### 核心设计理念

- **统一管理**: 通过`LLMClient`统一管理所有LLM相关功能
- **异步优先**: 全面采用异步编程模式，支持高并发场景
- **可观测性**: 内置完整的指标收集和监控系统
- **可扩展性**: 模块化设计，便于功能扩展和定制
- **资源优化**: 智能的聊天压缩和请求管理机制
- **可靠性**: 完整的错误处理、重试机制和状态管理

## 架构概览

```
LLMClient (主入口)
├── RequestManager      # 请求管理和并发控制
├── HistoryManager      # 对话历史管理
├── ToolManager         # 工具调用管理
├── ChatCompressor      # 聊天压缩优化
├── MetricsCollector    # 指标收集和监控
└── Model Factory       # LLM模型创建和配置
```

## 核心组件详解

### 1. LLMClient - 核心客户端

`LLMClient`是整个模块的核心入口点，负责协调所有子组件的工作。

#### 主要功能
- **对话管理**: 支持有状态的对话会话
- **工具调用**: 无缝集成LangChain工具生态
- **历史记录**: 智能的对话历史管理和检索
- **流式处理**: 支持流式响应和实时交互
- **结构化输出**: 支持JSON Schema约束的结构化响应
- **压缩优化**: 自动压缩长对话以节省Token

#### 关键特性
```python
class LLMClient:
    def __init__(
        self,
        system_prompt: str = "",
        model_name: str = CONFIG.llm_model,
        temperature: float = CONFIG.llm_temperature,
        logger=None,
        max_history_size: int = 1000,
        max_concurrent_calls: int = 3,
        request_config: RequestConfig | None = None,
    )
```

### 2. RequestManager - 请求管理器

负责管理所有LLM请求的生命周期，提供并发控制、优先级调度和资源管理。

#### 核心功能
- **并发控制**: 支持最大并发请求数限制
- **优先级队列**: 支持URGENT/HIGH/NORMAL/LOW四级优先级
- **速率限制**: 每分钟请求数限制，避免API配额超限
- **自动重试**: 可配置的重试策略和退避算法
- **超时管理**: 请求级别的超时控制
- **队列管理**: 智能的请求排队和调度

#### 请求优先级
```python
class RequestPriority(Enum):
    LOW = 1      # 低优先级（批处理任务）
    NORMAL = 2   # 普通优先级（常规对话）
    HIGH = 3     # 高优先级（用户实时交互）
    URGENT = 4   # 紧急优先级（系统关键任务）
```

#### 请求状态跟踪
```python
class RequestStatus(Enum):
    QUEUED = "queued"        # 排队中
    EXECUTING = "executing"  # 执行中
    COMPLETED = "completed"  # 已完成
    FAILED = "failed"        # 失败
    CANCELLED = "cancelled"  # 已取消
    TIMEOUT = "timeout"      # 超时
```

### 3. HistoryManager - 历史记录管理器

提供完整的对话历史管理功能，支持多种检索模式和智能过滤。

#### 历史记录模式
- **COMPREHENSIVE**: 完整模式，包含所有消息（包括无效消息）
- **CURATED**: 精选模式，只包含有效的对话轮次，过滤掉错误和无效响应

#### 核心特性
- **内容验证**: 自动验证消息内容的有效性
- **智能过滤**: 自动过滤掉无效的模型响应序列
- **缓存机制**: 精选历史的智能缓存，提升性能
- **搜索功能**: 支持按内容搜索历史记录
- **导出功能**: 支持JSON/TXT格式的历史导出
- **压缩集成**: 与ChatCompressor无缝集成

#### 消息元数据
```python
class MessageMetadata(BaseModel):
    timestamp: float = Field(default_factory=time.time)
    model_name: str | None = None
    processing_time: float | None = None
    token_count: int | None = None
    error_info: dict | None = None
    validation_status: str = "valid"
    additional_data: dict = Field(default_factory=dict)
```

### 4. ChatCompressor - 聊天压缩器

智能的对话历史压缩系统，自动优化长对话的Token使用。

#### 压缩策略
- **自动触发**: 基于Token数量和消息条数的智能触发
- **内容保留**: 保留最近的重要对话内容
- **摘要生成**: 使用LLM生成早期对话的摘要
- **系统消息保护**: 可选的系统消息保留
- **质量控制**: 压缩后的质量验证和回退机制

#### 压缩配置
```python
# 配置示例（来自CONFIG）
compression_enable_auto: bool = True           # 启用自动压缩
compression_min_messages: int = 10             # 最少消息数触发阈值
compression_token_threshold_ratio: float = 0.8 # Token阈值比例
compression_preserve_ratio: float = 0.3        # 保留消息比例
compression_preserve_system: bool = True       # 保留系统消息
compression_min_ratio: float = 0.1            # 最小压缩比例
compression_max_inflation: float = 1.2        # 最大膨胀比例
```

#### 压缩状态
```python
class CompressionStatus(Enum):
    NOOP = "noop"                                    # 无需压缩
    COMPRESSED = "compressed"                        # 压缩完成
    COMPRESSION_FAILED_TOKEN_COUNT_ERROR = "..."    # Token计数错误
    COMPRESSION_FAILED_INFLATED_TOKEN_COUNT = "..." # 压缩后增加
    COMPRESSION_FAILED_TIMEOUT = "..."              # 压缩超时
    COMPRESSION_FAILED_MODEL_ERROR = "..."          # 模型错误
```

### 5. ToolManager - 工具调用管理器

完整的工具调用生命周期管理系统，支持并发调用和状态跟踪。

#### 功能特性
- **工具注册**: 支持LangChain BaseTool的注册和管理
- **并发控制**: 可配置的最大并发工具调用数
- **状态跟踪**: 完整的工具调用状态和性能监控
- **队列管理**: 工具调用的排队和调度
- **异步支持**: 同时支持同步和异步工具

#### 工具调用状态
```python
class ToolCallStatus(Enum):
    EXECUTING = "executing"  # 执行中
    SUCCESS = "success"      # 执行成功
    ERROR = "error"          # 执行错误
    CANCELLED = "cancelled"  # 已取消
```

#### 工具调用信息
```python
class ToolCallInfo(BaseModel):
    call_id: str                    # 调用ID
    tool_name: str                  # 工具名称
    arguments: dict[str, Any]       # 调用参数
    status: ToolCallStatus          # 调用状态
    start_time: float | None = None # 开始时间
    end_time: float | None = None   # 结束时间
    duration_ms: float | None = None # 执行时长(毫秒)
    error_message: str | None = None # 错误信息
    result: Any | None = None       # 执行结果
```

### 6. MetricsCollector - 指标收集器

统一的指标收集和监控系统，为所有组件提供可观测性。

#### 监控组件
- **历史记录指标**: 消息数量、有效性统计、缓存状态
- **请求管理指标**: 并发数、队列状态、执行时间、成功率
- **工具调用指标**: 调用次数、成功率、平均执行时间
- **压缩指标**: 压缩次数、节省Token数、压缩比例
- **全局指标**: 总请求数、平均响应时间、系统运行时间

#### 指标类别
```python
# 主要指标分类
self.history: dict[str, Any] = {}           # 历史记录指标
self.retry: dict[str, Any] = {}             # 重试机制指标
self.structured_output: dict[str, Any] = {} # 结构化输出指标
self.tool_management: dict[str, Any] = {}   # 工具管理指标
self.chat_compression: dict[str, Any] = {}  # 聊天压缩指标
self.request_manager: dict[str, Any] = {}   # 请求管理器指标
self.stream_processing: dict[str, Any] = {} # 流式处理指标
self.global_metrics: dict[str, Any] = {}    # 全局指标
```

## 基本使用方法

### 1. 创建LLMClient实例

```python
from modules.llm import LLMClient, RequestConfig

# 基本创建
client = LLMClient(
    system_prompt="你是一个旅行规划助手，帮助用户制定旅行计划。",
    model_name="gpt-4",
    temperature=0.7
)

# 高级配置
config = RequestConfig(
    max_concurrent_requests=10,
    max_queue_size=200,
    max_requests_per_minute=100,
    enable_auto_retry=True,
    max_retry_attempts=3
)

client = LLMClient(
    system_prompt="你是一个专业的旅行顾问。",
    request_config=config,
    max_history_size=2000
)
```

### 2. 基本对话

```python
# 同步对话
response = await client.chat("帮我规划一次北京3日游")
print(response.content)

# 流式对话
async for chunk in await client.chat("推荐一些北京的景点", stream=True):
    print(chunk.content, end="", flush=True)

# 结构化输出
from pydantic import BaseModel

class TravelPlan(BaseModel):
    destination: str
    days: int
    attractions: list[str]
    budget_range: str

plan = await client.chat(
    "制定一个北京3日游计划",
    response_format=TravelPlan
)
print(f"目的地: {plan.destination}")
print(f"天数: {plan.days}")
```

### 3. 工具调用

```python
from langchain.tools import Tool

# 定义工具
def search_attractions(city: str) -> str:
    """搜索城市景点信息"""
    # 实际的景点搜索逻辑
    return f"{city}的热门景点: 故宫、天安门、长城..."

search_tool = Tool(
    name="search_attractions",
    description="搜索指定城市的热门景点",
    func=search_attractions
)

# 添加工具
client.add_tools([search_tool])

# 使用工具进行对话
response = await client.chat("帮我搜索北京的景点信息")
```

### 4. 历史记录管理

```python
# 获取对话历史
history = client.get_history(mode=HistoryMode.CURATED, limit=10)

# 搜索历史记录
results = client.history_manager.find_entries_by_content("北京")

# 导出历史记录
json_export = client.history_manager.export_history(format="json")
txt_export = client.history_manager.export_history(format="txt")

# 清空历史记录
client.clear_history(keep_system_messages=True)
```

### 5. 监控和指标

```python
# 获取系统状态
status = client.get_system_status()
print(f"当前模型: {status['current_model']}")
print(f"工具数量: {status['tools_count']}")
print(f"队列信息: {status['queue_info']}")

# 获取详细指标
metrics = client.metrics.get_all_metrics()
print(f"总聊天请求: {metrics['global']['total_chat_requests']}")
print(f"成功率: {metrics['global']['total_successful_chats']}")

# 获取指标摘要
summary = client.metrics.get_summary()
print(f"聊天成功率: {summary['chat_success_rate']}%")
print(f"节省Token数: {summary['tokens_saved']}")
```

## 高级用法

### 1. 自定义请求配置

```python
# 高优先级请求
response = await client.chat(
    "紧急：用户投诉处理",
    priority=RequestPriority.URGENT,
    timeout=60.0
)

# 低优先级批处理
response = await client.chat(
    "批量生成景点描述",
    priority=RequestPriority.LOW,
    save_history=False  # 不保存到历史记录
)
```

### 2. 手动压缩控制

```python
# 检查是否需要压缩
messages = client.get_history()
should_compress = client.chat_compressor.should_compress(messages)

if should_compress:
    # 手动触发压缩
    result = await client.chat_compressor.compress_messages(
        messages, 
        client.model_name, 
        force=True
    )
    
    if result.status == CompressionStatus.COMPRESSED:
        print(f"压缩成功: {result.compression_ratio:.1%}")
        # 替换历史记录
        client.history_manager.replace_with_compressed_messages(
            result.compressed_messages
        )
```

### 3. 工具调用管理

```python
# 获取已注册的工具
tools = client.get_tools()
print(f"已注册工具: {[tool.name for tool in tools]}")

# 移除特定工具
client.remove_tool("search_attractions")

# 清空所有工具
client.clear_tools()

# 按名称获取工具
tool = client.get_tool_by_name("search_attractions")
if tool:
    print(f"工具描述: {tool.description}")
```

## 配置选项

### RequestConfig 配置

```python
class RequestConfig(BaseModel):
    # 并发限制
    max_concurrent_requests: int = 5      # 最大并发请求数
    max_queue_size: int = 100             # 最大队列大小
    max_requests_per_minute: int = 60     # 每分钟最大请求数
    
    # 超时配置
    default_timeout: float = 30.0         # 默认超时时间(秒)
    
    # 请求重试配置
    enable_auto_retry: bool = True        # 是否启用自动重试
    max_retry_attempts: int = 3           # 最大重试次数
    retry_delay: float = 1.0              # 重试延迟(秒)
```

### 压缩相关配置 (CONFIG)

```python
# 在config.yaml中配置
compression_enable_auto: true                    # 启用自动压缩
compression_min_messages: 10                     # 最少消息数触发阈值
compression_model_token_limit: 128000            # 模型Token限制
compression_token_threshold_ratio: 0.8           # Token阈值比例
compression_preserve_ratio: 0.3                  # 保留消息比例
compression_preserve_system: true                # 保留系统消息
compression_min_ratio: 0.1                      # 最小压缩比例
compression_max_inflation: 1.2                  # 最大膨胀比例
```

### LLM模型配置 (CONFIG)

```python
# 在config.yaml中配置
llm_model: "gpt-4"                               # 模型名称
llm_api_key: "your-api-key"                      # API密钥
llm_base_url: "https://api.openai.com/v1"       # API基础URL
llm_temperature: 0.7                             # 温度参数
llm_timeout: 30                                  # 请求超时时间
llm_retry_count: 3                               # 重试次数
```

## 错误处理和异常

### 自定义异常类型

```python
from modules.llm.exceptions import (
    LLMBaseException,           # 基础异常
    EmptyStreamError,           # 流式处理异常
    StructuredOutputError,      # 结构化输出异常
    SchemaValidationError       # Schema验证异常
)

try:
    response = await client.chat("测试", response_format=SomeSchema)
except SchemaValidationError as e:
    print(f"Schema验证失败: {e}")
except StructuredOutputError as e:
    print(f"结构化输出错误: {e}")
except LLMBaseException as e:
    print(f"LLM模块错误: {e}")
```

### 常见错误处理

```python
try:
    response = await client.chat("用户输入")
except asyncio.TimeoutError:
    print("请求超时")
except RuntimeError as e:
    if "请求队列已满" in str(e):
        print("系统繁忙，请稍后重试")
    elif "请求速率受限" in str(e):
        print("请求频率过高，需要等待")
    else:
        print(f"运行时错误: {e}")
except Exception as e:
    print(f"未知错误: {e}")
```

## 性能优化建议

### 1. 并发设置优化

```python
# 根据API限制和系统资源调整
config = RequestConfig(
    max_concurrent_requests=min(10, api_rate_limit // 6),  # 预留缓冲
    max_requests_per_minute=api_rate_limit * 0.9,          # 90%利用率
    max_queue_size=max_concurrent_requests * 20            # 20倍缓冲
)
```

### 2. 历史记录管理

```python
# 定期清理历史记录
if len(client.get_history()) > 1000:
    client.clear_history(keep_system_messages=True)

# 使用精选模式获取历史
history = client.get_history(mode=HistoryMode.CURATED, limit=20)
```

### 3. 压缩策略调优

```python
# 调整压缩触发阈值
compression_token_threshold_ratio: 0.7  # 更早触发压缩
compression_preserve_ratio: 0.4         # 保留更多近期消息
```

## API 参考

### LLMClient

#### 构造函数
```python
def __init__(
    self,
    system_prompt: str = "",                        # 系统提示词
    model_name: str = CONFIG.llm_model,             # 模型名称
    temperature: float = CONFIG.llm_temperature,    # 温度参数
    logger=None,                                     # 日志记录器
    max_history_size: int = 1000,                   # 最大历史记录数
    max_concurrent_calls: int = 3,                  # 最大并发工具调用数
    request_config: RequestConfig | None = None,    # 请求配置
)
```

#### 主要方法

**chat() - 统一聊天接口**
```python
async def chat(
    self,
    user_prompt: str,                               # 用户输入
    config: dict = None,                            # 模型配置
    save_history: bool = True,                      # 是否保存历史
    stream: bool = False,                           # 是否流式输出
    response_format: dict | type[BaseModel] | None = None,  # 结构化输出格式
    **kwargs,                                       # 其他参数
) -> AIMessage | AsyncGenerator | dict | BaseModel
```

**工具管理方法**
```python
def add_tools(self, tools: list[BaseTool]) -> None          # 添加工具
def get_tools(self) -> list[BaseTool]                       # 获取工具列表
def remove_tool(self, tool_name: str) -> bool               # 移除工具
def clear_tools(self) -> None                               # 清空工具
def get_tool_by_name(self, tool_name: str) -> BaseTool | None  # 按名称获取工具
```

**历史记录方法**
```python
def get_history(                                            # 获取历史记录
    self, 
    mode: HistoryMode = HistoryMode.CURATED, 
    limit: int | None = None, 
    include_metadata: bool = False
)
def clear_history(self, keep_system_messages: bool = True)  # 清空历史记录
```

**状态监控方法**
```python
def get_system_status(self) -> dict[str, Any]               # 获取系统状态
```

### RequestManager

#### 主要方法
```python
async def request(                                          # 统一请求接口
    self,
    func: Callable,                                         # 要执行的函数
    *args,                                                  # 位置参数
    priority: RequestPriority = RequestPriority.NORMAL,    # 优先级
    timeout: float | None = None,                           # 超时时间
    metadata: dict[str, Any] | None = None,                 # 元数据
    **kwargs,                                               # 关键字参数
) -> Any

async def get_request_status(self, request_id: str) -> RequestInfo | None  # 获取请求状态
def get_queue_info(self) -> dict[str, Any]                                # 获取队列信息
```

### HistoryManager

#### 主要方法
```python
def add_message(                                            # 添加消息
    self, 
    message: BaseMessage, 
    metadata: MessageMetadata | None = None, 
    parent_id: str | None = None
) -> str

def get_history(                                            # 获取历史记录
    self, 
    mode: HistoryMode = HistoryMode.COMPREHENSIVE, 
    limit: int | None = None, 
    include_metadata: bool = False
) -> list[BaseMessage | HistoryEntry]

def find_entries_by_content(                                # 按内容搜索
    self, 
    search_text: str, 
    mode: HistoryMode = HistoryMode.COMPREHENSIVE
) -> list[HistoryEntry]

def export_history(                                         # 导出历史记录
    self, 
    mode: HistoryMode = HistoryMode.COMPREHENSIVE, 
    format: str = "json"
) -> str

def clear_history(self, keep_system_messages: bool = True) # 清空历史记录
```

### ChatCompressor

#### 主要方法
```python
def should_compress(                                        # 判断是否需要压缩
    self, 
    messages: list[BaseMessage], 
    force: bool = False
) -> bool

async def compress_messages(                                # 压缩消息
    self, 
    messages: list[BaseMessage], 
    model_name: str, 
    force: bool = False
) -> CompressionResult

def count_tokens(self, messages: list[BaseMessage]) -> int  # 计算Token数量
```

### ToolManager

#### 主要方法
```python
def register_tool(self, tool: BaseTool) -> None             # 注册工具
def register_tools(self, tools: list[BaseTool]) -> None     # 批量注册工具
def unregister_tool(self, tool_name: str) -> None           # 注销工具
async def schedule_tool_call(                               # 调度工具调用
    self, 
    tool_name: str, 
    arguments: dict[str, Any]
) -> str
```

### MetricsCollector

#### 主要方法
```python
def update_metric(                                          # 更新指标
    self, 
    component: str, 
    metric_name: str, 
    value: Any
) -> None

def increment_metric(                                       # 增加计数指标
    self, 
    component: str, 
    metric_name: str, 
    increment: int = 1
) -> None

def get_all_metrics(self) -> dict[str, Any]                 # 获取所有指标
def get_summary(self) -> dict[str, Any]                     # 获取指标摘要
```

## 最佳实践

### 1. 初始化和配置
- 根据实际API限制合理设置并发参数
- 为不同场景创建不同的客户端实例
- 使用适当的系统提示词提升响应质量

### 2. 对话管理
- 定期清理历史记录，避免内存过度使用
- 使用CURATED模式获取高质量的历史记录
- 合理设置压缩参数，平衡Token使用和对话质量

### 3. 工具调用
- 为工具提供清晰、详细的描述
- 合理设置并发工具调用数，避免资源竞争
- 实现工具的异步版本以提升性能

### 4. 错误处理
- 实现全面的异常处理策略
- 监控关键指标，及时发现系统问题
- 为不同类型的错误设计合适的重试策略

### 5. 性能优化
- 使用流式输出提升用户体验
- 根据实际需求选择合适的模型和参数
- 监控并优化Token使用效率

---

## 总结

LLM模块提供了一个功能完整、高度可配置的语言模型管理系统。通过模块化的设计和完善的监控机制，它能够满足从简单对话到复杂工具调用的各种应用场景需求。合理使用本模块的各项功能，可以构建高性能、可靠的AI应用系统。

更多详细信息和使用示例，请参考各组件的源代码注释
