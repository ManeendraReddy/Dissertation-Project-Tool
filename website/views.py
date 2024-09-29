import datetime
from flask import Blueprint, jsonify, render_template, request
from flask_login import login_required, current_user
from .import db
from website.models import Question

views = Blueprint('views', __name__)

@views.route('/')
def home():
    return render_template("home.html", user=current_user)




#to display posts on UI

# {% for question in questions %}
#         <div class="post-card" data-post-id="{{ question.id }}" data-likes="{{ question.likes }}" data-dislikes="{{ question.dislikes }}">
#             <div class="card-header">
#               <div class="user-info">
#                   <i class="fa-regular fa-user"></i>
#                   <div class="name">
#                     <p class="user-email">{{ question.user_email or 'Anonymous' }}</p>
#                     <p class="question-text">{{ question.question_text }}</p>
#                   </div>
#               </div>
#               <div class="post-options-container">
#                   <i class="fas fa-ellipsis-v post-options-toggle"></i>
#                   <div class="post-options-dropdown d-none">
#                     <button class="edit-post-btn btn btn-sm btn-link">Edit post</button>
#                     <button class="delete-post-btn btn btn-sm btn-link" data-session-id="{{ session_id }}" data-user-email="{{ user_email }}">Delete post</button>

#                   </div>
#               </div>
#             </div>
#             <div class="card-actions">
#                 <div class="interaction-icons">
#                     <div class="icon like-icon">
#                         <i class="fas fa-thumbs-up"></i>{{ question.likes }}
#                     </div>
#                     <div class="icon dislike-icon">
#                         <i class="fas fa-thumbs-down"></i>{{ question.dislikes }}
#                     </div>
#                     <div class="icon">
#                         <i class="fas fa-comment"></i><span>0</span>
#                     </div>
#                 </div>
#                 <div class="add-comment">Add comment</div>
#             </div>
#           </div>
#         {% endfor %}






# for edit post button

#       const postCards = document.querySelectorAll('.post-card');
  
#       postCards.forEach(card => {
#       const editButton = card.querySelector('.edit-post-btn');
  
#   if (editButton) {
#     editButton.addEventListener('click', function(e) {
#       e.preventDefault();

#       const modal = new bootstrap.Modal(document.getElementById('newPostModal'));
#       modal.show();

#       const questionTextElement = card.querySelector('.question-text');
#       const questionText = questionTextElement.textContent.trim();

#       const questionInput = document.querySelector('#newPostForm input[name="postTitle"]');
#       questionInput.value = questionText; 

#       document.getElementById('newPostForm').dataset.editingPostId = card.dataset.postId; 

#       document.getElementById('newPostModalLabel').textContent = 'Edit Your Question';
#     });
#   }
# });

#   const modal = new bootstrap.Modal(document.getElementById('newPostModal'));









    # for edit post button and update the old to new

    # // document.getElementById('newPostForm').addEventListener('submit', function(event) {
    # //     event.preventDefault();

    # //     const editingPostId = this.dataset.editingPostId;  // Get the ID of the post being edited
    # //     const postTitleInput = document.querySelector('#newPostForm input[name="postTitle"]').value.trim();
    # //     const sessionId = document.querySelector('input[name="sessionId"]').value;

    # //     // Make sure we are editing an existing post
    # //     if (editingPostId) {
    # //         fetch(`/edit_post/${editingPostId}`, {
    # //             method: 'POST',
    # //             headers: {
    # //                 'Content-Type': 'application/json',
    # //             },
    # //             body: JSON.stringify({
    # //                 sessionId: sessionId,
    # //                 question_text: postTitleInput,
    # //             }),
    # //         })
    # //         .then(response => response.json())
    # //         .then(data => {
    # //             if (data.success) {
    # //                 // Update the post text in the DOM
    # //                 const postCard = document.querySelector(`[data-post-id="${editingPostId}"]`);
    # //                 postCard.querySelector('.question-text').textContent = postTitleInput;

    # //                 // Clear the editing state and close the modal
    # //                 this.removeAttribute('data-editing-post-id');
    # //                 const modalInstance = bootstrap.Modal.getInstance(document.getElementById('newPostModal'));
    # //                 modalInstance.hide();  // Close the modal
    # //             } else {
    # //                 alert('Failed to update the post. Please try again.');
    # //             }
    # //         })
    # //         .catch(error => {
    # //             console.error('Error updating post:', error);
    # //         });
    # //     }
    # // });



#for edit post button and updating the old to new post on UI and database

# //   const postCards = document.querySelectorAll('.post-card');
              
#       //   postCards.forEach(card => {
          
#       //     const editButton = card.querySelector('.edit-post-btn');
        
#       //   if (editButton) {
#       //     editButton.addEventListener('click', function(e) {
#       //       e.preventDefault();

#       //       const modal = new bootstrap.Modal(document.getElementById('newPostModal'));
#       //       modal.show();

#       //       const questionTextElement = card.querySelector('.question-text');
#       //       const questionText = questionTextElement.textContent.trim();

#       //       const questionInput = document.querySelector('#newPostForm input[name="postTitle"]');
#       //       questionInput.value = questionText; 

#       //       document.getElementById('newPostForm').dataset.editingPostId = card.dataset.postId; 

#       //       // Change the button text to "Save Changes"
#       //       document.querySelector('#newPostModal .btn.btn-primary').textContent = 'Save Changes';
#       //       document.getElementById('newPostModalLabel').textContent = 'Edit Your Question';
#       //     });
#       //   }
#       // });

#       // // Reset the button text when the modal is hidden
#       // newPostModal.addEventListener('hidden.bs.modal', function () {
#       //   const form = newPostModal.querySelector('form');
#       //   if (form) {
#       //     form.reset();
#       //   }
#       //   // Reset button text back to "Submit"
#       //   document.querySelector('#newPostModal .btn.btn-primary').textContent = 'Submit';
#       //   resetModal(newPostModal);
#       // });
