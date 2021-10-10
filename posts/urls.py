from django.urls import path
from .views import (
    likeControl,
    index,
    loadData,
    likeControl,
    commentControl,
    loadComments,
    postControl,
)

app_name = 'posts'

urlpatterns = [
    path('', index, name='main'),
    path('data/', loadData, name='posts-data'),
    path('likeControl/', likeControl, name="likeControl"),
    path('loadComments/', loadComments, name='loadComments'),
    path('commentControl/', commentControl, name="commentControl"),
    path('postControl/', postControl, name="postControl")
]
