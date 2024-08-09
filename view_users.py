from website import create_app, db
from website.models import User

app = create_app()

with app.app_context():
    users = User.query.all()
    for user in users:
        print(f"ID: {user.id}, Email: {user.email}, Name: {user.first_name}, Password: {user.password}")
