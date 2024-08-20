
from flask import Flask, render_template, redirect, url_for, flash, session, request
from forms import SignUpForm, LoginForm
from werkzeug.security import generate_password_hash, check_password_hash
from website import create_app
from flask_login import current_user



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
            
            session['user'] = users[email]['first_name']
            return redirect(url_for('home'))
    
    return render_template('login.html', form=form)

@app.route('/join')
def join():
    return render_template('join.html')


@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/create', methods=['GET', 'POST'])
def create():
    if request.method == 'POST':
        title = request.form['title']
        description = request.form['description']
        # Here you can handle the data, e.g., save to a database
        return redirect(url_for('session_details', title=title, description=description))
    return render_template('create.html', user=current_user)


@app.route('/session-details')
def session_details():
    title = request.args.get('title')
    description = request.args.get('description')
    return render_template('session_details.html', title=title, description=description, user=current_user)


if __name__ == '__main__':
    app.run(debug=True)
