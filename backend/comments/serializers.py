from rest_framework import serializers
from .models import Comment


class CommentSerializer(serializers.ModelSerializer):
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'username', 'avatar_url', 'email', 'home_page', 'text', 'parent', 'created_at', 'replies']

    def get_replies(self, obj):
        replies = obj.replies.all().order_by('-created_at')
        return CommentSerializer(replies, many=True).data
