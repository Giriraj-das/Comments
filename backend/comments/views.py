import logging

from captcha.helpers import captcha_image_url
from captcha.models import CaptchaStore
from django.utils.timezone import now
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Comment
from .serializers import CommentSerializer

logger = logging.getLogger('django')


class CaptchaAPIView(APIView):
    def get(self, request):
        new_captcha = CaptchaStore.generate_key()
        captcha_url = captcha_image_url(new_captcha)
        return Response({'captcha_key': new_captcha, 'captcha_image': captcha_url})


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
        try:
            captcha_key = request.data.get('captcha_key')
            captcha_value = request.data.get('captcha')

            # Check CAPTCHA
            if not captcha_key or not captcha_value:
                logger.error('CAPTCHA is missing in the request')
                return Response({'error': 'CAPTCHA is required'}, status=400)
            try:
                captcha = CaptchaStore.objects.get(hashkey=captcha_key)
                if captcha.expiration < now():
                    logger.error(f'Expired CAPTCHA: {captcha_key}')
                    return Response({'error': 'CAPTCHA expired'}, status=400)
                if captcha.response != captcha_value.lower():
                    logger.error(f'Invalid CAPTCHA: {captcha_key}')
                    return Response({'error': 'Invalid CAPTCHA'}, status=400)
            except CaptchaStore.DoesNotExist:
                logger.error(f'Invalid CAPTCHA key: {captcha_key}')
                return Response({'error': 'Invalid CAPTCHA key'}, status=400)

            # If CAPTCHA valid, save a comment
            serializer = CommentSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            logger.error(f'Invalid comment data: {serializer.errors}')
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception(f'Unexpected error in CommentAPIView: {e}')
            return Response({'error': 'Internal Server Error'}, status=500)
