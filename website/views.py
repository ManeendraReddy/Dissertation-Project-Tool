import datetime
from flask import Blueprint, jsonify, render_template, request
from flask_login import login_required, current_user
from .import db
from website.models import Question

views = Blueprint('views', __name__)

@views.route('/')
def home():
    return render_template("home.html", user=current_user)





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
