from fastapi import BackgroundTasks
from utils import DatabaseManager

from .enums import PlanningTypeEnum
from .models import *


class PlanningController:
    """
    规划逻辑控制器
    """

    @staticmethod
    def plan_single(task_id: int):
        """
        执行单一目的地规划
        """
        import time
        from datetime import datetime, timezone

        try:
            # 获取任务信息
            with DatabaseManager() as db:
                task = db.query(PlanningSingleTask).filter(PlanningSingleTask.id == task_id).first()
                if not task:
                    print(f"未找到任务 ID: {task_id}")
                    return

                # 更新状态为处理中
                task.status = "processing"
                db.commit()
                print(f"后台任务：开始为规划 '{task.id}' 进行单一目的地规划...")

            # 模拟规划处理时间（10-30秒）
            import random

            processing_time = random.randint(10, 30)
            print(f"模拟规划处理，预计需要 {processing_time} 秒...")
            time.sleep(processing_time)

            # 创建规划结果
            with DatabaseManager() as db:
                # 重新获取任务以确保数据一致性
                task = db.query(PlanningSingleTask).filter(PlanningSingleTask.id == task_id).first()

                total_days = (task.return_date - task.departure_date).days + 1

                # 生成示例规划结果
                result = PlanningSingleResult(
                    task_id=task.id,
                    plan_title=f"{task.target}深度游 - {total_days}日精彩行程",
                    plan_description=f"为您精心规划的{task.target}深度游行程，涵盖必游景点、当地美食、文化体验等精彩内容。",
                    total_days=total_days,
                    estimated_budget=total_days * 500,  # 每天预算500元
                    daily_plan=[
                        {
                            "day": i,
                            "date": (
                                task.departure_date.date() + __import__("datetime").timedelta(days=i - 1)
                            ).isoformat(),
                            "title": f"第{i}天 - {task.target}探索之旅",
                            "activities": [
                                {
                                    "time": "09:00",
                                    "activity": f"{task.target}主要景点游览",
                                    "description": "探索当地著名景点，感受历史文化魅力",
                                    "duration": "3小时",
                                    "location": f"{task.target}市中心",
                                },
                                {
                                    "time": "12:00",
                                    "activity": "当地特色午餐",
                                    "description": "品尝地道美食，体验当地饮食文化",
                                    "duration": "1.5小时",
                                    "location": f"{task.target}美食街",
                                },
                                {
                                    "time": "14:00",
                                    "activity": "文化体验活动",
                                    "description": "参与当地文化活动，深度了解民俗风情",
                                    "duration": "2小时",
                                    "location": f"{task.target}文化中心",
                                },
                                {
                                    "time": "18:00",
                                    "activity": "自由活动时间",
                                    "description": "漫步街头，购买纪念品，享受轻松时光",
                                    "duration": "2小时",
                                    "location": f"{task.target}商业区",
                                },
                            ],
                        }
                        for i in range(1, total_days + 1)
                    ],
                    highlights=[
                        f"深度探索{task.target}的文化底蕴",
                        "品尝地道特色美食",
                        "体验当地民俗文化",
                        "专业导游讲解历史故事",
                        "合理安排行程，劳逸结合",
                    ],
                    tips=[
                        f"建议提前预订{task.target}热门景点门票",
                        "准备舒适的步行鞋，部分景点需要较多步行",
                        "关注当地天气变化，适时增减衣物",
                        "尊重当地风俗习惯，注意文明旅游",
                        "保持联络畅通，注意人身和财产安全",
                    ],
                )

                db.add(result)

                # 更新任务状态为完成
                task.status = "completed"
                db.commit()

                print(f"规划 '{task.id}' 执行完成！")

        except Exception as e:
            # 更新状态为失败
            try:
                with DatabaseManager() as db:
                    task = db.query(PlanningSingleTask).filter(PlanningSingleTask.id == task_id).first()
                    if task:
                        task.status = "failed"
                        db.commit()
            except:
                pass
            print(f"规划 '{task_id}' 执行失败: {str(e)}")

    @staticmethod
    def plan_route(task_id: int):
        """
        执行沿途游玩规划
        """
        import time
        from datetime import datetime, timezone

        try:
            # 获取任务信息
            with DatabaseManager() as db:
                task = db.query(PlanningRouteTask).filter(PlanningRouteTask.id == task_id).first()
                if not task:
                    print(f"未找到任务 ID: {task_id}")
                    return

                # 更新状态为处理中
                task.status = "processing"
                db.commit()
                print(f"后台任务：开始为规划 '{task.id}' 进行沿途游玩规划...")

            # 模拟规划处理时间
            import random

            processing_time = random.randint(15, 35)
            print(f"模拟路线规划处理，预计需要 {processing_time} 秒...")
            time.sleep(processing_time)

            # 创建规划结果
            with DatabaseManager() as db:
                task = db.query(PlanningRouteTask).filter(PlanningRouteTask.id == task_id).first()

                total_days = (task.return_date - task.departure_date).days + 1

                result = PlanningRouteResult(
                    task_id=task.id,
                    plan_title=f"从{task.source}到{task.target}的沿途游玩之旅",
                    plan_description=f"精心规划的从{task.source}到{task.target}路线，沿途安排{task.max_stopovers}个精彩停留点。",
                    total_days=total_days,
                    estimated_budget=total_days * 600,
                    daily_plan=[
                        {
                            "day": i,
                            "date": (
                                task.departure_date.date() + __import__("datetime").timedelta(days=i - 1)
                            ).isoformat(),
                            "title": f"第{i}天 - 沿途探索",
                            "route": f"从{task.source}向{task.target}前进" if i == 1 else f"继续向{task.target}行进",
                            "activities": [
                                {
                                    "time": "08:00",
                                    "activity": "出发",
                                    "description": "开始今日的旅程",
                                    "location": task.source if i == 1 else "沿途驿站",
                                },
                                {
                                    "time": "10:30",
                                    "activity": "沿途景点游览",
                                    "description": "探索沿途特色景点",
                                    "duration": "2小时",
                                },
                                {
                                    "time": "15:00",
                                    "activity": "当地文化体验",
                                    "description": "体验沿途地区特色文化",
                                    "duration": "1.5小时",
                                },
                            ],
                        }
                        for i in range(1, total_days + 1)
                    ],
                    route_plan=[
                        {
                            "segment": i,
                            "from": task.source if i == 1 else f"沿途点{i-1}",
                            "to": f"沿途点{i}" if i < task.max_stopovers else task.target,
                            "distance": f"{random.randint(80, 200)}公里",
                            "duration": f"{random.randint(1, 3)}小时",
                            "route_type": task.route_preference,
                        }
                        for i in range(1, task.max_stopovers + 2)
                    ],
                    waypoints=[
                        {
                            "name": f"沿途精彩点{i}",
                            "type": (
                                random.choice(task.preferred_stop_types) if task.preferred_stop_types else "自然景观"
                            ),
                            "stay_duration": f"{task.max_stopover_duration}小时",
                            "description": "值得停留的精彩地点",
                        }
                        for i in range(1, task.max_stopovers + 1)
                    ],
                )

                db.add(result)
                task.status = "completed"
                db.commit()

                print(f"路线规划 '{task.id}' 执行完成！")

        except Exception as e:
            try:
                with DatabaseManager() as db:
                    task = db.query(PlanningRouteTask).filter(PlanningRouteTask.id == task_id).first()
                    if task:
                        task.status = "failed"
                        db.commit()
            except:
                pass
            print(f"路线规划 '{task_id}' 执行失败: {str(e)}")

    @staticmethod
    def plan_multi(task_id: int):
        """
        执行多节点规划
        """
        import time
        from datetime import datetime, timezone

        try:
            # 获取任务信息
            with DatabaseManager() as db:
                task = db.query(PlanningMultiTask).filter(PlanningMultiTask.id == task_id).first()
                if not task:
                    print(f"未找到任务 ID: {task_id}")
                    return

                # 更新状态为处理中
                task.status = "processing"
                db.commit()
                print(f"后台任务：开始为规划 '{task.id}' 进行多节点规划...")

            # 模拟规划处理时间
            import random

            processing_time = random.randint(20, 40)
            print(f"模拟多节点规划处理，预计需要 {processing_time} 秒...")
            time.sleep(processing_time)

            # 创建规划结果
            with DatabaseManager() as db:
                task = db.query(PlanningMultiTask).filter(PlanningMultiTask.id == task_id).first()

                total_days = (task.return_date - task.departure_date).days + 1
                node_count = len(task.nodes_schedule) if task.nodes_schedule else 3

                result = PlanningMultiResult(
                    task_id=task.id,
                    plan_title=f"多节点精彩之旅 - {node_count}个目的地",
                    plan_description=f"精心安排的多节点旅行规划，涵盖{node_count}个精彩目的地的深度体验。",
                    total_days=total_days,
                    estimated_budget=total_days * 800,
                    nodes_details=[
                        {
                            "node_id": i,
                            "destination": f"目的地{i}",
                            "arrival_date": (
                                task.departure_date.date() + __import__("datetime").timedelta(days=i * 2)
                            ).isoformat(),
                            "departure_date": (
                                task.departure_date.date() + __import__("datetime").timedelta(days=i * 2 + 1)
                            ).isoformat(),
                            "activities": [f"探索{i}号目的地的特色景点", "体验当地文化和美食", "购买特色纪念品"],
                            "accommodation": f"目的地{i}推荐酒店",
                            "estimated_cost": random.randint(800, 1500),
                        }
                        for i in range(1, node_count + 1)
                    ],
                    route_plan=[
                        {
                            "from_node": i,
                            "to_node": i + 1,
                            "transport_mode": task.transport_mode,
                            "duration": f"{random.randint(2, 6)}小时",
                            "cost": random.randint(200, 500),
                        }
                        for i in range(node_count)
                    ],
                    highlights=[
                        "多个目的地深度游览体验",
                        "优化的交通路线安排",
                        "当地特色文化体验",
                        "完整的住宿和餐饮规划",
                        "详细的预算分析和建议",
                    ],
                )

                db.add(result)
                task.status = "completed"
                db.commit()

                print(f"多节点规划 '{task.id}' 执行完成！")

        except Exception as e:
            try:
                with DatabaseManager() as db:
                    task = db.query(PlanningMultiTask).filter(PlanningMultiTask.id == task_id).first()
                    if task:
                        task.status = "failed"
                        db.commit()
            except:
                pass
            print(f"多节点规划 '{task_id}' 执行失败: {str(e)}")

    @staticmethod
    def plan_smart(task_id: int):
        """
        执行智能推荐规划
        """
        import time
        from datetime import datetime, timezone

        try:
            # 获取任务信息
            with DatabaseManager() as db:
                task = db.query(PlanningSmartTask).filter(PlanningSmartTask.id == task_id).first()
                if not task:
                    print(f"未找到任务 ID: {task_id}")
                    return

                # 更新状态为处理中
                task.status = "processing"
                db.commit()
                print(f"后台任务：开始为规划 '{task.id}' 进行智能推荐规划...")

            # 模拟AI智能分析时间
            import random

            processing_time = random.randint(25, 45)
            print(f"模拟AI智能推荐分析，预计需要 {processing_time} 秒...")
            time.sleep(processing_time)

            # 创建规划结果
            with DatabaseManager() as db:
                task = db.query(PlanningSmartTask).filter(PlanningSmartTask.id == task_id).first()

                total_days = (task.return_date - task.departure_date).days + 1

                # 根据偏好智能推荐目的地
                destinations = ["桂林", "丽江", "厦门", "青岛", "大理", "西安", "成都", "杭州"]
                recommended_dest = random.choice(destinations)

                result = PlanningSmartResult(
                    task_id=task.id,
                    plan_title=f"AI智能推荐 - {recommended_dest}精品之旅",
                    plan_description=f"基于您的偏好和需求，AI为您智能推荐的{recommended_dest}旅行方案。",
                    total_days=total_days,
                    estimated_budget=total_days * 700,
                    destination=recommended_dest,
                    recommendation_reasons=f"根据您的出行距离限制({task.max_travel_distance}公里)、环境偏好({task.preferred_environment})等条件，{recommended_dest}是最适合您的目的地选择。",
                    destination_highlights=[
                        f"{recommended_dest}独特的自然风光",
                        "丰富的历史文化底蕴",
                        "特色美食和小吃体验",
                        "便利的交通和住宿条件",
                        "适宜的气候和旅游环境",
                    ],
                    daily_plan=[
                        {
                            "day": i,
                            "date": (
                                task.departure_date.date() + __import__("datetime").timedelta(days=i - 1)
                            ).isoformat(),
                            "title": f"第{i}天 - {recommended_dest}探索",
                            "activities": [
                                {
                                    "time": "09:00",
                                    "activity": f"{recommended_dest}标志性景点游览",
                                    "description": "探索最具代表性的景点",
                                    "duration": "3小时",
                                },
                                {
                                    "time": "14:00",
                                    "activity": "当地文化体验",
                                    "description": "深入了解当地文化特色",
                                    "duration": "2小时",
                                },
                                {
                                    "time": "19:00",
                                    "activity": "特色美食品尝",
                                    "description": "享受地道美食",
                                    "duration": "1.5小时",
                                },
                            ],
                        }
                        for i in range(1, total_days + 1)
                    ],
                )

                db.add(result)
                task.status = "completed"
                db.commit()

                print(f"智能推荐规划 '{task.id}' 执行完成！")

        except Exception as e:
            try:
                with DatabaseManager() as db:
                    task = db.query(PlanningSmartTask).filter(PlanningSmartTask.id == task_id).first()
                    if task:
                        task.status = "failed"
                        db.commit()
            except:
                pass
            print(f"智能推荐规划 '{task_id}' 执行失败: {str(e)}")


def add_planning_tasks(background_tasks: BackgroundTasks, planning_type: PlanningTypeEnum, task_id: int):
    """根据模型类型添加对应的后台规划任务"""
    task_map = {
        PlanningTypeEnum.SINGLE: PlanningController.plan_single,
        PlanningTypeEnum.ROUTE: PlanningController.plan_route,
        PlanningTypeEnum.MULTI: PlanningController.plan_multi,
        PlanningTypeEnum.SMART: PlanningController.plan_smart,
    }
    if task := task_map.get(planning_type):
        background_tasks.add_task(task, task_id)
