from django.urls import path
from .views import (
    likeControl,
    post_list_and_create,
    load_posts_data,
    likeControl,
    commentControl,
    loadComments,
    postControl,
)

app_name = 'posts'

urlpatterns = [
    path('', post_list_and_create, name='main'),
    path('data/', load_posts_data, name='posts-data'),
    path('likeControl/', likeControl, name="likeControl"),
    path('loadComments/', loadComments, name='loadComments'),
    path('commentControl/', commentControl, name="commentControl"),
    path('postControl/', postControl, name="postControl")
]
