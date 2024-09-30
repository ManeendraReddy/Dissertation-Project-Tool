import datetime
from flask import Blueprint, jsonify, render_template, request
from flask_login import login_required, current_user
from .import db
from website.models import Question

views = Blueprint('views', __name__)

@views.route('/')
def home():
    return render_template("home.html", user=current_user)