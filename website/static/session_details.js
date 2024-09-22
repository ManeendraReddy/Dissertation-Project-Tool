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

        // Dislike button click event
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

        // Post options dropdown toggle
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

        // Edit post button click event
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

        // Delete post button click event
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
        event.preventDefault(); // Prevent the default form submission behavior

        const formData = new FormData(newPostForm); // Gather the form data
        const sessionId = document.querySelector('input[name="sessionId"]').value; // Get the sessionId from the hidden input

        // if (!sessionId) {
        //     alert('Session ID is missing.');
        //     return;
        // }

        formData.append('sessionId', sessionId);  // Ensure sessionId is included

        fetch(newPostForm.action, {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json()) // Assuming Flask returns JSON
        .then(data => {
            if (data.success) {
                alert('Question posted successfully!');
                newPostForm.reset(); // Reset the form after successful submission
                const modal = bootstrap.Modal.getInstance(document.getElementById('newPostModal'));
                modal.hide(); // Close the modal after submission
            } else {
                alert('Error posting question');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });












    const createPollBtn = document.getElementById('createPollBtn');
    createPollBtn.addEventListener('click', function() {
        // Show the poll form
        pollForm.style.display = 'block';
        mainOptions.style.display = 'none';

        // Reset the modal
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

            const url = '/api/create_poll'; // Adjust this URL as needed
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
                    // Update UI dynamically
                    closePopupAutomatically();
                    addPollToUI(data.poll);
                    resetModal(newFeatureModal);

                    const modal = bootstrap.Modal.getInstance(document.getElementById('newFeatureModal'));
                    modal.hide();
                    document.querySelector('.modal-backdrop').remove();
                    
                    // Reset form fields
                    pollForm.reset();
                    
                    // Display main options again
                    document.getElementById('mainOptions').style.display = 'block';
                    pollForm.style.display = 'none';


                } else {
                    alert('Failed to create poll: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // alert('An error occurred while creating the poll.');
            });




            setTimeout(function() {
                // Hide the popup
                pollForm.style.display = 'none';
                
                // Reset the modal
                newFeatureModal.classList.remove('fade');
                document.querySelectorAll('.modal-backdrop').forEach(function(backdrop) {
                    backdrop.remove();
                });
                
                // Display main options again
                mainOptions.style.display = 'block';

                // Clear the poll form
                const inputs = pollForm.getElementsByTagName('input');
                for (let i = 0; i < inputs.length; i++) {
                    inputs[i].value = '';
                }
            }, 100); // 


        });
    }

    function addPollToUI(pollData) {
        const professorContainer = document.getElementById('professorContainer');
        
        // Check if a poll container already exists
        const existingPollContainer = professorContainer.querySelector('.poll-container');
        if (!existingPollContainer) {
            // Create a new poll container if it doesn't exist
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
                    <span class="vote-count">(<strong>${option.votes}</strong> vote)</span>
                </p>`
            ).join('')}
           `;
            
        pollElement.innerHTML = pollContent;
        professorContainer.querySelector('.poll-container').appendChild(pollElement);
    
        // Initialize poll interactions
        initializePollInteractions(pollElement, pollData);
        document.getElementById('newPostModal').style.display = 'none';
        document.querySelector('.modal-backdrop').remove();


        // Add a new element for the total vote count
        const totalVoteCounter = document.createElement('div');
        totalVoteCounter.className = 'total-vote-counter';
        totalVoteCounter.textContent = 'Total Votes: 0';
        professorContainer.querySelector('.poll-container').appendChild(totalVoteCounter);


    }
    
    function initializePollInteractions(pollElement, pollData) {
        const options = pollElement.querySelectorAll('.poll-option');
        const pollId = pollData.id; // Assuming pollData has an 'id' property

        
    
        options.forEach((option, index) => {
            option.addEventListener('click', function() {
                selectPollOption(this, index, pollData, pollId);
            });
        });
    
        // Check if a selection has been made previously
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
      
        // Check if an option was previously selected
        options.forEach((opt, index) => {
          if (opt.classList.contains('selected')) {
            previouslySelectedOption = opt;
          }
          opt.disabled = false;
        });
      
        // Update previously selected option if exists
        if (previouslySelectedOption) {
        //   console.log("Updating previously selected option");
          
      
          // Decrease vote count for previously selected option
          const prevVotesSpan = previouslySelectedOption.querySelector('.vote-count');
          let currentPrevVotes = parseInt(prevVotesSpan.textContent.match(/\d+/)[0]);
        //   console.log("Previous votes:", currentPrevVotes);
          if (currentPrevVotes > 0) {
            currentPrevVotes--;
            prevVotesSpan.textContent = `${prevVotesSpan.textContent.replace(currentPrevVotes + 1, currentPrevVotes)}`;
          } else {
            prevVotesSpan.textContent = `(${currentPrevVotes} vote)`;
        }

            previouslySelectedOption.classList.remove('selected');
        }
      
        // Update newly selected option
        option.classList.add('selected');
        option.disabled = true;
      
        // Increase vote count for newly selected option
        const votesSpan = option.querySelector('.vote-count');
        let currentVotes = parseInt(votesSpan.textContent.match(/\d+/)[0]) || 0;
        console.log("Current votes:", currentVotes);
        currentVotes++;
        votesSpan.innerHTML = `(<strong>${currentVotes}</strong> vote)`;

        localStorage.setItem(`poll_selection_${pollId}`, selectedIndex);

      
        // Send AJAX request to server to update vote count
        sendVoteUpdate(pollId, selectedIndex);

        updateLocalStorage(pollId, selectedIndex);

        updatePollUI(pollData);
      }
      
      function sendVoteUpdate(pollId, selectedIndex) {
        console.log("Sending vote update:", pollId, selectedIndex);
        const url = '/api/update_poll_vote'; // Make sure this URL is correct
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
            // Update UI with new poll data
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

        // Update the total vote counter
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
            
            // Reset the modal
            newFeatureModal.classList.remove('fade');
            document.querySelectorAll('.modal-backdrop').forEach(function(backdrop) {
                backdrop.remove();
            });
            
            // Display main options again
            mainOptions.style.display = 'block';

            // Clear the poll form
            const inputs = pollForm.getElementsByTagName('input');
            for (let i = 0; i < inputs.length; i++) {
                inputs[i].value = '';
            }

            // Close the popup programmatically
            const modal = bootstrap.Modal.getInstance(document.getElementById('newFeatureModal'));
            modal.hide();

            // Hide the modal backdrop
            document.querySelector('.modal-backdrop').remove();
        }, 10);
    }


        
        // Initialize modals
        var modalList = [].slice.call(document.querySelectorAll('.modal'))
        modalList.map(function (modal) {
          return new bootstrap.Modal(modal)
        })
    
        // Add this code after the existing JavaScript

            // Function to clear inputs in the current modal
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
            
            // Event listener for clear inputs button
            document.getElementById('clearInputsBtn').addEventListener('click', clearModalInputs);

            // Event listener for modal close
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

    // });
    
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting && entry.target.id === 'sessionDetails') {
                togglePopupVisibility();
            }
        });
    }, { threshold: 0 });

    const sessionDetailsElement = document.getElementById('sessionDetails');
    if (sessionDetailsElement) {
        observer.observe(sessionDetailsElement);
    }
    

      document.querySelector('.new-post-btn').addEventListener('click', function () {
        const newPostForm = document.getElementById('newPostForm');
        const modalLabel = document.getElementById('newPostModalLabel');
    
        // Clear input fields
        document.querySelectorAll('#newPostForm input, #newPostForm textarea').forEach(input => {
            input.value = '';
        });
    
        // Reset form fields
        newPostForm.reset();
        delete newPostForm.dataset.editingPostId;
        modalLabel.textContent = 'Post a New Question';
    
        const newPostModal = new bootstrap.Modal(document.getElementById('newPostModal'));
        newPostModal.show();
    
        document.querySelector('.modal-backdrop').style.transition = 'none';
    });


    const sessionId = document.querySelector('.session-id').textContent;
  
  fetchQuestions(sessionId);

  function fetchQuestions(sessionId) {
    fetch(`/api/questions?session_id=${sessionId}`)
      .then(response => response.json())
      .then(data => {
        const postsContainer = document.getElementById('postsContainer');
        postsContainer.innerHTML = '';
        data.forEach(question => {
          const questionBox = document.createElement('div');
          questionBox.className = 'question-box';
          questionBox.innerHTML = `
            <p><strong>${question.user_email || 'Anonymous'}:</strong> ${question.question_text}</p>
            <p>Likes: ${question.likes} | Dislikes: ${question.dislikes}</p>
          `;
          postsContainer.appendChild(questionBox);
        });
      })
      .catch(error => console.error('Error fetching questions:', error));
  }
    
  

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
    
        document.querySelector('.modal-backdrop').remove();

        sortPosts();
    });

    
    
    document.querySelectorAll('.post-card').forEach(initializePostInteractions);
    sortPosts();
});