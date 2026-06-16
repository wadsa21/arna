from functools import wraps

from rest_framework import permissions
from rest_framework.response import Response

from .services import UpgradeRequired, get_subscription


class HasActivePlan(permissions.BasePermission):
    """Требует активную (не истёкшую) подписку."""

    message = "Подписка неактивна."

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        return get_subscription(user).is_active


class RequirePlanFeature(permissions.BasePermission):
    """
    Permission-класс, привязанный к фиче плана.
    Использование во вьюхе:
        permission_classes = [IsAuthenticated, RequirePlanFeature.for_("has_behavior_log")]
    """

    feature = None

    @classmethod
    def for_(cls, feature):
        return type(f"Require_{feature}", (cls,), {"feature": feature})

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        sub = get_subscription(user)
        if sub.is_active and getattr(sub.plan, self.feature, False):
            return True
        # Бросаем структурированный 403 (UpgradeRequired)
        from .services import require_feature

        require_feature(user, self.feature)
        return False


def require_plan(*plan_names):
    """
    Декоратор для DRF-вьюх/экшенов: доступ только для перечисленных планов.

        @require_plan("OTBASY", "PRO")
        def my_view(self, request): ...

    Возвращает {error: 'upgrade_required', current_plan, required_plan}.
    """

    def decorator(view_func):
        @wraps(view_func)
        def _wrapped(self, request, *args, **kwargs):
            sub = get_subscription(request.user)
            current = sub.plan.name if sub.plan else "FREE"
            if sub.is_active and current in plan_names:
                return view_func(self, request, *args, **kwargs)
            return Response(
                {
                    "error": "upgrade_required",
                    "detail": "Этот раздел доступен на другом тарифе.",
                    "current_plan": current,
                    "required_plan": plan_names[0],
                },
                status=403,
            )

        return _wrapped

    return decorator
