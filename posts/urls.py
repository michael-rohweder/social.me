from django.urls import path
from .views import (
    likeControl,
    index,
    loadData,
    likeControl,
    commentControl,
    postControl,
    editPost,
    deletePost,
)

app_name = 'posts'

urlpatterns = [
    path('', index, name='main'),
    path('data/', loadData, name='posts-data'),
    path('likeControl/', likeControl, name="likeControl"),
    path('editPost/', editPost, name='editPost'),
    path('deletePost/', deletePost, name='deletePost'),
    path('commentControl/', commentControl, name="commentControl"),
    path('postControl/', postControl, name="postControl")
]
