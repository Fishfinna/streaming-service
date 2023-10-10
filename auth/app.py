from flask import Flask, render_template, request, make_response, redirect, url_for
import hashlib
import json
import os
SERVICE_URL = os.environ.get("SERVICE_URL")

app = Flask(__name__)


with open("users.json") as f:
    users = json.load(f)


@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        # get user info
        username = request.form.get("username")
        password = request.form.get("password")

        # hash the password
        hashed_password = hashlib.sha256(password.encode('utf-8')).hexdigest()

        usernames = [i["username"] for i in users]
        passes = [i["password"] for i in users]

        # check that the password and username are correct
        if username in usernames and hashed_password in passes:
            response = make_response(redirect(SERVICE_URL))
            return response
        else:
            return render_template("login.html", error=True)

    return render_template("login.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80, debug=True)
