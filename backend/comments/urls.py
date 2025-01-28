from django.urls import path
from .views import CommentAPIView, CaptchaAPIView

urlpatterns = [
    path('comments/', CommentAPIView.as_view(), name='comment_api'),
    path('captcha/', CaptchaAPIView.as_view(), name='captcha'),
]
