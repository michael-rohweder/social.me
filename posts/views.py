from django.shortcuts import render

from social_site.views import Login
from .models import Post, Profile, Comments
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .forms import PostForm
from profiles.models import Profile
# Create your views here.


@login_required(login_url='login')
def index(request):
    return render(request, 'posts/main.html')


def postControl(request):
    form = PostForm
    if request.is_ajax():
        postImage = request.FILES.get('postedImage')
        postContent = request.POST.get('postContent')

        if postContent != '':
            postCreator = Profile.objects.get(user=request.user)
            newPost = Post()
            newPost.image = postImage
            newPost.author = postCreator
            newPost.content = postContent
            newPost.save()
            if (postImage != None):
                postImageURL = newPost.image.url

            else:
                postImageURL = '/'
            newPostJSON = {
                'id': newPost.id,
                'author': newPost.author.id,
                'content': newPost.content,
                'count': newPost.likeCount,
                'postImage': postImageURL,
            }
            newPostAuthorJSON = {
                'name': postCreator.firstName + " " + postCreator.lastName,
                'profilePic': str(postCreator.profilePic.url),
                'firstName': postCreator.firstName,
                'lastName': postCreator.lastName
            }
            return JsonResponse({'post': newPostJSON, 'author': newPostAuthorJSON})


def loadData(request):
    currentUser = request.user
    currentUserProfile = Profile.objects.get(user=currentUser)
    currentUserFriends = currentUserProfile.friends.all()

    friendsJSON = []
    for frnd in currentUserFriends:
        friendOBJ = Profile.objects.get(id=frnd.id)
        friend = {
            'id': friendOBJ.id,
            'firstName': friendOBJ.firstName,
            'lastName': friendOBJ.lastName,
        }
        friendsJSON.append(friend)

    allComments = Comments.objects.all().order_by('-created')
    allCommentsListJSON = []
    for comment in allComments:
        com = {
            'id': comment.id,
            'comment': comment.comment,
            'post': comment.post.id,
            'commenter': comment.commenter.id,
            'name': comment.commenter.firstName + " " + comment.commenter.lastName,
            'profilePic': str(comment.commenter.profilePic.url)
        }
        allCommentsListJSON.append(com)

    allPosts = Post.objects.all().order_by('-created')
    allPostListJSON = []
    for post in allPosts:
        full_name = post.author.firstName + " " + post.author.lastName
        if (post.image):
            postImage = str(post.image.url)
        else:
            postImage = ''
        item = {
            'id': post.id,
            'content': post.content,
            'author': post.author.user.username,
            'authorFirstName': post.author.firstName,
            'authorLastName': post.author.lastName,
            'profilePic': str(post.author.profilePic.url),
            'liked': True if request.user in post.liked.all() else False,
            'count': post.likeCount,
            'name': full_name,
            'created': post.created,
            'postImage': postImage
        }
        allPostListJSON.append(item)
    currentUserProfileJSON = {
        'id': currentUserProfile.id,
        'firstName': currentUserProfile.firstName,
        'lastName': currentUserProfile.lastName,
        'profilePic': str(currentUserProfile.profilePic.url)
    }
    return JsonResponse({'currentUser': currentUserProfileJSON, 'allPosts': allPostListJSON, 'friends': friendsJSON, 'comments': allCommentsListJSON})


def likeControl(request):
    if request.is_ajax():
        pk = request.POST.get('pk')
        post = Post.objects.get(id=pk)
        if request.user in post.liked.all():
            liked = False
            post.liked.remove(request.user)
        else:
            liked = True
            post.liked.add(request.user)
        return JsonResponse({'liked': liked, 'count': post.likeCount})


def commentControl(request):
    if request.is_ajax():
        pk = request.POST.get('pk')
        allComments = Comments.objects.all().order_by('created')
        post = Post.objects.get(id=pk)
        comment = Comments()
        comment.post = post
        comment.commenter = Profile.objects.get(user=request.user)
        commenterFullName = comment.commenter.firstName + " " + comment.commenter.lastName
        comment.comment = request.POST.get('comment')
        commentList = []
        for comments in allComments:
            commentOBJ = Comments.objects.get(id=comments.id)
            com = {
                'id': commentOBJ.id,
                'comment': commentOBJ.comment,
                'post': commentOBJ.post.id,
                'commenter': commentOBJ.commenter.user.id,
                'profilePic': str(commentOBJ.commenter.profilePic.url)
            }
            commentList.append(com)
        if comment.comment != '':
            comment.save()
            print("commentControll Called!")
            return JsonResponse({'commentList': commentList, 'id': comment.id, 'comment': str(comment.comment), 'commenter': commenterFullName, 'profilePic': str(comment.commenter.profilePic.url)})
