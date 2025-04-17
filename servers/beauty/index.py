# Flask Setup and global state
from flask import Flask, jsonify, request
from flask_cors import CORS
import threading
import time

app = Flask(__name__)
CORS(app)

games = {}
num_players = 0
players = []
r_data = []
r_metrics = []
all_ready = False
game_over = False
round = 1
c_id = 1
lock = threading.Lock() # To protect access to global state

# games = {
#   "1": {
#     "num_players": 4,
#     "players": [
#       {
#         "id": 1,
#         "score": 0,
#         "status": "ready"
#       },
#       {
#         "id": 2,
#         "score": 0,
#         "status": "ready"
#       }
#     ]
#   },
#   "2": {
#     "num_players": 4,
#     "players": []
#   }
# }


@app.route('/', methods = ["POST", "GET", "PUT"])
def _():
  return jsonify({"message": "Server active"}), 200

# Game Initialization
# @POST "/init_game"
@app.route('/init_game', methods = ['POST'])
def init_game():
  # global num_players
  data = request.get_json()
  if not data["num_players"]:
    return jsonify({"error": "Number of players is required"}), 400

  num_players = data["num_players"]
  game_id = len(games) + 1
  games[game_id] = {"num_players": num_players, "players": []}

  return jsonify({"game_id": game_id, "message": f"Game initialized for {num_players} players"})

# Add players
# @POST "/games/<int:game_id>/players"
@app.route('/games/<int:game_id>/players', methods = ['POST'])
def player_connect(game_id):
  # global players, c_id, num_players, lock
  if game_id not in games:
    return jsonify({"error": "Game not found!"}), 404
  game = games[game_id]

  if len(game["players"]) >= game["num_players"]:
    return jsonify({"error": "maximum num of players reached"}), 400

  # with lock:
  player_id = len(game["players"]) + 1
  game["players"].append({"id": player_id, "status": "joined", "score": 0})

  return jsonify({"player_id": player_id, "status": "joined", "score": 0}), 201

# Player ready status
# @POST "/players/<int:player_id>/ready"
@app.route('/games/<int:game_id>/players/<int:player_id>/ready', methods = ['PUT'])
def player_ready(game_id, player_id):
  # global players, lock
  # with lock:
  if game_id not in games:
    return jsonify({"error": "Game not found!"}), 404
  game = games[game_id]

  player = next((p for p in game["players"] if p["id"] == player_id), None)
  if not player:
    return jsonify({"error": "Player not found"})

  player["status"] = 'ready'
  return jsonify({"message": f"Player {player_id} is ready" })

# Check if all players are ready
# @GET "/check_ready"
@app.route('/games/<int:game_id>/check_ready')
def check_ready(game_id):
  # global players, all_ready, lock
  # with lock:
  if game_id not in games:
    return jsonify({"error": "Game not found!"}), 404
  game = games[game_id]

  all_ready = all(p['status'] == 'ready' for p in game["players"])
  return jsonify({"message": f"All ready: {all_ready}"})

# Round Entry
# @POST "/rounds/<int:player_id>"
@app.route('/games/<int:game_id>/rounds/<int:player_id>', methods = ["POST"])
def player_round_entry(game_id, player_id):
  # global r_data, lock
  if game_id not in games:
    return jsonify({"error": "Game not found!"}), 404
  game = games[game_id]

  try:
    entry = request.get_json().get('entry')
    if not entry:
      return jsonify({"error": "Entry is required"}), 400

    with lock:
      r_data.append({"id": game[player_id], "entry": entry})
    return jsonify({"message": f"Player {game[player_id]} entry recieved"}), 201
  except Exception as e:
    return jsonify({"error": f"Invalid Entry: {e}"})

# Process Round
# @POST "/process_round"
@app.route('/games/<int:game_id>/process_round', methods = ['POST'])
def process_round(game_id):
  # global players, round, r_data, r_metrics, num_players
  global r_metrics
  # Check if entries is equal to the number of players
  if game_id not in games:
    return jsonify({"error": "Game not found!"}), 404
  game = games[game_id]

  if len(r_data) < game["num_players"]:
    return jsonify({"error":"Not all players have submitted an entry"})

  # Calculate drop and assign winner
  sum_entries = sum(p["entry"] for p in r_data)
  mean_entry = sum_entries / len(r_data)
  drop_value = mean_entry * 0.8

  winner = None
  min_diff = float('inf')

  for p in r_data:
    diff = abs(p["entry"] - drop_value)
    if diff < min_diff:
      min_diff = diff
      winner = p["id"]

  # Store metrics
  r_metrics = [{"sum": sum_entries, "mean": mean_entry, "drop": drop_value, "winner": winner}]

  # Update score
  for player in game["players"]:
    if player["id"] != winner:
      player["score"] -= 1

  round += 1
  r_data = []

  scores = [{"player": p["id"], "score": p["score"]} for p in players]
  return jsonify({"message": f"Round Processed! Winner: Player {winner}", "scores": scores})

# CHeck for disqualification
# @PUT "/disqualify"
@app.route('/disqualify', methods = ['PUT'])
def disqualify():
  global players,lock
  with lock:
    disqualified_players = []
    remaining_players = []
    for i, player in enumerate(players):
      if player["score"] == -3:
        disqualified_players.append(player['id'])
        del players[i]
      else:
        remaining_players.append(player)
    return jsonify({"message": f"{len(disqualified_players)} Players have been disqualified"})


# Check gameover
# @PUT "/check_gameover"
@app.route('/check_gameover', methods = ['PUT'])
def check_game_over():
  global game_over, players
  non_disqualified = sum(1 for player in players if player['score'] >= -3)
  game_over = non_disqualified == 1
  return jsonify({"Game over": game_over})


# Show games
# @GET /games
@app.route('/games')
def get_games():
  return jsonify(games)

# Show players
# @GET "/games/<int:game_id>/get_players"
@app.route('/games/<int:game_id>/get_players')
def get_players(game_id):
  # global players, lock
  if game_id not in games:
    return jsonify({"error": "game not found"}), 404
  # with lock:
  return jsonify(players)

# Show round entry
# @GET "/get_round"
@app.route('/get_round')
def get_round():
  global r_data
  return jsonify(r_data)

# Start flask server
if __name__ == "__main__":
  app.run(debug=True, host="0.0.0.0") ## flask --app index run --debug --host=0.0.0.0