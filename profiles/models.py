from django.db import models
from django.contrib.auth.models import User

# Create your models here.


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
    firstName = models.CharField(max_length=20, blank=True)
    lastName = models.CharField(max_length=30, blank=True)
    email = models.CharField(max_length=50, blank=True)
    friends = models.ManyToManyField(User, blank=True, related_name="friends")
    profilePic = models.ImageField(default="defaultProfilePic.svg", upload_to='profilePics')
    updated = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"User profile for {self.user.username}"
