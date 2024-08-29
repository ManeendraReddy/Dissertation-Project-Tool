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
          <div class="icon">
            <i class="fas fa-thumbs-up"></i><span>0</span>
          </div>
          <div class="icon">
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
    document.getElementById('postsContainer').appendChild(newPost);
  
    // Clear the form
    document.getElementById('newPostForm').reset();
  
    // Hide the modal
    var newPostModal = bootstrap.Modal.getInstance(document.getElementById('newPostModal'));
    newPostModal.hide();
  });
  