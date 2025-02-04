from django.db import models


class Comment(models.Model):
    username = models.CharField(max_length=50)
    email = models.EmailField()
    home_page = models.URLField(blank=True, null=True)
    text = models.TextField()
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    file = models.FileField(upload_to='images_files/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.username}: {self.text[:30]}'
