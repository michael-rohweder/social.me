const postBox = document.getElementById("posts-box")
const friendList = document.getElementById("friendList")
var postListOld, commentListOld, friendListOld, likeListOld

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

const loadComments = () => {
    $.ajax({
        type: 'GET',
        url: '/loadComments/',
        success: function(response) {
            const commentContainers = [...document.getElementsByClassName('commentContainer')]
            const returnedData = response.comment
            commentListOld = returnedData
            commentContainers.forEach(container => {
                const formId = container.getAttribute('data-container-id')
                const commentBox = document.getElementById(`postComments-${formId}`)
                commentBox.innerHTML = ''
                returnedData.forEach(r => {
                    if (r.post==formId){
                        commentBox.innerHTML += `
                        <strong>${r.commenter}:</strong> ${r.comment}<br>
                    `
                    }
                })
            })            
        },
        error: function(error) {
            console.log("Error:", error)
        }
    })
}

const commentControl = () => {
    const commentForms = [...document.getElementsByClassName("commentControl")]    
    commentForms.forEach(form => form.addEventListener("submit", e => {
        e.preventDefault()
        const clickedId = e.target.getAttribute('data-form-id')
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
                
                commentBox.innerHTML += `
                    <strong>${response.commenter}:</strong> ${response.comment}<br>
                `
                inputField.value = ''
            },
            error: function(error) {
                console.log("ERROR:", error)
            }
        })
    }))
}

const postControl = () => {
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
                console.log("POST CONTROL")
                postInput.value = ''
            },
            error: function(error) {
                console.log("ERROR:", error)
            }
        })
    })
}

const loadOnce = () => {
    $.ajax({
        type: 'GET',
        url: '/data/',
        success: function(response) {
            const data = response.data
            const friends = response.friends
            friendListOld = friends
            postListOld = data
            friendList.innerHTML = ''
            friends.forEach(element => {
                friendList.innerHTML += `
                    <li>${element.firstName} ${element.lastName}</li>
                `
            });
            postBox.innerHTML = ''
            data.forEach(element => {     
                postBox.innerHTML += `
                <div class="row" style="margin-left:5px;margin-right:5px">
                    <div class="col-sm-12" style="margin-bottom:10px;box-shadow:3px 3px 2px gray;background:#f0ebeb;padding-top:10px;padding-bottom:10px;margin-top:10px;border:solid 1px black">
                    <div>
                        <p>
                            <img class="rounded-circle" src="media/${element.profilePic}" height="50px" width="50px">
                            <strong>${element.name}</strong>
                        </p>
                    </div>
                    <div>
                        <p style="overflow-wrap: anywhere">${element.content}</p>
                    </div>
                    <div style="padding-top:5px;padding-bottom:5px;margin-left:25%;margin-right:25%;margin-top:10px;margin-bottom:10px" class="border-dark border-top border-bottom">
                            <form class="likeControl" data-form-id="${element.id}">
                                <button href="#" class="btn btn-primary" >
                                    <i id="like-unlike-${element.id}" class="fas fa-thumbs-up">
                                        ${element.liked ? 
                                            ` Unlike (${element.count})` : 
                                            ` Like (${element.count})`
                                        }
                                    </i>
                                </button>
                            </form>
                        </div>
                        <div class="commentContainer" data-container-id="${element.id}">
                            Comments:    
                            <p style="overflow-wrap: anywhere" id="postComments-${element.id}"></p>
                        </div>
                        <div>
                            <form class="commentControl" data-form-id="${element.id}">
                                <input id="comment-${element.id}" name="comment" class="form-control" type="text" placeholder="Leave a comment">
                                <div class="input-group-btn">
                                    <button class="btn btn-primary" type="submit" name="comment_submit">Comment</button>
                                </div>
                            </form>
                        </div>
                </div>            
                `
            });
            likeControl()
            loadComments()
            commentControl()
        },
        error: function(error) {
            console.log("ERROR:", error)
        }
    })
}

$(document).ready(function(){
    setInterval(function(){
        $.ajax ({
            type: 'GET',
            url: "/data/",
            success: function(response) {
                data = response.data
                friends = response.friends
                
                if (JSON.stringify(data)!=JSON.stringify(postListOld)){
                    updatePosts()
                }
                if (JSON.stringify(friends)!=JSON.stringify(friendListOld)){
                    updateFriends(friends)
                    postListOld=data
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
                data = response.comment
                if (JSON.stringify(data)!=JSON.stringify(commentListOld)){
                    updateComments(data)
                    commenListOld=data
                } 
            },
            error: function(error) {
                console.log("ERROR:", error)
            }
        })
    }, 1000)
})

function updateFriends(friends) {
    friendList.innerHTML = ''
            friends.forEach(element => {
                friendList.innerHTML += `
                    <li>${element.firstName} ${element.lastName}</li>
                `
            });
    return None
}

function updateComments(comments) {
    loadOnce()
    return None
}

const updatePosts = () => {
    loadOnce()
}

postControl()
loadOnce()

