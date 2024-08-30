document.addEventListener('DOMContentLoaded', function () {
    // Function to initialize like/dislike interactions for posts
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
                // If already liked, toggle off the like
                likeIcon.classList.remove('liked');
                likeIcon.style.color = '';
                likeIcon.querySelector('span').textContent--;
                localStorage.removeItem(`likedPost_${postId}`);
            } else {
                // Like the post
                likeIcon.classList.add('liked');
                likeIcon.style.color = '#fec006';
                likeIcon.querySelector('span').textContent++;

                // If it was disliked before, remove the dislike
                if (localStorage.getItem(`dislikedPost_${postId}`)) {
                    dislikeIcon.classList.remove('disliked');
                    dislikeIcon.style.color = '';
                    dislikeIcon.querySelector('span').textContent--;
                    localStorage.removeItem(`dislikedPost_${postId}`);
                }

                // Store the like action
                localStorage.setItem(`likedPost_${postId}`, true);
            }

            // Re-sort the posts after liking
            sortPosts();
        });

        // Handle dislike icon click
        dislikeIcon.addEventListener('click', function () {
            if (localStorage.getItem(`dislikedPost_${postId}`)) {
                // If already disliked, toggle off the dislike
                dislikeIcon.classList.remove('disliked');
                dislikeIcon.style.color = '';
                dislikeIcon.querySelector('span').textContent--;
                localStorage.removeItem(`dislikedPost_${postId}`);
            } else {
                // Dislike the post
                dislikeIcon.classList.add('disliked');
                dislikeIcon.style.color = '#fec006';
                dislikeIcon.querySelector('span').textContent++;

                // If it was liked before, remove the like
                if (localStorage.getItem(`likedPost_${postId}`)) {
                    likeIcon.classList.remove('liked');
                    likeIcon.style.color = '';
                    likeIcon.querySelector('span').textContent--;
                    localStorage.removeItem(`likedPost_${postId}`);
                }

                // Store the dislike action
                localStorage.setItem(`dislikedPost_${postId}`, true);
            }

            // Re-sort the posts after disliking
            sortPosts();
        });
    }

    // Function to sort posts based on likes and dislikes
    function sortPosts() {
        const postsContainer = document.getElementById('postsContainer');
        const posts = Array.from(postsContainer.children);

        // Sort the posts by likes (descending) and dislikes (ascending)
        posts.sort((a, b) => {
            const likesA = parseInt(a.querySelector('.like-icon span').textContent, 10);
            const dislikesA = parseInt(a.querySelector('.dislike-icon span').textContent, 10);
            const likesB = parseInt(b.querySelector('.like-icon span').textContent, 10);
            const dislikesB = parseInt(b.querySelector('.dislike-icon span').textContent, 10);

            // Compare likes first (descending)
            if (likesB !== likesA) {
                return likesB - likesA;
            }

            // If likes are equal, compare dislikes (ascending)
            return dislikesA - dislikesB;
        });

        // Reorder the posts in the container
        posts.forEach(post => postsContainer.appendChild(post));
    }

    // Show the modal when the + button is clicked
    document.querySelector('.new-post-btn').addEventListener('click', function () {
        var newPostModal = new bootstrap.Modal(document.getElementById('newPostModal'));
        newPostModal.show();
    });

    // Handle form submission
    document.getElementById('newPostForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the form from submitting the traditional way

        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
        const formattedDate = now.toLocaleDateString('en-UK', options);

        // Get the form data
        var postTitle = document.getElementById('postTitle').value;

        // Create a new post element
        var newPost = document.createElement('div');
        newPost.classList.add('post-card');
        newPost.dataset.postId = Date.now(); // Generate a unique post ID for demo purposes
        newPost.innerHTML = `
            <div class="card-header">
                <div class="user-info">
                    <i class="fa-regular fa-user"></i>
                    <div>
                        <div class="user-name">Anonymous</div>
                        <div class="post-time">${formattedDate}</div>
                    </div>
                </div>
                <i class="fas fa-ellipsis-v"></i>
            </div>
            <div class="card-content">
                <h5>${postTitle}</h5>
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

        // Add the new post to the posts container
        const postsContainer = document.getElementById('postsContainer');
        postsContainer.appendChild(newPost);

        // Clear the form
        document.getElementById('newPostForm').reset();

        // Hide the modal
        var newPostModal = bootstrap.Modal.getInstance(document.getElementById('newPostModal'));
        newPostModal.hide();

        // Re-initialize event listeners for the new post
        initializePostInteractions(newPost);

        // Re-sort posts after adding a new one
        sortPosts();
    });

    // Initialize post interactions on page load for all posts
    document.querySelectorAll('.post-card').forEach(initializePostInteractions);

    // Initial sort of posts
    sortPosts();
});
