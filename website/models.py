from .import db
from flask_login import UserMixin
from datetime import datetime

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    full_name = db.Column(db.String(150), nullable=False)
    password = db.Column(db.String(150), nullable=False)


class Session(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(80), nullable=False)
    session_id = db.Column(db.Integer, nullable=False, unique=True)
    user_email = db.Column(db.String(150), nullable=False)  

    def __repr__(self):
        return f'<Session {self.title}>'

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    session_id = db.Column(db.Integer, db.ForeignKey('session.session_id'), nullable=False)
    question_text = db.Column(db.String(500), nullable=False)
    likes = db.Column(db.Integer, default=0)
    dislikes = db.Column(db.Integer, default=0)
    user_email = db.Column(db.String(150), nullable=True)  # For anonymous users, this can be None or 'guest'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, session_id, question_text, user_email=None):
        self.session_id = session_id
        self.question_text = question_text
        self.user_email = user_email

    def __repr__(self):
        return f'<Question {self.id} - {self.question_text[:20]}>'


class Poll(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    session_id = db.Column(db.Integer, db.ForeignKey('session.session_id'), nullable=False)
    question = db.Column(db.String(500), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    options = db.relationship('PollOption', backref='poll', lazy=True)

    def __repr__(self):
        return f'<Poll {self.id} - {self.question[:20]}>'


class PollOption(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    poll_id = db.Column(db.Integer, db.ForeignKey('poll.id'), nullable=False)
    option_text = db.Column(db.String(200), nullable=False)
    votes = db.Column(db.Integer, default=0)

    def __repr__(self):
        return f'<PollOption {self.id} - {self.option_text[:20]}>'
