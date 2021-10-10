const postBox = document.getElementById("posts-box")
const friendList = document.getElementById("friendList")
var postListOld, commentListOld, friendListOld, likeListOld, likeChanged

const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i=0; i < cookies.length; i++){
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
    const postForm = document.getElementById("postSubmit")
    const postInput = document.getElementById('postInput')
    postForm.addEventListener("submit", e => {
        e.preventDefault()
        $.ajax ({
            type: 'POST',
            url: 'postControl/',
            data: {
                'csrfmiddlewaretoken': csrftoken,
                'postContent': postInput.value
            },
            success: function(response) {
                postInput.value = ''
                postInput.style.height="50px"
                newPost = response.post
                author = response.author
                createPost(newPost, author, '', false)
                likeControl()
                commentControl()
            },
            error: function(error) {
                console.log("ERROR:", error)
            }
        })
    })
    $.ajax({
        type: 'GET',
        url: '/data/',
        success: function(response) {
            const allPosts = response.allPosts
            const currentUser = response.currentUser
            const friends = response.friends
            const comments = response.comments
            var postComments = []
            postListOld = []
            friendListOld = friends
            commentListOld = comments
            allPosts.forEach(post => {
                postListOld.push(post)
            })

            friends.forEach(friend =>{
                friendList.innerHTML += `
                    <li>${friend.firstName} ${friend.lastName}</li>
                `
            })

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
            })            
            likeControl()
            commentControl()
        },
        error: function(error) {
            console.log("ERROR:", error)
        }
    })
}

const likeControl = () => {
    const likeUnlikeForms = [...document.getElementsByClassName("likeControl")]
    likeUnlikeForms.forEach(form => form.addEventListener("submit", e => {
        e.preventDefault()
        const clickedId = e.target.getAttribute('data-form-id')
        const clickedButton = document.getElementById(`like-unlike-${clickedId}`)

        $.ajax ({
            type: 'POST',
            url: "likeControl/",
            data: {
                'csrfmiddlewaretoken': csrftoken,
                'pk':clickedId,
            },
            success: function(response) {
                clickedButton.textContent = response.liked ? ` Unlike (${response.count})` : ` Like (${response.count})`
            },
            error: function(error) {
                console.log("ERROR:", error)
            }
        })
    }))
}

const commentControl = () => {
    const commentForms = [...document.getElementsByClassName("commentControl")]    
    commentForms.forEach(form => form.addEventListener("submit", e => {
        e.preventDefault()
        const clickedId = e.target.getAttribute('data-form-id')


        const commentContainer = document.getElementById(clickedId)


        const inputField = document.getElementById(`comment-${clickedId}`)
        const commentBox = document.getElementById(`postComments-${clickedId}`)
        $.ajax ({
            type: 'POST',
            url: "commentControl/",
            data: {
                'csrfmiddlewaretoken': csrftoken,
                'pk':clickedId,
                'comment': inputField.value,
            },
            success: function(response) {
                newCommentList = response.commentList
                const newComment = document.createElement("div")
                console.log("innerHTML", commentContainer.innerHTML)
                newComment.style.cssText = "text-align:left"
                newComment.innerHTML = `
                        <img align="left" class="rounded-circle postAuthorProfileImage" src="media/${response.profilePic}" height="35px" width="35px">      
                        <p style="overflow-wrap:anywhere;padding-top:5px; padding-bottom:5px;padding-left:10px;padding-right:10px;display:inline-block;width:auto;background:#dde2e5; border-radius:0px 25px 25px 25px">
                            <strong id="${response.id}">${response.commenter}</strong><br>${response.comment}
                        </p>
                `
                inputField.value = ''
                commentContainer.appendChild(newComment)
                console.log("innerHTML", commentContainer.innerHTML)
                commentListOld = newCommentList
            },
            error: function(error) {
                console.log("ERROR:", error)
            }
        })
    }))
}

function updateLikes(allPosts) {
    allPosts.forEach (post => {
        const likeContainer = document.getElementById(`like-unlike-${post.id}`)
        if (post.liked){
            likeString = ` Unlike (${post.count})`
        } else {
            likeString = ` Like (${post.count})`
        }
        likeContainer.innerText = likeString
    })

}

$(document).ready(function(){
    setInterval(function(){
        $.ajax ({
            type: 'GET',
            url: "/data/",
            success: function(response) {
                allPosts = response.allPosts
                friends = response.friends
                if (JSON.stringify(allPosts)!=JSON.stringify(postListOld)){
                    allPosts.forEach(newPost => {
                        if (postListOld.findIndex((e) => e.id === newPost.id) === -1){
                            if (!document.getElementById(`postBoxContainer-${newPost.id}`)){
                                author = {
                                    'name': newPost.name,
                                    'firstName': newPost.authorFirstName,
                                    'lastName': newPost.authorLastName,
                                    'profilePic': newPost.profilePic
                                }
                                createPost(newPost, author, '', false)
                            }
                        } 
                    })
                    postListOld = []
                    allPosts.forEach(post => {
                        postListOld.push(post)
                    })
                    updateLikes(allPosts)
                }
                if (JSON.stringify(friends)!=JSON.stringify(friendListOld)){
                    friendListOld=friends
                } 
            },
            error: function(error) {
                console.log("ERROR:", error)
            }
        })
    }, 1000)
    setInterval(function(){
        $.ajax ({
            type: 'GET',
            url: "/loadComments/",
            success: function(response) {
                comments = response.comment
                if (JSON.stringify(comments)!=JSON.stringify(commentListOld)){
                    comments.forEach(comment => {
                        if (commentListOld.findIndex((e) => e.id === comment.id) === -1){
                            if (!document.getElementById(`${comment.id}`)) {
                                commentContainer = document.getElementById(`${comment.post}`)
                                newComment = document.createElement('div')
                                newComment.style.cssText = "text-align:left"
                                newComment.innerHTML = `
                                        <img align="left" class="rounded-circle postAuthorProfileImage" src="media/${comment.profilePic}" height="35px" width="35px">      
                                        <p style="overflow-wrap:anywhere;padding-top:5px;padding-bottom:5px;padding-left:10px;padding-right:10px;display:inline-block;width:auto;background:#dde2e5;margin-left:5px; border-radius:0px 20px 20px 20px;border-collapse:separate">
                                            <strong id="${comment.id}">${comment.name}</strong><br>${comment.comment}
                                        </p>
                                `
                                commentContainer.appendChild(newComment)
                            }
                        }
                    })
                    commentListOld = []
                    comments.forEach(comment => {
                        commentListOld.push(comment)
                    })
                } 
            },
            error: function(error) {
                console.log("ERROR:", error)
            }
        })
    }, 1000)
    setInterval(function(){
        $.ajax ({
            type: 'GET',
            url: "/data/",
            success: function(response) {
                const posts = response.allPosts
                posts.forEach(post => {
                    const timeBox = document.getElementById(`timePosted-${post.id}`)
                    timeBox.innerText = getTimeElapsed(post)
                })
            },
            error: function(error) {
                console.log("ERROR:", error)
            }
        })
    }, 60000)
})

function createPost(post, author, postComments, load) {
    const newPostBox = document.createElement("div")
    var timePostedString = getTimeElapsed(post)

    commentString = ''
    if (postComments != ''){
        postComments.slice().reverse().forEach(comment => {
            commentString += `
            <div style="text-align:left">
                <img align="left" class="rounded-circle postAuthorProfileImage" src="media/${comment.profilePic}" height="35px" width="35px">      
                    <p style="overflow-wrap:anywhere;padding-top:5px;padding-bottom:5px;padding-left:10px;padding-right:10px;display:inline-block;width:auto;background:#dde2e5;margin-left:5px; border-radius:0px 20px 20px 20px;border-collapse:separate">
                        <strong id="${comment.id}">${comment.name}</strong><br>${comment.comment}
                    </p>
            </div>
            `
        })
    }
    newPostBox.innerHTML = `
    <div class="postBoxContainer" data-id="${post.id}" id="postBoxContainer-${post.id}" style="margin-left:5px;margin-right:5px">
        <div class="col-sm-12" style="margin-bottom:10px;box-shadow:3px 3px 2px gray;background:#ffffff;padding-top:10px;padding-bottom:10px;margin-top:10px;border:solid 1px black">
        <div>
            <p align="left">
                <img style="margin-right:10px" align="left" data-id="${post.id}" id="postAuthorProfileImage-${post.id}" class="rounded-circle postAuthorProfileImage" src="media/${author.profilePic}" height="50px" width="50px">
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
        <div>
            <p align="left" style="overflow-wrap: anywhere" class="postContent" data-id="${post.id}" id="postContent-${post.id}"><pre style="overflow-x:auto;white-space:pre-wrap;white-space:-moz-pre-wrap;white-space:-pre-wrap;white-space:-o-pre-wrap;word-wrap:break-word" align="left">${post.content}</pre></p>
        </div>
        <div style="padding-top:5px;padding-bottom:5px;margin-left:25%;margin-right:25%;margin-top:10px;margin-bottom:10px" class="border-dark border-top border-bottom">
                <form class="likeControl" data-form-id="${post.id}">
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
            <div class="commentContainer" id="${post.id}" data-id="${post.id}" data-container-id="${post.id}">
                Comments:    
                <p style="overflow-wrap: anywhere" class="postComment" data-id="${post.id}" id="postComments-${post.id}">${commentString}</p>
            </div>
            <div>
                <form class="commentControl" data-form-id="${post.id}">
                    <input style="background:#DDE2E5" id="comment-${post.id}" name="comment" class="form-control" type="text" placeholder="Leave a comment">
                    <div class="input-group-btn">
                        <button style="margin-top:5px" class="btn btn-primary" type="submit" name="comment_submit">Comment</button>
                    </div>
                </form>
            </div>
    </div>            
    `
    if (!load) {
        postBox.insertBefore(newPostBox, postBox.childNodes[0])
    }
    else{
        postBox.appendChild(newPostBox)
    }
    likeControl()
    commentControl()
}

function getTimeElapsed(post) {
    var timePostedString
    var dateNow = Date.now();
    var newDateNow = new Date(dateNow)
    var postTime = new Date(post.created)
    var timeElasped = Math.floor((newDateNow - postTime) /1000)
    if (!timeElasped) {
        timeElasped = 0
    }
    if (timeElasped < 60){
        timePostedString = `${timeElasped} seconds ago`
    }
    else if (timeElasped >= 60 && timeElasped < 3600){
        timeElasped = Math.floor(timeElasped/60)
        timePostedString = `${timeElasped} minutes ago`
    }
    else if (timeElasped >= 3600 && timeElasped < 86400) {
        timeElasped = Math.floor(timeElasped / 3600)
        timePostedString = `${timeElasped} hours ago`
    }
    else if (timeElasped >= 86400) {
        timeElasped = Math.floor(timeElasped/86400)
        timePostedString = `${timeElasped} days ago`
    }
    return timePostedString
}

loadOnce()

