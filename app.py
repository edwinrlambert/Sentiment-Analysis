# APP
#* Importing dependencies.
from flask import Flask
from views import views

#* Creating a Flask app and registering the views.
app = Flask(__name__)
app.register_blueprint(views, url_prefix="/")

#* Run the Flask application.
if __name__ == '__main__':
    app.run(debug=True)