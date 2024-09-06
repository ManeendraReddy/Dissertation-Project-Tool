from .import db
from flask_login import UserMixin

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
    comments = db.relationship('Comment', backref='question', lazy=True)

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)
    comment_text = db.Column(db.String(500), nullable=False)
    user_email = db.Column(db.String(150), nullable=True)  # Can be 'guest' for anonymous users

class LikeDislike(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)
    like = db.Column(db.Boolean, nullable=False)