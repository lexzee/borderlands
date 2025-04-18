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
r_data = {}
r_metrics = []
all_ready = False
game_over = False
round = 1
c_id = 1
lock = threading.Lock() # To protect access to global state


@app.route('/', methods = ["POST", "GET", "PUT"])
def _():
  return jsonify({"message": "Server active"}), 200

# Game Initialization
# @POST "/init_game"
@app.route('/init_game', methods = ['POST'])
def init_game():
  data = request.get_json()
  if not data["num_players"]:
    return jsonify({"error": "Number of players is required"}), 400

  num_players = data["num_players"]
  game_id = len(games) + 1
  games[game_id] = {"num_players": num_players, "players": []}

  return jsonify({"game_id": game_id, "message": f"Game initialized for {num_players} players"}), 201

# Add players
# @POST "/games/<int:game_id>/players"
@app.route('/games/<int:game_id>/players', methods = ['POST'])
def player_connect(game_id):
  if game_id not in games:
    return jsonify({"error": "Game not found!"}), 404
  game = games[game_id]

  if len(game["players"]) >= int(game["num_players"]):
    return jsonify({"error": "maximum num of players reached"}), 400

  player_id = len(game["players"]) + 1
  game["players"].append({"id": player_id, "status": "joined", "score": 0})

  return jsonify({"player_id": player_id, "status": "joined", "score": 0}), 201

# Player ready status
# @POST "/players/<int:player_id>/ready"
@app.route('/games/<int:game_id>/players/<int:player_id>/ready', methods = ['PUT'])
def player_ready(game_id, player_id):
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
  if game_id not in games:
    return jsonify({"error": "Game not found!"}), 404
  game = games[game_id]

  if len(game["players"]) != int(game["num_players"]):
    return jsonify({"error": "Maximum number of players not reached yet!"})
  all_ready = all(p['status'] == 'ready' for p in game["players"])
  return jsonify({"message": f"All ready: {all_ready}"})

# Round Entry
# @POST "/rounds/<int:player_id>"
@app.route('/games/<int:game_id>/rounds/<int:player_id>', methods = ["POST"])
def round_entry(game_id, player_id):
  if game_id not in games:
    return jsonify({"error": "Game not found!"}), 404
  game = games[game_id]

  player = next((p for p in game["players"] if p["id"] == player_id), None)
  if not player:
    return jsonify({"error": "Player not found"})

  try:
    entry = request.get_json()["entry"]
    if not entry:
      return jsonify({"error": "Entry is required"}), 400

    if game_id not in r_data:
      r_data[game_id] = {"entries": []}

    r_data[game_id]["entries"].append({"id": player_id, "entry": entry})
    return jsonify({"message": f"Player {player_id} entry recieved"}), 201
  except Exception as e:
    return jsonify({"error": f"Invalid Entry: {e}"})

# Process Round
# @POST "/process_round"
@app.route('/games/<int:game_id>/process_round', methods = ['POST'])
def process_round(game_id):
  if game_id not in games:
    return jsonify({"error": "Game not found!"}), 404
  game = games[game_id]

  # check if game as entries
  if game_id not in r_data:
    return jsonify({"error": "No entry found for the game!"}), 404
  entryData = r_data[game_id]["entries"]

  # Check if entries is equal to the number of players
  if len(entryData) < len(game["players"]):
    return jsonify({"error":"Not all players have submitted an entry"})

  # # Calculate drop and assign winner
  sum_entries = sum(int(p["entry"]) for p in entryData)
  mean_entry = sum_entries / len(r_data)
  drop_value = mean_entry * 0.8

  winner = None
  min_diff = float('inf')

  for p in entryData:
    diff = abs(int(p["entry"]) - drop_value)
    if diff < min_diff:
      min_diff = diff
      winner = p["id"]

  # Update score
  for player in game["players"]:
    if player["id"] != winner:
      player["score"] -= 1

  # round += 1
  r_data[game_id]["entries"] =[]

  scores = [{"player_id": p["id"], "score": p["score"]} for p in game["players"]]
  entries = [{"player_id": p["id"], "entry": p["entry"]} for p in entryData]
  return jsonify({"message": f"Round Processed! Winner: Player {winner}", "scores": scores, "entries": entries, "sum": sum_entries, "mean": mean_entry, "drop": drop_value, "winner": winner})

# CHeck for disqualification
# @PUT "/disqualify"
@app.route('/disqualify/<int:game_id>', methods = ['PUT'])
def disqualify(game_id):
  if game_id not in games:
    return jsonify({"error": "Game not found!"}), 404
  game = games[game_id]

  disqualified_players = []
  remaining_players = []
  for i, player in enumerate(game["players"]):
    if player["score"] == -1:
      disqualified_players.append(player['id'])
      del game["players"][i]
    else:
      remaining_players.append(player)
  return jsonify({"message": f"{len(disqualified_players)} Players have been disqualified", "players": disqualified_players})


# Check gameover
# @PUT "/check_gameover"
@app.route('/check_gameover/<int:game_id>', methods = ['PUT'])
def check_gameover(game_id):
  if game_id not in games:
    return jsonify({"error": "Game not found!"}), 404
  game = games[game_id]

  non_disqualified = sum(1 for player in game["players"] if player['score'] >= -1)
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
    return jsonify({"error": "Game not found!"}), 404
  game = games[game_id]
  return jsonify(game["players"])

# Show round entry
# @GET "/get_round/<int:game_id>"
@app.route('/get_round/<int:game_id>')
def get_round(game_id):
  global r_data
  if game_id not in r_data:
    return jsonify({"error": "Game data not found!"}), 404
  return jsonify(r_data[game_id])

# Start flask server
if __name__ == "__main__":
  app.run(debug=True, host="0.0.0.0") ## flask --app index run --debug --host=0.0.0.0