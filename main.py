from flask import Flask, render_template, redirect, url_for, flash, session, request, jsonify
from forms import SignUpForm, LoginForm
from werkzeug.security import generate_password_hash, check_password_hash
from website import create_app
from flask_login import current_user, login_required
import random
from website.models import Session, db

app = create_app()
app.config['SECRET_KEY'] = 'your_secret_key'

# Mock user database
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
        
        # Check if session exists in the database
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
    sessions = Session.query.all()
    
    return jsonify([
        {'title': session.title, 'session_id': session.session_id, 'user_email': user_email} for session in sessions
    ])

@app.route('/session/<int:session_id>/<string:user_email>', methods=['GET'])
# @login_required
def session_details(session_id, user_email):
    # Fetch session details from the database
    session_data = Session.query.filter_by(session_id=session_id).first_or_404()
    if session_data:
        title = session_data.title
        # Pass additional information if needed
        return render_template('session_details.html', title=title, session_id=session_id, user=current_user, user_email=user_email)
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

if __name__ == '__main__':
    app.run(debug=True)