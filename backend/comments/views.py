from captcha.helpers import captcha_image_url
from captcha.models import CaptchaStore
from django.utils.timezone import now
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Comment
from .serializers import CommentSerializer


class CommentAPIView(APIView):
    def get(self, request):
        sort_by = request.GET.get('sort_by', 'created_at')
        order = request.GET.get('order', 'desc')

        if order not in ['asc', 'desc']:
            order = 'desc'
        if sort_by not in ['username', 'email', 'created_at']:
            sort_by = 'created_at'

        order_prefix = '-' if order == 'desc' else ''

        comments = Comment.objects.filter(parent__isnull=True).order_by(f'{order_prefix}{sort_by}')
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
