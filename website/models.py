from . import db
from flask_login import UserMixin
from datetime import datetime

# User Model
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    full_name = db.Column(db.String(150), nullable=False)
    password = db.Column(db.String(150), nullable=False)

    def __repr__(self):
        return f'<User {self.full_name}>'


# Session Model
class Session(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)  # Primary Key
    title = db.Column(db.String(80), nullable=False)
    session_id = db.Column(db.String(50), nullable=False, unique=True)  # Custom Session ID (String)
    user_email = db.Column(db.String(150), nullable=False)  # Email of the user who created the session

    # Relationship to questions and polls
    questions = db.relationship('Question', backref='session', lazy=True)
    polls = db.relationship('Poll', backref='session', lazy=True)

    def __repr__(self):
        return f'<Session {self.title}>'


# Question Model
class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    session_id = db.Column(db.Integer, db.ForeignKey('session.id'), nullable=False)  # ForeignKey to Session primary key
    question_text = db.Column(db.String(500), nullable=False)
    likes = db.Column(db.Integer, default=0)
    dislikes = db.Column(db.Integer, default=0)
    user_email = db.Column(db.String(150), nullable=True)  # Optional user email

    def __repr__(self):
        return f'<Question {self.id} - {self.question_text[:20]}>'


# Poll Model
class Poll(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    session_id = db.Column(db.Integer, db.ForeignKey('session.id'), nullable=False)  # ForeignKey to Session primary key
    question = db.Column(db.String(500), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship to PollOptions
    options = db.relationship('PollOption', backref='poll', lazy=True)

    def __repr__(self):
        return f'<Poll {self.id} - {self.question[:20]}>'


# Poll Option Model
class PollOption(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    poll_id = db.Column(db.Integer, db.ForeignKey('poll.id'), nullable=False)  # ForeignKey to Poll primary key
    option_text = db.Column(db.String(200), nullable=False)
    votes = db.Column(db.Integer, default=0)

    def __repr__(self):
        return f'<PollOption {self.id} - {self.option_text[:20]}>'

