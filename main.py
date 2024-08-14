
from flask import Flask, render_template, redirect, url_for, flash, session
from forms import SignUpForm, LoginForm
from werkzeug.security import generate_password_hash, check_password_hash
from website import create_app

app = create_app()
app.config['SECRET_KEY'] = 'your_secret_key'

# Mock user database
users = {}

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

@app.route('/')
def home():
    return render_template('home.html')

if __name__ == '__main__':
    app.run(debug=True)
