from rest_framework import serializers
from .models import Comment
from .validators import FileExtensionValidator, FileValidator, AvatarValidator


class CommentSerializer(serializers.ModelSerializer):
    replies = serializers.SerializerMethodField()
    avatar = serializers.ImageField(required=False)
    file = serializers.FileField(
        validators=[FileExtensionValidator(['jpg', 'jpeg', 'png', 'gif', 'txt'])],
        required=False,
    )

    class Meta:
        model = Comment
        fields = ['id', 'username', 'email', 'home_page', 'text', 'avatar', 'file', 'parent', 'created_at', 'replies']

    def get_replies(self, obj):
        replies = obj.replies.all().order_by('-created_at')
        return CommentSerializer(replies, many=True).data

    def validate_avatar(self, avatar):
        validator = AvatarValidator()
        return validator(avatar)

    def validate_file(self, file):
        validator = FileValidator()
        return validator(file)
