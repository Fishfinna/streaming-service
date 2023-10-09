from flask import Flask, render_template, request, make_response, redirect
import hashlib
import json
import jwt
import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = "jwt-secret-key"

with open("users.json") as f:
    users = json.load(f)

@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        #get user info
        username = request.form.get("username")
        password = request.form.get("password")

        #hash the password
        hashed_password = hashlib.sha256(password.encode('utf-8')).hexdigest()

        usernames = [i["username"] for i in users]
        passes = [i["password"] for i in users]
        
        #check that the password and username are correct
        if username in usernames and hashed_password in passes:
            token = jwt.encode({'username': username, 'exp': datetime.datetime.utcnow(
            ) + datetime.timedelta(minutes=10)}, app.config['SECRET_KEY'], algorithm='HS256')
            response = make_response(redirect("http://localhost:8080/stream"))
            response.set_cookie("token", token, httponly=True)
            return response
        else:
            return render_template("login.html", error=True)

    return render_template("login.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
