const postBox = document.getElementById("posts-box")
const friendList = document.getElementById("friendList")
var currentUser = ''
var postListOld, commentListOld, friendListOld, likeListOld, likeChanged

const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');

const loadOnce = () => {
    $.ajax({
        type: 'GET',
        url: '/data/',
        success: function(response) {
            const allPosts = response.allPosts
            const friends = response.friends
            const comments = response.comments
            var postComments = []
            postListOld = []
            friendListOld = friends
            commentListOld = comments
            currentUser = response.currentUser.id

            

            //POST BOX EVENTLISTENER
            const postSave = document.getElementById('post_save')
            const postInput = document.getElementById('id_content')
            const postImage = document.getElementById('id_image')
            const errorMessage = document.getElementById('error_message')
            const postCancel = document.getElementById('post_cancel')
            const createPostDiv = document.getElementById('createPostDiv')
            const createPostButton = document.getElementById('createPostButton')
            const searchForm = document.getElementById('searchForm')
            searchForm.addEventListener('submit', e => {
                e.preventDefault()
                alert("This feature is coming soon!")
            })

            createPostDiv.addEventListener('click', e => {
                e.preventDefault()
                createPostButton.click()
            })
            postCancel.addEventListener("click", e => {
                e.preventDefault()
                postInput.value = ''
                postImage.value = ''
                errorMessage.innerText = ''
                $('#postModal').modal('hide')
            })
            postSave.addEventListener("click", e => {
                e.preventDefault()
                if (postInput.value != '' || $(postImage).prop('files').length > 0) {
                    errorMessage.innerText = ''

                    postSave.innerHTML = `
                        <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                        </div>
                    `
                } else {
                    errorMessage.innerText = "Please enter either text or an image!"
                }
                var formData = new FormData()

                if ($(postImage).prop('files').length > 0) {
                    file = $(postImage).prop('files')[0]
                    formData.append('postedImage', file)
                }
                formData.append('csrfmiddlewaretoken', csrftoken)
                formData.append('postContent', postInput.value)
                $.ajax({
                    type: 'POST',
                    url: 'postControl/',
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function(response) {
                        errorMessage.innerText = ''
                        postSave.innerHTML = "Save Post"
                        postInput.value = ''
                        postImage.value = ''
                        postInput.style.height = "50px"
                        newPost = response.post
                        author = response.author
                        createPost(newPost, author, '', false)
                        attachEventListeners(newPost)
                        $('#postModal').modal('hide')
                    },
                    error: function(error) {
                        console.log("ERROR:", error)
                    }
                })
            })

            //LOAD ALL POSTS INTO postListOld
            allPosts.forEach(post => {
                postListOld.push(post)
            })

            //ADD FRIENDS TO RIGHT SIDE
            friends.forEach(friend => {
                friendList.innerHTML += `
                    <li>${friend.firstName} ${friend.lastName}</li>
                `
            })

            //PROCESS ALL SAVED POSTS AND DISPLAY THEM
            //ADD EVENTLISTENER TO THE COMMENT BUTTON
            allPosts.forEach(post => {
                postComments = []
                comments.forEach(comment => {
                    if (comment.post == post.id) {
                        postComments.push(comment)
                    }
                })
                author = {
                    'name': post.name,
                    'firstName': post.authorFirstName,
                    'lastName': post.authorLastName,
                    'profilePic': post.profilePic
                }
                createPost(post, author, postComments, true)
                attachEventListeners(post)
            })
        },
        error: function(error) {
            console.log("ERROR:", error)
        }
    })
}

function handleDeleteButtonPressed(post) {
    $.ajax({
        type: "POST",
        url: "deletePost/",
        data: {
            'csrfmiddlewaretoken': csrftoken,
            'pk': post.id
        },
        success: function(response) {
            const postId = response.post.id
            const postBoxToDelete = document.getElementById(`postBoxContainer-${postId}`)
            postBoxToDelete.remove()
            $('#editPostModal').modal('hide')

        },
        error: function(error) {
            console.log("ERROR:", error)
        }
    })
}

function handleEditSaveButtonPressed(post) {
    $.ajax({
        type: "POST",
        url: "editSave/",
        data: {
            'csrfmiddlewaretoken': csrftoken,
            'pk': post.id,
            'content': post.content
        },
        success: function(response) {
            $('#editPostModal').modal('hide')

        },
        error: function(error) {
            console.log("ERROR:", error)
        }
    })
}

function attachEventListeners(post) {
    //ADD EVENT LISTENERS
    
    const elipsesPost = document.getElementById(`elipses-${post.id}`)
    const commentForm = document.getElementById(`commentForm-${post.id}`)
    const editPostButton = document.getElementById('editPostButton')
    const deletePostButton = document.getElementById('deletePostButton')
    const editSaveButton = document.getElementById("editPost_save")
    if (elipsesPost){

        elipsesPost.addEventListener("click", e => {
            e.preventDefault()
            $.ajax({
                type: "POST",
                url: "editPost/",
                data: {
                    'csrfmiddlewaretoken': csrftoken,
                    'pk': post.id
                },
                success: function(response) {
                    post = response.post
                    editPostButton.click()
                    
                    const editContent = document.getElementById('edit_content')
                    editContent.value = post.content

                    editSaveButton.onclick = function() {
                        post.content = editContent.value
                        handleEditSaveButtonPressed(post)
                    }

                    deletePostButton.onclick = function() {
                        handleDeleteButtonPressed(post)
                    }
                },
                error: function(error) {
                    console.log("ERROR:", error)
                }
            })
        })
    }
    commentForm.addEventListener("submit", e => {
        e.preventDefault()
        createComment(post, commentForm)
    })
    const likeControl = document.getElementById(`likeControl-${post.id}`)
    const clickedButton = document.getElementById(`like-unlike-${post.id}`)
    likeControl.addEventListener("submit", e => {
        e.preventDefault()
        $.ajax({
            type: 'POST',
            url: "likeControl/",
            data: {
                'csrfmiddlewaretoken': csrftoken,
                'pk': post.id,
            },
            success: function(response) {
                clickedButton.textContent = response.liked ? ` Unlike (${response.count})` : ` Like (${response.count})`
            },
            error: function(error) {
                console.log("ERROR:", error)
            }
        })
    })
}

function createComment(post, ...args) {
    const inputField = document.getElementById(`comment-${post.id}`)
    if (post != '') {
        const commentContainer = document.getElementById(post.id)
        $.ajax({
            type: 'POST',
            url: "commentControl/",
            data: {
                'csrfmiddlewaretoken': csrftoken,
                'pk': post.id,
                'comment': inputField.value,
            },
            success: function(response) {
                newCommentList = response.commentList
                const newComment = document.createElement("div")
                newComment.style.cssText = "text-align:left"
                newComment.innerHTML = `
                        <img align="left" class="rounded-circle postAuthorProfileImage" style="margin-right:5px" src="${response.profilePic}" height="35px" width="35px">      
                        <p style="overflow-wrap:anywhere;padding-top:5px; padding-bottom:5px;padding-left:10px;padding-right:10px;display:inline-block;width:auto;background:#dde2e5; border-radius:0px 25px 25px 25px">
                            <strong id="${response.id}">${response.commenter}</strong><br>${response.comment}
                        </p>
                `
                inputField.value = ''
                commentContainer.append(newComment)
                commentListOld = []
                newCommentList.forEach(comment => {
                    commentListOld.push(comment)
                })
            },
            error: function(error) {
                console.log("ERROR:", error)
            }
        })
    } else {
        const newComment = document.createElement("div")
        newComment.style.cssText = "text-align:left"
        newComment.innerHTML = `
                <img align="left" class="rounded-circle postAuthorProfileImage" style="margin-right:5px"src="${args[0].profilePic}" height="35px" width="35px">      
                <p style="overflow-wrap:anywhere;padding-top:5px; padding-bottom:5px;padding-left:10px;padding-right:10px;display:inline-block;width:auto;background:#dde2e5; border-radius:0px 25px 25px 25px">
                    <strong id="${args[0].post}">${args[0].name}</strong><br>${args[0].comment}
                </p>
        `
        const commentContainer = document.getElementById(args[0].post)
        commentContainer.append(newComment)
    }
}

function updateLikes(allPosts) {
    allPosts.forEach(post => {
        const likeContainer = document.getElementById(`like-unlike-${post.id}`)
        if (post.liked) {
            likeString = ` Unlike (${post.count})`
        } else {
            likeString = ` Like (${post.count})`
        }
        likeContainer.innerText = likeString
    })

}

$(document).ready(function() {
    setInterval(function() {
        console.log("TICK!")
        $.ajax({
            type: 'GET',
            url: "/data/",
            success: function(response) {
                allPosts = response.allPosts
                friends = response.friends
                comments = response.comments
                if (JSON.stringify(allPosts) != JSON.stringify(postListOld)) {
                    allPosts.forEach(newPost => {
                        if (!document.getElementById(`postBoxContainer-${newPost.id}`)) {
                            //This post does not exist
                            author = {
                                'name': newPost.name,
                                'firstName': newPost.authorFirstName,
                                'lastName': newPost.authorLastName,
                                'profilePic': newPost.profilePic
                            }
                            createPost(newPost, author, '', false)
                        }
                    })
                    postListOld.forEach(oldPost => {
                        if (allPosts.findIndex((e) => e.id === oldPost.id) === -1){
                            //NOT IN UPDATED LIST - REMOVE IT!
                            postBoxContainer = document.getElementById(`postBoxContainer-${oldPost.id}`)
                            if (postBoxContainer){
                                postBoxContainer.remove()
                            }
                        } else {
                            //STILL IN UPDATED LIST - UPDATE IT!
                            console.log("UPDATE IT!")
                            postId = oldPost.id
                            allPosts.forEach(newPost => {
                                if (newPost.id == postId) {
                                    updatedPost = newPost
                                }
                            })
                            updatePost(updatedPost)
                        }
                    })

                    postListOld = []
                    allPosts.forEach(post => {
                        postListOld.push(post)
                    })
                }
                allPosts.forEach(post => {
                    const timeBox = document.getElementById(`timePosted-${post.id}`)
                    timeBox.innerText = getTimeElapsed(post)
                })


                if (JSON.stringify(comments) != JSON.stringify(commentListOld)) {
                    comments.forEach(comment => {
                        if (commentListOld.findIndex((e) => e.id === comment.id) === -1) {
                            if (!document.getElementById(`${comment.id}`)) {
                                createComment('', comment)
                            }
                        }
                    })
                    commentListOld = []
                    comments.forEach(comment => {
                        commentListOld.push(comment)
                    })
                }
                if (JSON.stringify(friends) != JSON.stringify(friendListOld)) {
                    friendListOld = friends
                }
                updateLikes(allPosts)

            },
            error: function(error) {
                console.log("ERROR:", error)
            }
        })
    }, 1000)
})

function updatePost(post) {
    const postBox = document.getElementById(`postBoxContainer-${post.id}`)
    const postContentBox = document.getElementById(`postContent-${post.id}`)
    postContentBox.innerText = post.content
}

function createPost(post, author, postComments, load) {
    const newPostBox = document.createElement("div")
    var timePostedString = getTimeElapsed(post)

    commentString = ''
    if (postComments != '') {
        postComments.slice().reverse().forEach(comment => {
            timeCommentString = getTimeElapsed(comment)
            commentString += `
            <div style="text-align:left">
                <img align="left" class="rounded-circle postAuthorProfileImage" src="${comment.profilePic}" height="35px" width="35px">      
                    <p style="overflow-wrap:anywhere;padding-top:5px;padding-bottom:5px;padding-left:10px;padding-right:10px;display:inline-block;width:auto;background:#dde2e5;margin-left:5px; border-radius:0px 20px 20px 20px;border-collapse:separate">
                        <strong id="${comment.id}">${comment.name}</strong><br>${comment.comment}
                    </p>
            </div>
            `
        })
    }
    editPostIcon = `<i id="elipses-${post.id}" class="fas fa-edit" style="margin-right:10px"></i>`
    newPostBox.innerHTML = `
    <div class="postBoxContainer text-start mx-auto" data-id="${post.id}" id="postBoxContainer-${post.id}" style="padding-left:15px;padding-right:15px;max-width:680px">
        <div class="col-sm-12" style="margin-bottom:10px;box-shadow:3px 3px 2px gray;background:#ffffff;padding-top:10px;padding-bottom:10px;margin-top:10px;border:solid 1px black">
            <div class="row">    
                <div class="col-sm-10">
                    <div class="col align-self-start">
                        <p align="left">
                            <img style="margin-left:10px;margin-right:10px" align="left" data-id="${post.id}" id="postAuthorProfileImage-${post.id}" class="rounded-circle postAuthorProfileImage" src="${author.profilePic}" height="50px" width="50px">
                            <p align="left" style="margin-left:5px">
                                <strong data-id="${post.id}" class="postAuthorName" id="postAuthorName-${post.id}">
                                    ${author.name}
                                </strong>
                                <br>
                                <small id="timePosted-${post.id}">
                                    ${timePostedString}
                                </small>
                            </p>
                        </p>
                    </div>
                </div>
                <div class="col-sm-2 text-end">
                    ${post.author == currentUser ? editPostIcon : '<i></i>'}
                </div>
            </div>

            <!--POST CONTENT SECTION-->
                <div class="container-fluid text-start text-wrap">
                    <pre class="text-start" id="postContent-${post.id}">${post.content}</pre>
                </div>
                <div style="margin-left:5px;margin-right:5px;" id="image-${post.id}" class="border-top border-bottom border-left border-right" style="width:100%; height:auto">
                    <a href="${post.postImage}"><img width="100%" height="100%" onerror="removeNode('image-${post.id}')" src="${post.postImage}"></a>
                </div>
            <!--END POST CONTENT SECTION-->

            <!--LIKE UNLIKE SECTION-->
                <div class="border-dark border-top border-bottom text-center pt-2 pb-2 mt-2">
                    <form class="likeControl" id="likeControl-${post.id}" data-form-id="${post.id}">
                        <button href="#" class="btn btn-primary" >
                            <i id="like-unlike-${post.id}" class="fas fa-thumbs-up">
                                ${post.liked ? 
                                    ` Unlike (${post.count})` : 
                                    ` Like (${post.count})`
                                }
                            </i>
                        </button>
                    </form>
                </div>
            <!--END LIKE UNLIKE SECTION-->

            <!--COMMENT SECTON-->
                <div style="margin-left:10px;" class="commentContainer" id="${post.id}" data-id="${post.id}" data-container-id="${post.id}">
                    <p class="text-center">Comments:</p>
                    ${commentString}
                </div>
                <div style="margin-left:25px;margin-right:25px">
                    <form id="commentForm-${post.id}" class="commentControl" data-form-id="${post.id}">
                        <input style="background:#DDE2E5" id="comment-${post.id}" name="comment" class="form-control" type="text" placeholder="Leave a comment">
                        <div class="input-group-btn">
                            <button style="margin-top:5px" class="btn btn-primary" type="submit" name="comment_submit">Comment</button>
                        </div>
                    </form>
                </div>
            <!--END COMMENT SECTON-->
        </div>            
    `
    if (!load) {
        postBox.insertBefore(newPostBox, postBox.childNodes[0])
    }
    else{
        postBox.appendChild(newPostBox)
    }
}

function getTimeElapsed(obj) {
    var timePostedString
    var dateNow = Date.now();
    var newDateNow = new Date(dateNow)
    var postTime = new Date(obj.created)
    var timeElasped = Math.floor((newDateNow - postTime) /1000)
    if (!timeElasped) {
        timeElasped = 0
    }
    if (timeElasped < 5) {
        timePostedString = `Just Now`
    }
    else if (timeElasped < 60){
        
        timePostedString = `${timeElasped} seconds ago`
    }
    else if (timeElasped >= 60 && timeElasped < 3600){
        timeElasped = Math.floor(timeElasped/60)
        if (timeElasped == 1) {
            timePostedString = `${timeElasped} minute ago`
        } else {
            timePostedString = `${timeElasped} minutes ago`
        }
        
    }
    else if (timeElasped >= 3600 && timeElasped < 86400) {
        timeElasped = Math.floor(timeElasped / 3600)
        if (timeElasped == 1) {
            timePostedString = `${timeElasped} hour ago`
        } else {
            timePostedString = `${timeElasped} hours ago`
        }
    }
    else if (timeElasped >= 86400) {
        timeElasped = Math.floor(timeElasped/86400)
        if (timeElasped == 1) {
            timePostedString = `${timeElasped} day ago`
        } else {
            timePostedString = `${timeElasped} days ago`
        }
    }
    return timePostedString
}

loadOnce()