"""
WebSocket-консьюмер для реалтайм-уведомлений.

Каждый аутентифицированный пользователь подключается к персональной
группе `user_<id>`. Kafka-консьюмер schedule_consumer пушит в эту
группу сообщения, когда ребёнок завершает активность.
"""
import json

from channels.generic.websocket import AsyncWebsocketConsumer


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get("user")
        if user is None or not user.is_authenticated:
            await self.close(code=4001)
            return
        self.group_name = f"user_{user.id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        await self.send(json.dumps({"type": "connected", "user_id": str(user.id)}))

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(
                self.group_name, self.channel_name
            )

    async def receive(self, text_data=None, bytes_data=None):
        # Поддерживаем ping/pong для keep-alive
        try:
            data = json.loads(text_data or "{}")
        except json.JSONDecodeError:
            return
        if data.get("type") == "ping":
            await self.send(json.dumps({"type": "pong"}))

    async def notify(self, event):
        """Обработчик group_send type='notify'."""
        await self.send(
            json.dumps({"type": "notification", "data": event["payload"]})
        )
