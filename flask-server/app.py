from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import psycopg2.extras
import requests
import csv
import os
import json
import pandas as pd

app = Flask(__name__)
CORS(app)

import urllib.parse as urlparse

# Use DATABASE_URL from Render (set this in Render's environment)
DATABASE_URL = os.getenv("postgresql://root:vZ3NrUqI6IQBvKeIbgPbCHurBfmVa2n1@dpg-d0qb416mcj7s73dsp8dg-a/weather_app_7zm3")
urlparse.uses_netloc.append("postgres")
DB_CONFIG = urlparse.urlparse(DATABASE_URL)

DB_CONN_PARAMS = {
    'weather_app_7zm3': DB_CONFIG.path[1:],
    'root': DB_CONFIG.username,
    'vZ3NrUqI6IQBvKeIbgPbCHurBfmVa2n1': DB_CONFIG.password,
    'dpg-d0qb416mcj7s73dsp8dg-a': DB_CONFIG.hostname,
    '5432': DB_CONFIG.port
}

CSV_FILE = "weather_data.csv"

GEO_API = "https://geocoding-api.open-meteo.com/v1/search"
WEATHER_API = "https://api.open-meteo.com/v1/forecast"

def get_db():
    return psycopg2.connect(**DB_CONN_PARAMS)

def create_table_if_not_exists():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS weather_requests (
            id SERIAL PRIMARY KEY,
            location TEXT NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            latitude FLOAT NOT NULL,
            longitude FLOAT NOT NULL,
            weather_data JSONB NOT NULL
        )
    """)
    conn.commit()
    conn.close()

@app.route('/api/create', methods=['POST'])
def create_weather_entry():
    data = request.json
    location = data.get('location')
    start_date = data.get('start_date')
    end_date = data.get('end_date')

    if not location or not start_date or not end_date:
        return jsonify({"error": "Missing fields"}), 400

    geo_res = requests.get(GEO_API, params={"name": location, "count": 1}).json()
    if "results" not in geo_res:
        return jsonify({"error": "Invalid location"}), 404

    lat = geo_res["results"][0]["latitude"]
    lon = geo_res["results"][0]["longitude"]

    weather_res = requests.get(WEATHER_API, params={
        "latitude": lat,
        "longitude": lon,
        "start_date": start_date,
        "end_date": end_date,
        "daily": [
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_probability_max",
            "relative_humidity_2m_mean"
        ],
        "timezone": "auto",
        "current_weather": True
    }).json()

    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO weather_requests 
            (location, start_date, end_date, latitude, longitude, weather_data) 
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (location, start_date, end_date, lat, lon, json.dumps(weather_res)))
        entry_id = cur.fetchone()[0]
        conn.commit()
    finally:
        conn.close()

    if not os.path.exists(CSV_FILE):
        with open(CSV_FILE, mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(["ID", "Location", "Start Date", "End Date", "Latitude", "Longitude", "Max Temp"])

    max_temp = weather_res["daily"]["temperature_2m_max"][0]

    with open(CSV_FILE, mode='a', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([entry_id, location, start_date, end_date, lat, lon, max_temp])

    return jsonify({"message": "Entry created", "id": entry_id}), 201

@app.route('/api/read', methods=['GET'])
def read_weather_entries():
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM weather_requests")
        rows = [dict(zip([col.name for col in cur.description], row)) for row in cur.fetchall()]
    finally:
        conn.close()
    return jsonify(rows)

@app.route('/api/delete/<int:entry_id>', methods=['DELETE'])
def delete_weather_entry(entry_id):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM weather_requests WHERE id = %s", (entry_id,))
        if cur.rowcount == 0:
            return jsonify({"error": "Not found"}), 404
        conn.commit()
    finally:
        conn.close()

    if os.path.exists(CSV_FILE):
        df = pd.read_csv(CSV_FILE)
        df = df[df['ID'] != entry_id]
        df.to_csv(CSV_FILE, index=False)

    return jsonify({"message": "Entry deleted"}), 200

# Call this when app is first loaded
create_table_if_not_exists()
