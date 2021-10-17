from django import forms
from .models import Post

class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ('content', 'image')

        labels = {
            'content': "What's new?",
            'image': "Upload an image"
        }

class EditPostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ('content', 'image')

        labels = {
            'content': "What's new?",
            'image': "Upload an image"
        }

        id = {
            'content': 'editPostContent',
            'image': 'editPostImage'
        }