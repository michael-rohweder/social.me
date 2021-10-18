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
<<<<<<< HEAD
=======
    editSave,
>>>>>>> development
)

app_name = 'posts'

urlpatterns = [
    path('', index, name='main'),
    path('data/', loadData, name='posts-data'),
    path('likeControl/', likeControl, name="likeControl"),
    path('editPost/', editPost, name='editPost'),
<<<<<<< HEAD
=======
    path('editSave/', editSave, name='editSave'),
>>>>>>> development
    path('deletePost/', deletePost, name='deletePost'),
    path('commentControl/', commentControl, name="commentControl"),
    path('postControl/', postControl, name="postControl")
]
