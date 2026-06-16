from rest_framework import permissions


class IsParent(permissions.BasePermission):
    """Доступ только для пользователей с ролью PARENT (или ADMIN)."""

    message = "Доступно только родителям."

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and user.role in ("PARENT", "ADMIN")
        )


class IsOwnerParent(permissions.BasePermission):
    """
    Объект относится к ребёнку, чей parent == request.user.
    Ожидает, что у объекта есть атрибут child или parent.
    """

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role == "ADMIN":
            return True
        parent = getattr(obj, "parent", None)
        if parent is not None:
            return parent == user
        child = getattr(obj, "child", None)
        if child is not None:
            return child.parent == user
        return False
