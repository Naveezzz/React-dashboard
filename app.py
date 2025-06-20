from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)  # Allow CORS

client = MongoClient('mongodb://localhost:27017')
db = client['usetrackingDB']
personnel = db['personnel']
db = client['vehicletrackingDB']
vehicles = db['vehicle']


@app.route('/api/personnel', methods=['GET'])
def get_personnel():
    query = {}
    for field in ['id', 'name', 'location', 'status', 'lastUpdate']:
        value = request.args.get(field)
        if value:
            query[field] = value
    result = list(personnel.find(query, {'_id': 0}))
    return jsonify(result)

@app.route('/api/vehicles', methods=['GET'])
def get_vehicles():
    query = {}
    for field in ['id', 'name', 'location', 'status', 'lastUpdate']:
        value = request.args.get(field)
        if value:
            query[field] = value
    result = list(vehicles.find(query, {'_id': 0}))
    return jsonify(result)


if __name__ == '__main__':
    app.run(debug=True)