from flask import Flask, render_template, url_for
import pymysql
from tenacity import retry, stop_after_attempt, wait_fixed
import os

app = Flask(__name__)

# Access environment variables
DATABASE_HOST = os.environ.get("DATABASE_HOST")
DATABASE_USER = os.environ.get("DATABASE_USER")
DATABASE_PASSWORD = os.environ.get("DATABASE_PASSWORD")
DATABASE_NAME = os.environ.get("DATABASE_NAME")


@retry(stop=stop_after_attempt(5), wait=wait_fixed(2))
def create_database_connection():
    return pymysql.connect(
        host=DATABASE_HOST,
        user=DATABASE_USER,
        password=DATABASE_PASSWORD,
        database=DATABASE_NAME,
        cursorclass=pymysql.cursors.DictCursor
    )


@app.route("/")
def index():
    try:
        db = create_database_connection()
        cursor = db.cursor()
        cursor.execute("SELECT * FROM videos")
        results = cursor.fetchall()
        cursor.close()
        print(results)
        return render_template("index.html", results=results)
    except Exception as e:
        return "Error connecting to database, please refresh the page... if the error continues restart the system."


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
