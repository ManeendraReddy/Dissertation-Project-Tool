document.addEventListener('DOMContentLoaded', function () {
    // Function to initialize like/dislike interactions and post options for a given post
    function initializePostInteractions(postCard) {
        const likeIcon = postCard.querySelector('.like-icon');
        const dislikeIcon = postCard.querySelector('.dislike-icon');
        const postId = postCard.dataset.postId;

        // Initialize the like and dislike states based on local storage
        if (localStorage.getItem(`likedPost_${postId}`)) {
            likeIcon.classList.add('liked');
            likeIcon.style.color = '#fec006';
        }
        if (localStorage.getItem(`dislikedPost_${postId}`)) {
            dislikeIcon.classList.add('disliked');
            dislikeIcon.style.color = '#fec006';
        }

        // Handle like icon click
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

        // Handle dislike icon click
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

        // Handle post options toggle (three dots)
        const postOptionsToggle = postCard.querySelector('.post-options-toggle');
        const postOptionsDropdown = postCard.querySelector('.post-options-dropdown');

        postOptionsToggle.addEventListener('click', function (event) {
            event.stopPropagation(); // Prevent the event from bubbling up
            postOptionsDropdown.classList.toggle('d-none');
        });

        // Close dropdown if clicked outside
        document.addEventListener('click', function () {
            if (!postOptionsDropdown.classList.contains('d-none')) {
                postOptionsDropdown.classList.add('d-none');
            }
        });

        // Prevent dropdown from closing when clicked inside
        postOptionsDropdown.addEventListener('click', function (event) {
            event.stopPropagation();
        });

        // Handle edit post button click
        postCard.querySelector('.edit-post-btn').addEventListener('click', function () {
            const modal = new bootstrap.Modal(document.getElementById('newPostModal'));
            const postTitleElement = postCard.querySelector('.card-content h5');
            const postTitle = postTitleElement.textContent;
            const postTitleInput = document.getElementById('postTitle');

            // Set the modal input value to the current post title
            postTitleInput.value = postTitle;

            // Store the post being edited using a data attribute on the form
            document.getElementById('newPostForm').dataset.editingPostId = postId;

            // Change the modal title to indicate editing
            document.getElementById('newPostModalLabel').textContent = 'Edit Your Question';

            modal.show();
        });

        // Handle delete post button click
        postCard.querySelector('.delete-post-btn').addEventListener('click', function () {
            if (confirm('Are you sure you want to delete this post?')) {
                postCard.remove();
                sortPosts();
            }
        });
    }

    // Function to sort posts based on likes and dislikes
    function sortPosts() {
        const postsContainer = document.getElementById('postsContainer');
        const posts = Array.from(postsContainer.children);

        posts.sort((a, b) => {
            const likesA = parseInt(a.querySelector('.like-icon span').textContent, 10);
            const dislikesA = parseInt(a.querySelector('.dislike-icon span').textContent, 10);
            const likesB = parseInt(b.querySelector('.like-icon span').textContent, 10);
            const dislikesB = parseInt(b.querySelector('.dislike-icon span').textContent, 10);

            // Sort primarily by likes descending
            if (likesB !== likesA) {
                return likesB - likesA;
            }

            // If likes are equal, sort by dislikes ascending
            return dislikesA - dislikesB;
        });

        // Re-append posts in sorted order
        posts.forEach(post => postsContainer.appendChild(post));
    }

    // Show the modal when the + button is clicked
    document.querySelector('.new-post-btn').addEventListener('click', function () {
        const newPostForm = document.getElementById('newPostForm');
        const modalLabel = document.getElementById('newPostModalLabel');

        // Reset form for new post
        newPostForm.reset();
        delete newPostForm.dataset.editingPostId;

        // Reset modal title to indicate new post creation
        modalLabel.textContent = 'Post a New Question';

        const newPostModal = new bootstrap.Modal(document.getElementById('newPostModal'));
        newPostModal.show();
    });

    // Handle form submission for creating or editing a post
    document.getElementById('newPostForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const postId = this.dataset.editingPostId;
        const postTitle = document.getElementById('postTitle').value.trim();

        if (!postTitle) {
            alert('Question cannot be empty.');
            return;
        }

        if (postId) {
            // Editing an existing post
            const postCard = document.querySelector(`[data-post-id="${postId}"]`);
            const postTitleElement = postCard.querySelector('.card-content h5');
            postTitleElement.textContent = postTitle;

            // Optionally, you can update the timestamp to reflect the edit time
            const postTimeElement = postCard.querySelector('.post-time');
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
            const formattedDate = now.toLocaleDateString('en-UK', options);
            postTimeElement.textContent = formattedDate;

            // Remove the editing postId after updating
            delete this.dataset.editingPostId;

            // Reset modal title
            document.getElementById('newPostModalLabel').textContent = 'Post a New Question';
        } else {
            // Creating a new post
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
            const formattedDate = now.toLocaleDateString('en-UK', options);

            const newPost = document.createElement('div');
            newPost.classList.add('post-card');
            newPost.dataset.postId = Date.now(); // Unique identifier for the post
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

            // Initialize interactions for the new post
            initializePostInteractions(newPost);
        }

        // Reset the form and hide the modal
        this.reset();
        const newPostModalInstance = bootstrap.Modal.getInstance(document.getElementById('newPostModal'));
        newPostModalInstance.hide();

        // Sort posts after adding or editing
        sortPosts();
    });

    // Initialize interactions for existing posts on page load
    document.querySelectorAll('.post-card').forEach(initializePostInteractions);

    // Initial sorting of posts
    sortPosts();

    // Utility function to escape HTML to prevent XSS
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }
});
