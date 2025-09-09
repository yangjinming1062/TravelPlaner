import json
import re

from config import CONFIG
from langchain_openai import ChatOpenAI
from pydantic import BaseModel
from utils import exceptions
from utils import get_logger

logger = get_logger("llm")


def parse_model_structure(response_model: type[BaseModel]) -> str:
    """
    根据传入的BaseModel类型生成格式化的字段描述字符串，
    支持递归解析嵌套的Pydantic模型和泛型类型

    Args:
        response_model: Pydantic BaseModel类型

    Returns:
        str: 格式化的字段描述字符串
    """

    # 递归获取所有模型的类型和描述信息
    def get_all_models_info(model_cls: type[BaseModel], processed_models=None):
        if processed_models is None:
            processed_models = set()

        type_dict = {}
        desc_dict = {}
        nested_type_dicts = {}
        nested_desc_dicts = {}

        if not hasattr(model_cls, "model_fields"):
            return {}, {}, {}, {}

        fields = model_cls.model_fields
        # 构建当前模型的类型字典
        for field_name, field in fields.items():
            field_type = field.annotation
            type_str = None
            # 处理泛型类型 (List, Optional等)
            if hasattr(field_type, "__origin__"):
                origin = field_type.__origin__
                args = field_type.__args__
                if origin == list:
                    arg_type = args[0]
                    # 如果列表元素是Pydantic模型，显示为具体的数组结构
                    if hasattr(arg_type, "model_fields"):
                        n_types, n_descs, sub_types, sub_descs = get_all_models_info(arg_type, processed_models)
                        nested_type_dicts.update(sub_types)
                        nested_desc_dicts.update(sub_descs)
                        nested_type_dicts[arg_type.__name__] = n_types
                        nested_desc_dicts[arg_type.__name__] = n_descs
                        # 显示为具体的数组结构
                        type_str = [n_types]
                    else:
                        type_str = f"List[{arg_type.__name__}]"
                elif origin == dict:
                    key_type = args[0].__name__
                    val_type = args[1].__name__
                    type_str = f"Dict[{key_type}, {val_type}]"
                elif hasattr(origin, "__name__"):
                    if len(args) == 1:
                        type_str = f"{origin.__name__}[{args[0].__name__}]"
                    else:
                        type_str = str(field_type)
                else:
                    type_str = str(field_type)
            # 处理普通Pydantic模型 - 这里是关键修改
            elif hasattr(field_type, "model_fields"):
                # 检查是否已经处理过相同的模型类型，如果已处理则重用结构
                if field_type.__name__ in processed_models:
                    # 从已处理的嵌套类型中获取结构
                    if field_type.__name__ in nested_type_dicts:
                        type_str = nested_type_dicts[field_type.__name__]
                    else:
                        # 如果没有找到，重新解析
                        temp_processed = processed_models.copy()
                        temp_processed.discard(field_type.__name__)
                        n_types, n_descs, sub_types, sub_descs = get_all_models_info(field_type, temp_processed)
                        nested_type_dicts.update(sub_types)
                        nested_desc_dicts.update(sub_descs)
                        nested_type_dicts[field_type.__name__] = n_types
                        nested_desc_dicts[field_type.__name__] = n_descs
                        type_str = n_types
                else:
                    # 递归获取嵌套模型的结构
                    processed_models.add(field_type.__name__)
                    n_types, n_descs, sub_types, sub_descs = get_all_models_info(field_type, processed_models)
                    nested_type_dicts.update(sub_types)
                    nested_desc_dicts.update(sub_descs)
                    nested_type_dicts[field_type.__name__] = n_types
                    nested_desc_dicts[field_type.__name__] = n_descs
                    # 直接使用嵌套模型的结构而不是类名
                    type_str = n_types
            else:
                type_str = getattr(field_type, "__name__", str(field_type))

            type_dict[field_name] = type_str
            desc_dict[field_name] = field.description or "No description"

        return type_dict, desc_dict, nested_type_dicts, nested_desc_dicts

    # 获取主模型和所有嵌套模型的信息
    main_types, main_descs, nested_types, nested_descs = get_all_models_info(response_model)

    # 构建输出字符串
    result = f"""
Please output only a valid JSON that strictly follows the format specified below. Do not add any explanations, prefixes, or suffix text.

Format:
{json.dumps(main_types, indent=2)}

Field descriptions:
{"\n".join([f"- {k}: {v}" for k, v in main_descs.items()])}
"""

    # 添加嵌套模型信息 - 但只显示未在主模型中内嵌的模型
    if nested_types:
        for model_name in nested_types:
            # 跳过空字典或已经内嵌在主模型中的模型
            if not nested_types[model_name] or any(
                isinstance(v, dict) and model_name in str(v) for v in main_types.values()
            ):
                continue

            result += f"""
{model_name} Format:
{json.dumps(nested_types[model_name], indent=2)}

{model_name} Field descriptions:
{"\n".join([f"- {k}: {v}" for k, v in nested_descs[model_name].items()])}
"""
    return result


def get_model(model: str = CONFIG.llm_model, temperature: float = CONFIG.llm_temperature) -> ChatOpenAI:
    """
    获取模型客户端实例。
    """

    return ChatOpenAI(
        model=model,
        api_key=CONFIG.llm_api_key,
        base_url=CONFIG.llm_base_url,
        temperature=temperature,
        max_retries=CONFIG.llm_retry_count,
        timeout=CONFIG.llm_timeout,
    )


@exceptions(log_level=0)
def _parse_response(response_text: str, response_format: type[BaseModel]) -> type[BaseModel] | list[type[BaseModel]]:
    parsed_json = json.loads(response_text)

    # Handle array responses
    if isinstance(parsed_json, list):
        return [response_format.model_validate(item) for item in parsed_json]

    # Handle single object response
    return response_format.model_validate(parsed_json)


def validate_response(response_text: str, response_format=None) -> type[BaseModel] | list[type[BaseModel]] | str | None:
    """
    验证并解析响应文本，支持单个对象或对象数组
    """
    if not response_format:
        return response_text
    logger.debug(f"【Response Text】:\n{response_text}")

    # 首先尝试直接解析
    if response := _parse_response(response_text, response_format):
        return response

    # region 常规格式处理
    # 如果是 markdown 代码块，先提取内容
    if match := re.search(r"```json((?s:.)*?)```", response_text):
        response_text = match.group(1).strip()
    # 移除已经存在的转义，确保不会发生双重转义
    processed_text = response_text.replace("\\\\", "\\")
    processed_text = processed_text.replace("\\{", "{")
    processed_text = processed_text.replace("\\}", "}")
    if response := _parse_response(processed_text, response_format):
        return response
    # endregion

    # region 处理响应文本前面有描述的情况
    # 查找所有可能的JSON开始位置
    for chart in [("[", "]"), ("{", "}")]:
        left, right = chart
        # 使用字符串查找而不是正则表达式，避免特殊字符问题
        start_pos = 0
        while (json_start := response_text.find(left, start_pos)) != -1:
            brace_count = 0
            # 提取可能的JSON字符串
            for i, char in enumerate(response_text[json_start:], json_start):
                if char == left:
                    brace_count += 1
                elif char == right:
                    brace_count -= 1
                    if brace_count == 0:
                        json_text = response_text[json_start : i + 1]
                        if response := _parse_response(json_text, response_format):
                            return response
                        break
            start_pos = json_start + 1
    # endregion

    logger.error(f"无法解析响应: {response_text}")
