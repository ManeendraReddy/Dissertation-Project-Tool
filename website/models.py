from .import db
from flask_login import UserMixin

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    full_name = db.Column(db.String(150), nullable=False)
    password = db.Column(db.String(150), nullable=False)


class Session(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(80), nullable=False)
    session_id = db.Column(db.Integer, nullable=False, unique=True)

    def __repr__(self):
        return f'<Session {self.title}>'
