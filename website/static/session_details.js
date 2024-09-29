document.addEventListener('DOMContentLoaded', function () {    
    
    function initializePostInteractions(postCard) {
        const likeIcon = postCard.querySelector('.like-icon');
        const dislikeIcon = postCard.querySelector('.dislike-icon');
        const commentIcon = postCard.querySelector('.fa-comment');
        const commentCountElement = postCard.querySelector('.fa-comment + span');
        const postId = postCard.dataset.postId;
        if (postCard.dataset.liked) {
            likeIcon.classList.add('liked');
            likeIcon.style.color = '#fec006';
        }
        if (postCard.dataset.disliked) {
            dislikeIcon.classList.add('disliked');
            dislikeIcon.style.color = '#fec006';
        }



        likeIcon.addEventListener('click', function () {
        if (postCard.dataset.liked) {
            likeIcon.classList.remove('liked');
            likeIcon.style.color = '';
            likeIcon.querySelector('span').textContent--;
            postCard.dataset.liked = '';
        } else {
            likeIcon.classList.add('liked');
            likeIcon.style.color = '#fec006';
            likeIcon.querySelector('span').textContent++;
            if (postCard.dataset.disliked) {
                dislikeIcon.classList.remove('disliked');
                dislikeIcon.style.color = '';
                dislikeIcon.querySelector('span').textContent--;
                postCard.dataset.disliked = '';
            }
            postCard.dataset.liked = 'true';
        }

        sortPosts();
    });
        dislikeIcon.addEventListener('click', function () {
            if (postCard.dataset.disliked) {
                dislikeIcon.classList.remove('disliked');
                dislikeIcon.style.color = '';
                dislikeIcon.querySelector('span').textContent--;
                postCard.dataset.disliked = '';
            } else {
                dislikeIcon.classList.add('disliked');
                dislikeIcon.style.color = '#fec006';
                dislikeIcon.querySelector('span').textContent++;
                if (postCard.dataset.liked) {
                    likeIcon.classList.remove('liked');
                    likeIcon.style.color = '';
                    likeIcon.querySelector('span').textContent--;
                    postCard.dataset.liked = '';
                }
                postCard.dataset.disliked = 'true';
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
                const postId = postCard.dataset.postId;
                deletePostFromServer(postId);
                postCard.remove();
                sortPosts();
            }
        });

        function deletePostFromServer(postId) {
            const sessionId = document.querySelector('input[name="sessionId"]').value;
            const url = `/api/delete_post/${postId}/${sessionId}`;
        
            fetch(url, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    console.log('Post deleted successfully');
                    refreshUI(postId);
                } else {
                    console.error('Failed to delete post:', data.error);
                }
            })
            .catch(error => {
                console.error('Error deleting post:', error);
            });
            
        }
        
        function refreshUI(postId) {
            const postCard = document.querySelector(`[data-post-id="${postId}"]`);
            if (postCard) {
                postCard.remove();
                sortPosts();
            }
        }
        

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

            publishCommentBtn.addEventListener('click', function () {
                const commentText = commentInputContainer.querySelector('.comment-input').value.trim();
                const userName = 'Anonymous'
                
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

                    commentList.appendChild(addCommentBtn);
                    commentInputContainer.remove();

                    updateCommentCount(postCard, 1);

                    initializeCommentInteractions(newComment, postCard);
                } else {
                    alert('Comment cannot be empty.');
                }
            });

            cancelCommentBtn.addEventListener('click', function () {
                commentInputContainer.replaceWith(addCommentBtn);
            });
        });
    }

    function initializeCommentInteractions(comment, postCard) {
        const commentCountElement = postCard.querySelector('.fa-comment + span');

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

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    const newPostForm = document.getElementById('newPostForm');

    newPostForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = new FormData(newPostForm);
        const sessionId = document.querySelector('input[name="sessionId"]').value;

        formData.append('sessionId', sessionId);

        if (!sessionId) {
            alert('Session ID is missing.');
            return;
        }

        fetch(newPostForm.action, {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Question posted successfully!');
                newPostForm.reset(); 
                const modal = bootstrap.Modal.getInstance(document.getElementById('newPostModal'));
                modal.hide(); 
            } else {
                alert('Error posting question');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });





    const sessionDetailsElement = document.getElementById('sessionDetails');
    if (sessionDetailsElement) {
        observer.observe(sessionDetailsElement);
    }
      document.querySelector('.new-post-btn').addEventListener('click', function () {
        const newPostForm = document.getElementById('newPostForm');
        const modalLabel = document.getElementById('newPostModalLabel');
    
        document.querySelectorAll('#newPostForm input, #newPostForm textarea').forEach(input => {
            input.value = '';
        });
    
        newPostForm.reset();
        delete newPostForm.dataset.editingPostId;
        modalLabel.textContent = 'Post a New Question';
    
        const newPostModal = new bootstrap.Modal(document.getElementById('newPostModal'));
        newPostModal.show();
    
        document.querySelector('.modal-backdrop').style.transition = 'none';
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
    
        document.querySelector('.modal-backdrop').remove();

        sortPosts();
    });

    document.querySelectorAll('.post-card').forEach(initializePostInteractions);
    sortPosts();



    function handlePostSubmit(event) {
        event.preventDefault(); // Prevent default form submission
      
        const form = document.getElementById('newPostForm');
        const postId = form.querySelector('input[name="postId"]').value; // Get the post ID if it's an edit
        const questionText = form.querySelector('input[name="postTitle"]').value; // Get the question text
      
        console.log('Submitting the form...');
        console.log('Post ID:', postId);
        console.log('Question Text:', questionText);
      
        // Check if we are editing an existing post or creating a new one
        if (postId) {
          console.log('Editing post...');
      
          // Send an AJAX request to update the post
          fetch(`/edit_post/${postId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId: form.querySelector('input[name="sessionId"]').value,
              question_text: questionText,
            }),
          })
          .then(response => response.json())
          .then(data => {
            console.log('Server response:', data);
            if (data.success) {
              // Update the UI with the new question text
              const postCard = document.querySelector(`.post-card[data-post-id="${postId}"]`);
              postCard.querySelector('.question-text').textContent = questionText;
      
              // Hide the modal
              const modal = bootstrap.Modal.getInstance(document.getElementById('newPostModal'));
              modal.hide();
            } else {
              alert('Failed to update the post.');
            }
          })
          .catch(error => {
            console.error('Error updating post:', error);
          });
        } 
        // else {
        //   // If no postId, create a new post by submitting the form as usual
        //   console.log('Creating a new post...');
        //   form.submit();
        // }
      
        return false; // Prevent the default form action
      }
    

    // ------------------------------------------------------------------------------------------------

    const createPollBtn = document.getElementById('createPollBtn');
    createPollBtn.addEventListener('click', function() {
        pollForm.style.display = 'block';
        mainOptions.style.display = 'none';
        newFeatureModal.classList.remove('fade');
        document.querySelectorAll('.modal-backdrop').forEach(function(backdrop) {
            backdrop.remove();
        });
    });

    const pollForm = document.getElementById('pollForm');
    if (pollForm) {
        pollForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const pollQuestion = document.getElementById('pollQuestion').value;
            const option1 = document.getElementById('pollOption1').value;
            const option2 = document.getElementById('pollOption2').value;
            const option3 = document.getElementById('pollOption3').value || '';
            const option4 = document.getElementById('pollOption4').value || '';

            const url = '/api/create_poll';
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    session_id: document.querySelector('.session-id > b').textContent.split(': ')[1],
                    poll_question: pollQuestion,
                    options: [option1, option2, option3, option4]
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    closePopupAutomatically();
                    addPollToUI(data.poll);
                    resetModal(newFeatureModal);
                    const modal = bootstrap.Modal.getInstance(document.getElementById('newFeatureModal'));
                    modal.hide();
                    document.querySelector('.modal-backdrop').remove();
                    pollForm.reset();
                    document.getElementById('mainOptions').style.display = 'block';
                    pollForm.style.display = 'none';
                } else {
                    alert('Failed to create poll: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });

            setTimeout(function() {
                pollForm.style.display = 'none';
                newFeatureModal.classList.remove('fade');
                document.querySelectorAll('.modal-backdrop').forEach(function(backdrop) {
                    backdrop.remove();
                });
                mainOptions.style.display = 'block';

                const inputs = pollForm.getElementsByTagName('input');
                for (let i = 0; i < inputs.length; i++) {
                    inputs[i].value = '';
                }
            }, 100);
        });
    }

    function addPollToUI(pollData) {
        const professorContainer = document.getElementById('professorContainer');
        const existingPollContainer = professorContainer.querySelector('.poll-container');
        if (!existingPollContainer) {
            const pollContainer = document.createElement('div');
            pollContainer.className = 'poll-container';
            professorContainer.appendChild(pollContainer);
        }
        const pollElement = document.createElement('div');
        pollElement.className = 'poll-box';
        
        const pollContent = 
            `<h4>${pollData.question}</h4>
            ${pollData.options.map((option, index) => 
                `<p class="poll-option">
                    <span class="circle"></span>
                    <span class="poll-option-text">${escapeHTML(option.option_text)}</span>
                    <span class="vote-count">(<strong>${option.votes}</strong> v)</span>
                </p>`
            ).join('')}
           `;
            
        pollElement.innerHTML = pollContent;
        professorContainer.querySelector('.poll-container').appendChild(pollElement);
    
        initializePollInteractions(pollElement, pollData);
        document.getElementById('newPostModal').style.display = 'none';
        document.querySelector('.modal-backdrop').remove();

        const totalVoteCounter = document.createElement('div');
        totalVoteCounter.className = 'total-vote-counter';
        totalVoteCounter.textContent = 'Total Votes: 0';
        professorContainer.querySelector('.poll-container').appendChild(totalVoteCounter);
    }
    
    function initializePollInteractions(pollElement, pollData) {
        const options = pollElement.querySelectorAll('.poll-option');
        const pollId = pollData.id;

        options.forEach((option, index) => {
            option.addEventListener('click', function() {
                selectPollOption(this, index, pollData, pollId);
            });
        });
    
        const storedSelection = localStorage.getItem(`poll_selection_${pollId}`);
        if (storedSelection !== null) {
            const selectedOption = options[parseInt(storedSelection)];
            selectPollOption(selectedOption, parseInt(storedSelection), pollData, pollId);
        }
    }
    
    function selectPollOption(option, selectedIndex, pollId) {
        console.log("Selecting option:", selectedIndex);
        console.log("Current pollId:", pollId);
      
        const options = option.parentNode.querySelectorAll('.poll-option');
      
        let previouslySelectedOption;
        options.forEach((opt, index) => {
          if (opt.classList.contains('selected')) {
            previouslySelectedOption = opt;
          }
          opt.disabled = false;
        });
      
        if (previouslySelectedOption) {
          
          const prevVotesSpan = previouslySelectedOption.querySelector('.vote-count');
          let currentPrevVotes = parseInt(prevVotesSpan.textContent.match(/\d+/)[0]);
          if (currentPrevVotes > 0) {
            currentPrevVotes--;
            prevVotesSpan.textContent = `${prevVotesSpan.textContent.replace(currentPrevVotes + 1, currentPrevVotes)}`;
          } else {
            prevVotesSpan.textContent = `(${currentPrevVotes} vote)`;
        }
            previouslySelectedOption.classList.remove('selected');
        }
      
        option.classList.add('selected');
        option.disabled = true;
      
        const votesSpan = option.querySelector('.vote-count');
        let currentVotes = parseInt(votesSpan.textContent.match(/\d+/)[0]) || 0;
        console.log("Current votes:", currentVotes);
        currentVotes++;
        votesSpan.innerHTML = `(<strong>${currentVotes}</strong> v)`;
        localStorage.setItem(`poll_selection_${pollId}`, selectedIndex);
        sendVoteUpdate(pollId, selectedIndex);
        updateLocalStorage(pollId, selectedIndex);
        updatePollUI(pollData);
      }
      
      function sendVoteUpdate(pollId, selectedIndex) {
        console.log("Sending vote update:", pollId, selectedIndex);
        const url = '/api/update_poll_vote';
        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            poll_id: pollId,
            option_index: selectedIndex
          })
        })
        .then(response => response.json())
        .then(data => {
          console.log("Received response:", data);
          if (!data.success) {
            console.error('Failed to update vote:', data.error);
          } else {
            updatePollUI(data.pollData);
          }
        })
        .catch(error => {
          console.error('Error updating vote:', error);
        });
      }

      function updateLocalStorage(pollId, selectedIndex) {
        const options = document.querySelectorAll('.poll-option');
        options.forEach((option, index) => {
            if (index === selectedIndex) {
                const votesSpan = option.querySelector('.vote-count');
                const votes = parseInt(votesSpan.textContent.match(/\d+/)[0]);
                localStorage.setItem(`${pollId}-votes`, votes);
                }
            });
        }

      function updatePollUI(pollData) {
        const options = document.querySelectorAll('.poll-option');
        options.forEach((opt, index) => {
          opt.querySelector('span:last-child').textContent = `${pollData.options[index].votes} votes`;
      
          const circleElement = opt.querySelector('.circle');
          const maxVotes = Math.max(...pollData.options.map(opt => opt.votes));
          const votePercentage = (pollData.options[index].votes / maxVotes) * 100;
          circleElement.style.width = `${votePercentage}%`;
      
          const textElement = opt.querySelector('.poll-option-text');
          const textColor = calculateTextColor(votePercentage);
          textElement.style.color = textColor;
        });

            const totalVoteCounter = document.querySelector('.total-vote-counter');
            const totalVotes = pollData.options.reduce((sum, option) => sum + option.votes, 0);
            totalVoteCounter.textContent = `Total Votes: ${totalVotes}`;

            options.forEach((option, index) => {
                const votesSpan = option.querySelector('.vote-count');
                const votes = parseInt(votesSpan.textContent.match(/\d+/)[0]);
                localStorage.setItem(`${pollId}-votes_${index}`, votes);
            });
        
      }
    
 
    function closePopupAutomatically() {
        setTimeout(function() {
            pollForm.style.display = 'none';
            
            newFeatureModal.classList.remove('fade');
            document.querySelectorAll('.modal-backdrop').forEach(function(backdrop) {
                backdrop.remove();
            });
            mainOptions.style.display = 'block';

            const inputs = pollForm.getElementsByTagName('input');
            for (let i = 0; i < inputs.length; i++) {
                inputs[i].value = '';
            }
            const modal = bootstrap.Modal.getInstance(document.getElementById('newFeatureModal'));
            modal.hide();
            document.querySelector('.modal-backdrop').remove();
        }, 10);
    }

        var modalList = [].slice.call(document.querySelectorAll('.modal'))
        modalList.map(function (modal) {
          return new bootstrap.Modal(modal)
        })
    
            function clearModalInputs() {
                const currentModal = document.querySelector('.modal.show');
                if (currentModal) {
                    try {
                        const forms = currentModal.querySelectorAll('form');
                        forms.forEach(form => {
                            form.reset();
                        });
                    } catch (error) {
                        console.error('Error clearing modal inputs:', error);
                    }
                } else {
                    console.warn('No modal is currently open');
                }
            }

            function closeModal() {
                const currentModal = document.querySelector('.modal.show');
                if (currentModal) {
                    const modalInstance = bootstrap.Modal.getInstance(currentModal);
                    modalInstance.hide();
                }
            }
            
            document.getElementById('clearInputsBtn').addEventListener('click', clearModalInputs);

            document.getElementById('newFeatureModal').addEventListener('hidden.bs.modal', function () {
                try {
                    const forms = document.querySelectorAll('#pollForm, #uploadFileForm, #linkForm');
                    forms.forEach(form => {
                        form.reset();
                    });
                } catch (error) {
                    console.error('Error resetting forms:', error);
                }
            });    
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting && entry.target.id === 'sessionDetails') {
                togglePopupVisibility();
            }
        });
    }, { threshold: 0 });

});