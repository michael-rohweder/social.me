from django.db import models
from django.contrib.auth.models import User
from profiles.models import Profile
# Create your models here.


class Post(models.Model):
    def upload_to(instance, filename):
        return '%s/images/%s'% (instance.author.user.username, filename)

    content = models.TextField()
    liked = models.ManyToManyField(User, blank=True, related_name="liked")
    author = models.ForeignKey(Profile, on_delete=models.CASCADE)
    image = models.ImageField(upload_to=upload_to, blank=True)
    updated = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.content)

    

    @property
    def likeCount(self):
        return self.liked.all().count()

class Comments(models.Model):
    comment = models.TextField()
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    commenter = models.ForeignKey(Profile, on_delete=models.CASCADE)
    updated = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True)
