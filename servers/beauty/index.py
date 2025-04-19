# Flask Setup and global state
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_pymongo import PyMongo
from bson.objectid import ObjectId
from datetime import date
import string, random


def generate_short_code(length=6):
    characters = string.ascii_lowercase + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


# Mongo URI
uri = "mongodb+srv://developerlexzee:borderlands@borderland.axll9jm.mongodb.net/beauty?retryWrites=true&w=majority&appName=borderland"
test_uri = "mongodb://localhost:27017/game_db"

#####################################
# Mongo DB
app.config["MONGO_URI"] = uri
mongo = PyMongo(app)
mongo.db.games.create_index("game_code", unique = True)
#####################################

@app.route('/test_connection')
def test_connection():
    try:
        mongo.db.command("ping")
        return jsonify({"message": "MongoDB connection successful!"})
    except Exception as e:
        return jsonify({"error": str(e)})


games = {}
num_players = 0


@app.route('/', methods = ["POST", "GET", "PUT"])
def _():
  return jsonify({"message": "Server active"}), 200

# Game Initialization
# @POST "/init_game"
@app.route('/init_game', methods = ['POST'])
def init_game():
  data = request.get_json()

  if not data or "num_players" not in data:
    return jsonify({"error": "Number of players is required"}), 400

  while True:
    try:
      game_code = generate_short_code()
      game = {
        "game_code": game_code,
        "num_players": int(data["num_players"]),
        "status": "waiting",
        "players": [],
        "round_data": []
      }

      mongo.db.games.insert_one(game)
      break
    except Exception as e:
      if "E11000" in str(e):
        continue
      return jsonify({"error": str(e)}), 500

  return jsonify({
    "game_code": game_code,
    "message": f"Game initialized for {data['num_players']} players"
  }), 201


# Add players
# @POST "/games/<string:game_code>/players"
@app.route('/games/<string:game_code>/players', methods = ['POST'])
def player_connect(game_code):
  data = request.get_json()
  player_name = data.get("name")

  if not player_name:
      return jsonify({"error": "Player name is required"}), 400

  game = mongo.db.games.find_one({"game_code": game_code.lower()})
  if not game:
    return jsonify({"error": "Game not found!"}), 404

  if len(game['players']) >= int(game['num_players']):
    return jsonify({"error": "maximum num of players reached"}), 400

  player_id = len(game.get("players", [])) + 1
  player = {
      "player_id_in_game": player_id,
      "name": player_name,
      "status": "joined",
      "score": 0
  }

  mongo.db.games.update_one(
    {"_id": game['_id']},
    {"$push": {"players": player}}
  )

  return jsonify({
    "player_id": player_id,
    "name": player_name,
    "status": player["status"],
    "score": player["score"]
  }), 201


# Player ready status
# @POST "/games/<string:game_code>/players/<int:player_id>/ready"
@app.route('/games/<string:game_code>/players/<int:player_id>/ready', methods = ['PUT'])
def player_ready(game_code, player_id):
  game = mongo.db.games.find_one({'game_code': game_code.lower()})
  if not game:
      return jsonify({"error": "Game not found!"}), 404

  players = game.get('players', [])
  player_found = False

  for player in players:
    if player["player_id_in_game"] == player_id:
      player["status"] = "ready"
      player_found = True
      break

  if not player_found:
    return jsonify({"error": "Player not found!"}), 404

  mongo.db.games.update_one(
    {"game_code": game_code.lower()},
    {'$set': {'players': players}}
  )

  return jsonify({"message": f"Player {player_id} is ready" }), 200


# Check if all players are ready
# @GET "/check_ready"
@app.route('/games/<string:game_code>/check_ready')
def check_ready(game_code):
  game = mongo.db.games.find_one({'game_code': game_code.lower()})
  if not game:
      return jsonify({"error": "Game not found!"}), 404

  players = game.get('players', [])

  if len(players) != int(game['num_players']):
        return jsonify({"error": "Maximum number of players not reached yet!"}), 400

  all_ready = all(player['status'] == 'ready' for player in players)

  return jsonify({"message": f"All ready: {all_ready}"}), 200


# Round Entry
# @POST "/games/<string:game_code>/rounds/<int:player_id>"
@app.route('/games/<string:game_code>/rounds/<int:player_id>', methods = ['POST'])
def round_entry(game_code, player_id):
  data = request.get_json()
  entry = int(data.get('entry'))
  round_number = int(data.get('round_number'))

  if entry is None or round_number is None:
      return jsonify({"error": "Both 'entry' and 'round_number' are required."}), 400

  game = mongo.db.games.find_one({'game_code': game_code.lower()})
  if not game:
      return jsonify({"error": "Game not found!"}), 404

  mongo.db.round_entries.update_one(
    {
      'game_code': game_code.lower(),
      'player_id': player_id,
      'round_number': round_number
    },
    {
      '$set': {
        'entry': entry
      }
    },
    upsert = True #Insert if not exists
  )

  return jsonify({"message": f"Entry for round {round_number} recorded."}), 200


# Process Round
# @POST "/process_round"
@app.route('/games/<string:game_code>/rounds/<int:round_number>/process_round', methods = ['POST'])
def process_round(game_code, round_number):
  game = mongo.db.games.find_one({'game_code': game_code.lower()})
  if not game:
    return jsonify({"error": "Game not found!"}), 404

  # Fetch all entries for this game and round
  round_data = list(mongo.db.round_entries.find({
    'game_code': game_code.lower(),
    'round_number': round_number
  }))

  if not round_data:
    return jsonify({"error": "No entries found for this round!"}), 404

  # Check if entries is equal to the number of players
  if len(round_data) < game['num_players']:
    return jsonify({"error":"Not all players have submitted an entry"})

  # Calculate sum and mean
  sum_entries = sum(entry['entry'] for entry in round_data)
  mean_entry = sum_entries / len(round_data)
  drop_value = mean_entry * 0.8

  # check winner closest to drop value
  winner = None
  min_diff = float('inf')

  for entry in round_data:
    diff = abs(entry["entry"] - drop_value)

    if diff < min_diff:
      min_diff = diff
      winner = entry['player_id']

  if winner is None:
    return jsonify({"error": "Could not determine a winner."}), 500

  # Update player scores: deduct 1 from all except winner
  updated_players = []
  for player in game['players']:
    if player['player_id_in_game'] != winner:
      player['score'] = player.get('score', 0) - 1
    updated_players.append(player)

  # commit changes to DB
  mongo.db.games.update_one(
    {'game_code': game_code.upper()},
    {'$set': {'players': updated_players}}
  )

  # Save round result to a collection
  mongo.db.round_results.update_one(
    {'game_code': game_code.upper(), 'round_number': round_number},
    {'$set': {
      'sum_entries': sum_entries,
      'mean_entry': mean_entry,
      'drop_value': drop_value,
      'winner_id': winner
    }},
    upsert=True
  )

  # Prepare Response
  scores = [{"player_id": p['player_id_in_game'], "score": p['score']} for p in updated_players]
  entries = [{"player_id": p['player_id'], "entry": p['entry']} for p in round_data]

  return jsonify({
    "message": f"Round Processed! Winner: Player {winner}",
    "scores": scores,
    "entries": entries,
    "sum": sum_entries,
    "mean": mean_entry,
    "drop": drop_value,
    "winner": winner
  }), 200


# CHeck for disqualification
# @PUT "/disqualify"
# @app.route('/disqualify/<string:game_code>', methods = ['PUT'])
# def disqualify(game_code):
#   game = Game.query.get(game_code)
#   if not game:
#     return jsonify({"error": "Game not found!"}), 404

#   # disqualified_players = Player.query.filter_by(game_code = game_code, score = -1).all()
#   disqualified_players = Player.query.filter(Player.game_code == game_code, Player.score <= -1).all()
#   result = []
#   for player in disqualified_players:
#     result.append(player.player_id_in_game)
#     db.session.delete(player)
#   db.session.commit()
#   return jsonify({"message": f"{len(disqualified_players)} Players have been disqualified", "players": result})

# Check gameover
# @PUT "/check_gameover"
# @app.route('/check_gameover/<string:game_code>', methods = ['PUT'])
# def check_gameover(game_code):
#   game = Game.query.get(game_code)
#   if not game:
#     return jsonify({"error": "Game not found!"}), 404

#   not_disqualified = Player.query.filter_by(game_code = game_code).filter(Player.score > -1).all()

#   game_over = len(not_disqualified) == 1
#   # if not game_over:
#   #   db.session.delete(game.players)
#   #   db.session.commit()
#   return jsonify({"Game over": game_over})


# Show games
# @GET /games
# @app.route('/games')
# def get_games():
#   # return jsonify(games)

#   games = mongo.db.games.find_all()
#   result = []
#   for game in games:
#     result.append({'id': game["player_id_in_game"], "num_players": game["num_players"]})
#   return jsonify(result)

# Show all players
# @GET "/players"
# @app.route('/players')
# def get_allPlayers():
#   games = Game.query.all()
#   result = []
#   for game in games:
#     players = game.players
#     for player in players:
#       result.append({"id": player.player_id_in_game, "game_code": player.game_code,  "status": player.status, "score": player.score})

#   return jsonify(result)

# Show all roundata
# @GET "/round_data"
# @app.route('/round_data')
# def get_allRound_data():
#   games = Game.query.all()
#   result = []
#   for game in games:
#     round_data = game.round_data
#     for round in round_data:
#       result.append({"game_code": round.game_code,  "player_id": round.player_id, "entry": round.entry})

#   return jsonify(result)

# Show players in a game
# @GET "/games/<string:game_code>/get_players"
@app.route('/games/<string:game_code>/get_players')
def get_players(game_code):

  game = mongo.db.games.find_one({"game_code": game_code})
  if not game:
    return jsonify({"error": "Game not found!"}), 404

  players = game["players"]
  return jsonify(players)


# Start flask server
if __name__ == "__main__":
  app.run(debug=True, host="0.0.0.0") ## flask --app index run --debug --host=0.0.0.0