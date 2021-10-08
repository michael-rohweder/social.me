from django.shortcuts import render

from social_site.views import Login
from .models import Post, Profile, Comments
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .forms import PostForm
from profiles.models import Profile
# Create your views here.

@login_required(login_url='login')
def post_list_and_create(request):
    form = PostForm(request.POST or None)
    if request.is_ajax():
        if form.is_valid:
            author = Profile.objects.get(user=request.user)
            instance = form.save(commit=False)
            instance.author=author
            instance.save()
    context = {
        'form': form,
    }
    return render(request, 'posts/main.html', context)
    
def postControl(request):
    form = PostForm
    if request.is_ajax():
        postContent = request.POST.get('postContent')
        if postContent != '':
            postCreator = Profile.objects.get(user=request.user)
            newPost = Post()
            newPost.author = postCreator
            newPost.content = postContent
            newPost.save()
    return JsonResponse({})

def loadComments(request):
    if request.is_ajax():
        comments = Comments.objects.all()
        comment = []
        for c in comments:
            commenterName = c.commenter.firstName + " " + c.commenter.lastName
            com = {
                'id': c.id,
                'comment': c.comment,
                'post': c.post.id,
                'commenter': commenterName
            }
            comment.append(com)
        return JsonResponse({'comment': comment})


def load_posts_data(request):
    currentUser = request.user
    userProfile = Profile.objects.get(user=currentUser)
    userFriends = userProfile.friends.all()
    friends = []
    for frnd in userFriends:
        friendOBJ = Profile.objects.get(id=frnd.id)
        friend = {
            'id': friendOBJ.id,
            'firstName': friendOBJ.firstName,
            'lastName': friendOBJ.lastName,
        }
        friends.append(friend)

    query = Post.objects.all().order_by('-created')
    data = []

    for obj in query:
        full_name = obj.author.firstName + " " + obj.author.lastName
        item = {
            'id': obj.id,
            'content': obj.content,
            'author': obj.author.user.username,
            'profilePic': str(obj.author.profilePic),
            'liked': True if request.user in obj.liked.all() else False,
            'count': obj.likeCount,
            'name': full_name,
        }
        data.append(item)

    return JsonResponse({'data': data, 'friends': friends})

def likeControl(request):
    if request.is_ajax():
        pk = request.POST.get('pk')
        post = Post.objects.get(id=pk)
        if request.user in post.liked.all():
            liked=False
            post.liked.remove(request.user)
        else:
            liked=True
            post.liked.add(request.user)
        return JsonResponse({'liked': liked, 'count': post.likeCount})

def commentControl(request):
    if request.is_ajax():
        pk = request.POST.get('pk')
        post = Post.objects.get(id=pk)
        comment = Comments()
        comment.post = post
        comment.commenter = Profile.objects.get(user=request.user)
        commenterFullName = comment.commenter.firstName + " " + comment.commenter.lastName
        comment.comment = request.POST.get('comment')
        if comment.comment != '':
            comment.save()
            return JsonResponse({'comment': str(comment.comment), 'commenter': commenterFullName})
