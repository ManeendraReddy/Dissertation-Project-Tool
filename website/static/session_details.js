document.addEventListener('DOMContentLoaded', function () {
    function initializePostInteractions(postCard) {
        const likeIcon = postCard.querySelector('.like-icon');
        const dislikeIcon = postCard.querySelector('.dislike-icon');
        const commentIcon = postCard.querySelector('.fa-comment');
        const commentCountElement = postCard.querySelector('.fa-comment + span');
        const postId = postCard.dataset.postId;

        if (localStorage.getItem(`likedPost_${postId}`)) {
            likeIcon.classList.add('liked');
            likeIcon.style.color = '#fec006';
        }
        if (localStorage.getItem(`dislikedPost_${postId}`)) {
            dislikeIcon.classList.add('disliked');
            dislikeIcon.style.color = '#fec006';
        }

        likeIcon.addEventListener('click', function () {
            if (localStorage.getItem(`likedPost_${postId}`)) {
                likeIcon.classList.remove('liked');
                likeIcon.style.color = '';
                likeIcon.querySelector('span').textContent--;
                localStorage.removeItem(`likedPost_${postId}`);
            } else {
                likeIcon.classList.add('liked');
                likeIcon.style.color = '#fec006';
                likeIcon.querySelector('span').textContent++;

                if (localStorage.getItem(`dislikedPost_${postId}`)) {
                    dislikeIcon.classList.remove('disliked');
                    dislikeIcon.style.color = '';
                    dislikeIcon.querySelector('span').textContent--;
                    localStorage.removeItem(`dislikedPost_${postId}`);
                }

                localStorage.setItem(`likedPost_${postId}`, true);
            }

            sortPosts();
        });

        dislikeIcon.addEventListener('click', function () {
            if (localStorage.getItem(`dislikedPost_${postId}`)) {
                dislikeIcon.classList.remove('disliked');
                dislikeIcon.style.color = '';
                dislikeIcon.querySelector('span').textContent--;
                localStorage.removeItem(`dislikedPost_${postId}`);
            } else {
                dislikeIcon.classList.add('disliked');
                dislikeIcon.style.color = '#fec006';
                dislikeIcon.querySelector('span').textContent++;

                if (localStorage.getItem(`likedPost_${postId}`)) {
                    likeIcon.classList.remove('liked');
                    likeIcon.style.color = '';
                    likeIcon.querySelector('span').textContent--;
                    localStorage.removeItem(`likedPost_${postId}`);
                }

                localStorage.setItem(`dislikedPost_${postId}`, true);
            }

            sortPosts();
        });

        const postOptionsToggle = postCard.querySelector('.post-options-toggle');
        const postOptionsDropdown = postCard.querySelector('.post-options-dropdown');

        postOptionsToggle.addEventListener('click', function (event) {
            event.stopPropagation();
            postOptionsDropdown.classList.toggle('d-none');
        });

        document.addEventListener('click', function () {
            if (!postOptionsDropdown.classList.contains('d-none')) {
                postOptionsDropdown.classList.add('d-none');
            }
        });

        postOptionsDropdown.addEventListener('click', function (event) {
            event.stopPropagation();
        });

        postCard.querySelector('.edit-post-btn').addEventListener('click', function () {
            const modal = new bootstrap.Modal(document.getElementById('newPostModal'));
            const postTitleElement = postCard.querySelector('.card-content h5');
            const postTitle = postTitleElement.textContent;
            const postTitleInput = document.getElementById('postTitle');

            postTitleInput.value = postTitle;
            document.getElementById('newPostForm').dataset.editingPostId = postId;
            document.getElementById('newPostModalLabel').textContent = 'Edit Your Question';

            modal.show();
        });

        postCard.querySelector('.delete-post-btn').addEventListener('click', function () {
            if (confirm('Are you sure you want to delete this post?')) {
                postCard.remove();
                sortPosts();
            }
        });

        // Handle inline comment input and publishing
        const addCommentBtn = postCard.querySelector('.add-comment');
        addCommentBtn.addEventListener('click', function () {
            const commentInputContainer = document.createElement('div');
            commentInputContainer.classList.add('comment-input-container');

            commentInputContainer.innerHTML = `
                <textarea class="form-control comment-input" placeholder="Comment here..."></textarea>
                <button class="btn cancel-comment">
                    <i class="fas fa-times"></i>
                </button>
                <button class="btn publish-comment">
                    <i class="fas fa-arrow-right"></i>
                </button>
            `;

            addCommentBtn.replaceWith(commentInputContainer);

            const publishCommentBtn = commentInputContainer.querySelector('.publish-comment');
            const cancelCommentBtn = commentInputContainer.querySelector('.cancel-comment');

            // Handle publishing the comment
            publishCommentBtn.addEventListener('click', function () {
                const commentText = commentInputContainer.querySelector('.comment-input').value.trim();
                const userName = prompt('Enter your name (if interested):', 'Anonymous'); // Prompt for user name
                
                if (commentText) {
                    const commentList = postCard.querySelector('.comment-list') || createCommentList(postCard);
                    const newComment = document.createElement('div');
                    newComment.classList.add('comment');
                    newComment.innerHTML = `
                        <div class="comment-user-info d-flex justify-content-between align-items-center">
                            <div class="d-flex align-items-center">
                                <i class="fa-regular fa-user"></i>
                                <span class="user-name">${escapeHTML(userName || 'Anonymous')}</span>
                            </div>
                            <div class="comment-options-container d-flex align-items-center">
                                <button class="btn edit-comment-btn">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn delete-comment-btn">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </div>
                        <div class="comment-text">
                            ${escapeHTML(commentText)}
                        </div>
                    `;
                    commentList.appendChild(newComment);

                    // Move the "Add comment" button below the newly posted comment
                    commentList.appendChild(addCommentBtn);
                    commentInputContainer.remove();

                    // Update the comment count
                    updateCommentCount(postCard, 1);

                    // Initialize comment interactions for edit and delete
                    initializeCommentInteractions(newComment, postCard);
                } else {
                    alert('Comment cannot be empty.');
                }
            });

            // Handle cancelling the comment
            cancelCommentBtn.addEventListener('click', function () {
                commentInputContainer.replaceWith(addCommentBtn);
            });
        });
    }

    function initializeCommentInteractions(comment, postCard) {
        const commentCountElement = postCard.querySelector('.fa-comment + span');
        const commentIcon = postCard.querySelector('.fa-comment');

        comment.querySelector('.edit-comment-btn').addEventListener('click', function () {
            const commentTextElement = comment.querySelector('.comment-text');
            const originalText = commentTextElement.textContent;

            const editTextArea = document.createElement('textarea');
            editTextArea.classList.add('form-control');
            editTextArea.value = originalText;

            const saveEditBtn = document.createElement('button');
            saveEditBtn.classList.add('btn', 'btn-primary');
            saveEditBtn.textContent = 'Save';

            const cancelEditBtn = document.createElement('button');
            cancelEditBtn.classList.add('btn', 'btn-secondary');
            cancelEditBtn.textContent = 'Cancel';

            commentTextElement.replaceWith(editTextArea);
            comment.appendChild(saveEditBtn);
            comment.appendChild(cancelEditBtn);

            saveEditBtn.addEventListener('click', function () {
                const updatedText = editTextArea.value.trim();
                if (updatedText) {
                    commentTextElement.textContent = updatedText;
                    editTextArea.replaceWith(commentTextElement);
                    saveEditBtn.remove();
                    cancelEditBtn.remove();
                } else {
                    alert('Comment cannot be empty.');
                }
            });

            cancelEditBtn.addEventListener('click', function () {
                editTextArea.replaceWith(commentTextElement);
                saveEditBtn.remove();
                cancelEditBtn.remove();
            });
        });

        comment.querySelector('.delete-comment-btn').addEventListener('click', function () {
            if (confirm('Are you sure you want to delete this comment?')) {
                comment.remove();
                updateCommentCount(postCard, -1);
            }
        });
    }

    function createCommentList(postCard) {
        const commentList = document.createElement('div');
        commentList.classList.add('comment-list');
        postCard.querySelector('.card-actions').appendChild(commentList);
        return commentList;
    }

    function sortPosts() {
        const postsContainer = document.getElementById('postsContainer');
        const posts = Array.from(postsContainer.children);

        posts.sort((a, b) => {
            const likesA = parseInt(a.querySelector('.like-icon span').textContent, 10);
            const dislikesA = parseInt(a.querySelector('.dislike-icon span').textContent, 10);
            const likesB = parseInt(b.querySelector('.like-icon span').textContent, 10);
            const dislikesB = parseInt(b.querySelector('.dislike-icon span').textContent, 10);

            if (likesB !== likesA) {
                return likesB - likesA;
            }

            return dislikesA - dislikesB;
        });

        posts.forEach(post => postsContainer.appendChild(post));
    }

    function updateCommentCount(postCard, delta) {
        const commentCountElement = postCard.querySelector('.fa-comment + span');
        let commentCount = parseInt(commentCountElement.textContent, 10) || 0;
        commentCount += delta;
        commentCountElement.textContent = commentCount;

        const commentIcon = postCard.querySelector('.fa-comment');
        if (commentCount > 0) {
            commentIcon.style.color = '#fec006';
            commentCountElement.style.color = '#fec006';
        } else {
            commentIcon.style.color = '';
            commentCountElement.style.color = '';
        }
    }

    document.querySelector('.new-post-btn').addEventListener('click', function () {
        const newPostForm = document.getElementById('newPostForm');
        const modalLabel = document.getElementById('newPostModalLabel');

        newPostForm.reset();
        delete newPostForm.dataset.editingPostId;
        modalLabel.textContent = 'Post a New Question';

        const newPostModal = new bootstrap.Modal(document.getElementById('newPostModal'));
        newPostModal.show();
    });

    document.getElementById('newPostForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const postId = this.dataset.editingPostId;
        const postTitle = document.getElementById('postTitle').value.trim();

        if (!postTitle) {
            alert('Question cannot be empty.');
            return;
        }

        if (postId) {
            const postCard = document.querySelector(`[data-post-id="${postId}"]`);
            const postTitleElement = postCard.querySelector('.card-content h5');
            postTitleElement.textContent = postTitle;

            const postTimeElement = postCard.querySelector('.post-time');
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
            const formattedDate = now.toLocaleDateString('en-UK', options);
            postTimeElement.textContent = formattedDate;

            delete this.dataset.editingPostId;
            document.getElementById('newPostModalLabel').textContent = 'Post a New Question';
        } else {
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
            const formattedDate = now.toLocaleDateString('en-UK', options);

            const newPost = document.createElement('div');
            newPost.classList.add('post-card');
            newPost.dataset.postId = Math.random().toString(36).substr(2, 9);
            newPost.innerHTML = `
                <div class="card-header">
                    <div class="user-info">
                        <i class="fa-regular fa-user"></i>
                        <div>
                            <div class="user-name">Anonymous</div>
                            <div class="post-time">${formattedDate}</div>
                        </div>
                    </div>
                    <div class="post-options-container">
                        <i class="fas fa-ellipsis-v post-options-toggle"></i>
                        <div class="post-options-dropdown d-none">
                            <button class="edit-post-btn btn btn-sm btn-link">Edit post</button>
                            <button class="delete-post-btn btn btn-sm btn-link">Delete post</button>
                        </div>
                    </div>
                </div>
                <div class="card-content">
                    <h5>${escapeHTML(postTitle)}</h5>
                </div>
                <div class="card-actions">
                    <div class="interaction-icons">
                        <div class="icon like-icon">
                            <i class="fas fa-thumbs-up"></i><span>0</span>
                        </div>
                        <div class="icon dislike-icon">
                            <i class="fas fa-thumbs-down"></i><span>0</span>
                        </div>
                        <div class="icon">
                            <i class="fas fa-comment"></i><span>0</span>
                        </div>
                    </div>
                    <div class="add-comment">Add comment</div>
                </div>
            `;

            const postsContainer = document.getElementById('postsContainer');
            postsContainer.appendChild(newPost);

            initializePostInteractions(newPost);
        }

        this.reset();
        const newPostModalInstance = bootstrap.Modal.getInstance(document.getElementById('newPostModal'));
        newPostModalInstance.hide();

        sortPosts();
    });

    document.querySelectorAll('.post-card').forEach(initializePostInteractions);
    sortPosts();

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }
});
