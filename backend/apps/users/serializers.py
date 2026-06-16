from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "full_name",
            "role",
            "avatar",
            "language",
            "created_at",
        )
        read_only_fields = ("id", "created_at")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ("id", "email", "password", "full_name", "role", "language")

    def validate_role(self, value):
        if value == User.Role.ADMIN:
            raise serializers.ValidationError(
                "Регистрация администратора недоступна."
            )
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        return User.objects.create_user(password=password, **validated_data)


class MeUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("full_name", "avatar", "language")


class ArnaTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Кладём роль/имя прямо в ответ логина, чтобы фронт не делал лишний запрос."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["full_name"] = user.full_name
        # Имя плана в токене — фронт проверяет доступ без лишнего запроса
        try:
            token["plan_name"] = user.subscription.plan.name
        except Exception:  # noqa: BLE001
            token["plan_name"] = "FREE"
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user, context=self.context).data
        return data
