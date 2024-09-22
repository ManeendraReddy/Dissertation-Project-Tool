import os
import sqlite3
import traceback
from flask import Flask, render_template, redirect, url_for, flash, session, request, jsonify
from forms import QuestionForm, SignUpForm, LoginForm
from werkzeug.security import generate_password_hash, check_password_hash
from website import create_app
from flask_login import current_user, login_required
import random
from website.models import Poll, PollOption, Session, User, db, Question
from werkzeug.utils import secure_filename

app = create_app()
app.config['SECRET_KEY'] = 'your_secret_key'

users = {}

@app.route('/contact-us')
def contact_us():
    return render_template('contactus.html')

@app.route('/sign-up', methods=['GET', 'POST'])
def sign_up():
    form = SignUpForm()
    if form.validate_on_submit():
        email = form.email.data
        full_name = form.full_name.data
        password1 = form.password1.data
        if email in users:
            flash('Email already registered. Please login or use another email.', 'error')
        else:
            users[email] = {
                'full_name': full_name,
                'password': generate_password_hash(password1)
            }
            flash('Signup successful! Redirecting to home...', 'success')
            return redirect(url_for('home'))
    return render_template('sign_up.html', form=form)

@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        email = form.email.data
        password = form.password.data
        if email not in users:
            flash('This email is not registered. Please sign up first.', 'error')
        elif not check_password_hash(users[email]['password'], password):
            flash('Incorrect password. Please try again.', 'error')
        else:
            session['user'] = users[email]['full_name']
            session['email'] = email
            return redirect(url_for('home'))
    return render_template('login.html', form=form)
 
@app.route('/join', methods=['GET', 'POST'])
def join():
    if request.method == 'POST':
        session_id = request.form.get('code')
        session_data = Session.query.filter_by(session_id=session_id).first()
        
        if session_data:
            user_email = session.get('email', 'guest')  # Get email from session or set as 'guest'
            return redirect(url_for('session_details', session_id=session_data.session_id, user_email=user_email))
        else:
            flash('Invalid session code. Please try again.', 'danger')
    
    return render_template('join.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/create', methods=['GET', 'POST'])
@login_required
def create():
    if request.method == 'POST':
        title = request.form['title']
        session_id = str(random.randint(10000000, 99999999))  
        
        new_session = Session(title=title, session_id=session_id)
        db.session.add(new_session)
        db.session.commit()

        user_email = session.get('email', 'guest')
        
        return redirect(url_for('session_details', title=new_session.title, session_id=new_session.session_id, user_email=user_email))
    
    sessions = Session.query.all()
    
    return render_template('create.html', user=current_user, sessions=sessions)

@app.route('/sessions', methods=['GET'])
@login_required
def get_sessions():
    user_email = session.get('email', 'guest')
    sessions = Session.query.filter_by(user_email=user_email).all()
    
    return jsonify([
        {'title': session.title,'session_id': session.session_id, 'user_email': user_email} for session in sessions
    ])


@app.route('/session/<int:session_id>/<string:user_email>', methods=['GET'])
# @login_required
def session_details(session_id, user_email):
    # Fetch session details from the database
    session_data = Session.query.filter_by(session_id=session_id).first_or_404()
    uploaded_files = session.get('uploaded_files', {}).get(session_id, [])
    questions = Question.query.filter_by(session_id=session_id).all()


    if session_data:
        title = session_data.title
        # Create a new QuestionForm instance
        question_form = QuestionForm()
        
        # Pass additional information if needed
        return render_template('session_details.html', title=title, session_id=session_id, user=current_user, user_email=user_email,form=question_form, uploaded_files=uploaded_files, questions=questions)
    else:
        flash('Session not found.', 'danger')
        return redirect(url_for('join'))


@app.route('/delete_session/<session_id>', methods=['POST'])
@login_required
def delete_session(session_id):
    session_data = Session.query.filter_by(session_id=session_id).first()
    if session_data:
        db.session.delete(session_data)
        db.session.commit()
        return jsonify({'status': 'success'})
    else:
        return jsonify({'status': 'error'})


@app.route('/post_question', methods=['POST'])
def post_question():
    session_id = request.form.get('sessionId')
    question_text = request.form.get('postTitle')
    user_email = 'Anonymous'

    new_question = Question(
        session_id=session_id,
        question_text=question_text,
        user_email=user_email,
        likes=0,
        dislikes=0
    )
    db.session.add(new_question)
    db.session.commit()

    return redirect(url_for('session_details', session_id=session_id, user_email=user_email))


@app.before_request
def before_request():
    db.session.remove()
    db.session.bind = db.engine

@app.after_request
def after_request(response):
    db.session.remove()
    return response

@app.route('/debug_db')
def debug_db():
    questions = Question.query.all()
    return f"Number of questions: {len(questions)}<br><br>{str(questions)}"


def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/questions', methods=['GET'])
def get_questions():
    session_id = request.args.get('session_id')
    questions = Question.query.filter_by(session_id=session_id).all()
    return jsonify([{'id': q.id, 'question_text': q.question_text, 'likes': q.likes, 'dislikes': q.dislikes, 'user_email': q.user_email} for q in questions])

@app.route('/api/questions', methods=['POST'])
def create_question():
    data = request.json
    conn = get_db_connection()
    conn.execute('INSERT INTO question (post_id, title, likes, dislikes, username, session_id) VALUES (?, ?, ?, ?, ?, ?)',
                 (data['post_id'], data['title'], data['likes'], data['dislikes'], data['username'], data['session_id']))
    conn.commit()
    conn.close()
    return jsonify({'status': 'success'}), 201

@app.route('/api/questions/<int:post_id>', methods=['DELETE'])
def delete_question(post_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM question WHERE post_id = ?', (post_id,))
    conn.commit()
    conn.close()
    return jsonify({'status': 'success'}), 200


@app.route('/api/create_poll', methods=['POST'])
def create_poll():
    if request.method == 'POST':
        try:
            data = request.get_json()
            session_id = data['session_id']
            poll_question = data['poll_question']
            options = data['options']

            # Create poll
            poll = Poll(session_id=session_id, question=poll_question)
            db.session.add(poll)
            db.session.flush()  
            
            for option_text in options:
                if option_text:
                    poll_option = PollOption(poll_id=poll.id, option_text=option_text)
                    db.session.add(poll_option)
            
            db.session.commit()

            new_poll = Poll.query.filter_by(id=poll.id).first()

            poll_data = {
                'id': new_poll.id,
                'question': new_poll.question,
                'options': [
                    {'option_text': option.option_text, 'votes': option.votes}
                    for option in new_poll.options
                ]
            }

            return jsonify({'success': True, 'poll': poll_data}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'error': str(e)}), 500
    return jsonify({'success': False, 'error': 'Invalid request method'}), 405


@app.route('/api/update_poll_vote', methods=['POST'])
def update_poll_vote():
    data = request.json
    poll_id = data.get('poll_id')
    option_index = data.get('option_index')

    try:
        poll = Poll.query.filter_by(id=poll_id).first()
        if not poll:
            return jsonify({'success': False, 'error': 'Poll not found'}), 404
        
        selected_option = PollOption.query.filter_by(poll_id=poll_id, id=option_index + 1).first()
        if not selected_option:
            return jsonify({'success': False, 'error': 'Selected option not found'}), 400

        selected_option.votes += 1
        db.session.commit()

        poll_data = {
            'id': poll.id,
            'options': [{'votes': opt.votes} for opt in poll.options]
        }
        return jsonify({'success': True, 'pollData': poll_data}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    


if __name__ == '__main__':
    app.run(debug=True)