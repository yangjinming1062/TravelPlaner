#!/usr/bin/env python3
"""
LLMClient 功能测试脚本

测试功能包括：
1. 非流式响应
2. 流式响应  
3. 结构化输出
4. 连续对话
5. 对话压缩
6. 工具调用
7. 错误处理
8. 系统状态监控
"""
import asyncio
import json
import time

from modules.llm import LLMClient
from modules.llm import RequestConfig
from modules.planning import PlanningSingleResultSchema  # 用于结构化输出的测试模型
from utils import get_logger

# 导入项目模块

# 配置日志
logger = get_logger("test_llm")


class TestLLMClient:
    """LLMClient 测试类"""

    def __init__(self):
        """初始化测试环境"""
        self.logger = logger
        self.test_results = {"passed": 0, "failed": 0, "errors": []}
        # 创建测试配置
        self.config = RequestConfig(
            max_concurrent_requests=3,
            enable_auto_retry=True,
            max_retry_attempts=2,
            default_timeout=60.0,  # 增加默认超时时间到60秒，适应复杂请求
        )
        # 初始化 LLMClient
        self.client = LLMClient(
            system_prompt="你是一个有用的AI助手，专门帮助用户解答问题和提供建议。", request_config=self.config, logger=self.logger
        )
        self.logger.info("🚀 LLMClient 测试环境初始化完成")

    def log_test_result(self, test_name: str, success: bool, details: str = ""):
        """记录测试结果"""
        if success:
            self.test_results["passed"] += 1
            self.logger.info(f"✅ {test_name}: 通过 {details}")
        else:
            self.test_results["failed"] += 1
            error_msg = f"❌ {test_name}: 失败 {details}"
            self.logger.error(error_msg)
            self.test_results["errors"].append(error_msg)

    async def test_basic_chat(self):
        """测试基本的非流式对话"""
        self.logger.info("\n🔍 测试 1: 基本非流式对话")
        try:
            response = await self.client.chat("请简单介绍一下北京的三个著名景点", save_history=True)
            success = isinstance(response, type(response)) and hasattr(response, "content") and len(response.content) > 50  # 确保有实际内容
            if success:
                self.log_test_result("基本非流式对话", True, f"响应长度: {len(response.content)} 字符")
                self.logger.info(f"📝 响应片段: {response.content[:100]}...")
            else:
                self.log_test_result("基本非流式对话", False, "响应格式或内容异常")

        except Exception as e:
            self.log_test_result("基本非流式对话", False, f"异常: {str(e)}")

    async def test_streaming_chat(self):
        """测试流式对话"""
        self.logger.info("\n🔍 测试 2: 流式对话")
        try:
            response_generator = await self.client.chat("请讲一个简短的童话故事", stream=True, save_history=True)

            chunks = []
            chunk_count = 0

            async for chunk in response_generator:
                chunk_count += 1
                if hasattr(chunk, "content") and chunk.content:
                    chunks.append(chunk.content)
                if chunk_count > 50:  # 防止无限循环
                    break

            full_content = "".join(chunks)
            success = chunk_count > 0 and len(full_content) > 50

            if success:
                self.log_test_result("流式对话", True, f"收到 {chunk_count} 个块，总长度: {len(full_content)} 字符")
                self.logger.info(f"📝 流式内容片段: {full_content[:100]}...")
            else:
                self.log_test_result("流式对话", False, f"块数量不足或内容过短")

        except Exception as e:
            self.log_test_result("流式对话", False, f"异常: {str(e)}")

    async def test_structured_output(self):
        """测试结构化输出"""
        self.logger.info("\n🔍 测试 3: 结构化输出")

        try:
            # 测试 Pydantic 模型输出
            response = await self.client.chat("请推荐一个适合春季旅行的国内城市", response_format=PlanningSingleResultSchema, save_history=True)
            success = isinstance(response, PlanningSingleResultSchema)
            if success:
                self.log_test_result("结构化输出(Pydantic)", True, f"标题: {response.plan_title}")
                self.logger.info(f"📝 结构化响应: {response.model_dump()}")
            else:
                self.log_test_result("结构化输出(Pydantic)", False, f"响应类型: {type(response)}")

            # 测试 JSON Schema 输出
            json_schema = {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "城市名称"},
                    "temperature": {"type": "number", "description": "当前温度"},
                    "weather": {"type": "string", "description": "天气状况"},
                },
                "required": ["city", "temperature", "weather"],
            }

            response2 = await self.client.chat(
                "告诉我上海今天的天气情况，用JSON格式回答", response_format=json_schema, save_history=False  # 避免影响对话历史
            )

            json_success = isinstance(response2, dict) and "city" in response2

            if json_success:
                self.log_test_result("结构化输出(JSON)", True, f"城市: {response2.get('city', 'N/A')}")
                self.logger.info(f"📝 JSON响应: {response2}")
            else:
                self.log_test_result("结构化输出(JSON)", False, f"响应类型: {type(response2)}")

        except Exception as e:
            self.log_test_result("结构化输出", False, f"异常: {str(e)}")

    async def test_continuous_conversation(self):
        """测试连续对话能力"""
        self.logger.info("\n🔍 测试 4: 连续对话")

        try:
            # 第一轮对话
            response1 = await self.client.chat("我正在计划一次北京旅行，你有什么建议吗？", save_history=True)

            # 第二轮对话（应该能记住上下文）
            response2 = await self.client.chat("那住宿方面有什么推荐吗？", save_history=True)

            # 第三轮对话
            response3 = await self.client.chat("预算大概需要多少？", save_history=True)

            # 检查是否有上下文相关性
            context_related = ("北京" in response2.content or "住宿" in response2.content) and (
                "预算" in response3.content or "费用" in response3.content or "钱" in response3.content
            )

            success = all(
                [
                    hasattr(response1, "content") and len(response1.content) > 20,
                    hasattr(response2, "content") and len(response2.content) > 20,
                    hasattr(response3, "content") and len(response3.content) > 20,
                    context_related,
                ]
            )

            if success:
                self.log_test_result("连续对话", True, "三轮对话都有合理响应且保持上下文")
            else:
                self.log_test_result("连续对话", False, "对话缺乏上下文连贯性")

        except Exception as e:
            self.log_test_result("连续对话", False, f"异常: {str(e)}")

    async def test_conversation_compression(self):
        """测试对话压缩功能"""
        self.logger.info("\n🔍 测试 5: 对话压缩")

        try:
            # 生成大量对话来触发压缩
            questions = [
                "介绍一下故宫",
                "天坛有什么特色？",
                "长城的历史如何？",
                "颐和园适合什么时候去？",
                "北海公园有什么好玩的？",
                "雍和宫的建筑风格如何？",
                "什刹海的夜景如何？",
                "王府井有什么购物推荐？",
            ]

            initial_history_size = len(self.client.history_manager.get_history())

            # 进行多轮对话
            for i, question in enumerate(questions):
                await self.client.chat(question, save_history=True)
                self.logger.info(f"完成第 {i+1} 轮对话")

            final_history_size = len(self.client.history_manager.get_history())

            # 检查是否发生了压缩
            compression_occurred = final_history_size < len(questions) * 2  # 每轮对话产生2条消息

            # 获取压缩统计
            compression_stats = self.client.metrics.get_all_metrics().get("chat_compression", {})
            total_compressions = compression_stats.get("total_compressions", 0)

            success = compression_occurred or total_compressions > 0

            if success:
                self.log_test_result("对话压缩", True, f"历史大小: {initial_history_size} → {final_history_size}, 压缩次数: {total_compressions}")
            else:
                self.log_test_result("对话压缩", False, f"未检测到压缩，历史大小: {final_history_size}")

        except Exception as e:
            self.log_test_result("对话压缩", False, f"异常: {str(e)}")

    async def test_error_handling(self):
        """测试错误处理"""
        self.logger.info("\n🔍 测试 6: 错误处理")

        try:
            # 测试空输入
            try:
                await self.client.chat("", save_history=False)
                self.log_test_result("错误处理(空输入)", False, "应该抛出异常但没有")
            except Exception:
                self.log_test_result("错误处理(空输入)", True, "正确处理空输入")

            # 测试无效的结构化格式
            try:
                # 使用一个真正无效的格式（不是字符串）
                invalid_format = {"invalid": "format", "without": "proper_schema"}
                await self.client.chat("测试", response_format=invalid_format, save_history=False)  # 无效格式
                self.log_test_result("错误处理(无效格式)", False, "应该抛出异常但没有")
            except Exception:
                self.log_test_result("错误处理(无效格式)", True, "正确处理无效格式")

        except Exception as e:
            self.log_test_result("错误处理", False, f"测试异常: {str(e)}")

    async def test_system_monitoring(self):
        """测试系统状态监控"""
        self.logger.info("\n🔍 测试 7: 系统状态监控")

        try:
            # 获取系统状态
            status = self.client.get_system_status()

            # 检查必要的状态项
            required_keys = ["current_model", "tools_count", "metrics", "queue_info"]
            has_required_keys = all(key in status for key in required_keys)

            # 检查指标数据
            metrics = status.get("metrics", {})
            has_metrics = isinstance(metrics, dict) and len(metrics) > 0

            success = has_required_keys and has_metrics

            if success:
                self.log_test_result("系统状态监控", True, f"状态项: {len(status)}, 指标分类: {len(metrics)}")
                self.logger.info(f"📊 系统状态: {json.dumps(status, indent=2, ensure_ascii=False)}")
            else:
                self.log_test_result("系统状态监控", False, "状态信息不完整")

        except Exception as e:
            self.log_test_result("系统状态监控", False, f"异常: {str(e)}")

    def print_test_summary(self):
        """打印测试总结"""
        total = self.test_results["passed"] + self.test_results["failed"]
        success_rate = (self.test_results["passed"] / total * 100) if total > 0 else 0

        print("\n" + "=" * 60)
        print("🎯 LLMClient 测试总结报告")
        print("=" * 60)
        print(f"📊 总测试数: {total}")
        print(f"✅ 通过: {self.test_results['passed']}")
        print(f"❌ 失败: {self.test_results['failed']}")
        print(f"📈 成功率: {success_rate:.1f}%")

        if self.test_results["errors"]:
            print(f"\n❌ 失败详情:")
            for error in self.test_results["errors"]:
                print(f"  - {error}")

        print("\n" + "=" * 60)

        # 打印最终指标
        try:
            final_metrics = self.client.metrics.get_summary()
            print("📊 最终指标总结:")
            for key, value in final_metrics.items():
                print(f"  - {key}: {value}")
        except Exception as e:
            print(f"获取最终指标失败: {e}")

    async def run_all_tests(self):
        """运行所有测试"""
        self.logger.info("🚀 开始 LLMClient 全面功能测试")
        print("🔍 LLMClient 功能测试开始...")

        test_functions = [
            self.test_basic_chat,
            self.test_streaming_chat,
            self.test_structured_output,
            self.test_continuous_conversation,
            self.test_conversation_compression,
            self.test_error_handling,
            self.test_system_monitoring,
        ]

        start_time = time.time()

        for test_func in test_functions:
            try:
                await test_func()
            except Exception as e:
                self.logger.error(f"测试函数 {test_func.__name__} 执行失败: {e}")

            # 短暂休息，避免请求过于频繁
            await asyncio.sleep(1)

        end_time = time.time()
        total_time = end_time - start_time

        self.logger.info(f"🏁 测试完成，总耗时: {total_time:.2f} 秒")
        self.print_test_summary()


async def main():
    """主函数"""
    tester = TestLLMClient()
    await tester.run_all_tests()

    # 清理资源
    # await tester.client.shutdown()  # 如果有shutdown方法的话


if __name__ == "__main__":
    # 运行测试
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n⚠️  测试被用户中断")
    except Exception as e:
        print(f"\n❌ 测试执行失败: {e}")
        import traceback

        traceback.print_exc()
