# Flask Setup and global state
from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, Game, Player, RoundData, RoundResult

app = Flask(__name__)
CORS(app)

# dbMODel
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///game.db' #Replace with db url
app.config['SQLALCHEMY_DATABASE_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
  db.create_all()


# dbModelEND
#####################################


games = {}
num_players = 0
r_data = {}


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

  game = Game(num_players = data["num_players"])
  db.session.add(game)
  db.session.commit()
  return jsonify({"game_id": game.id, "message": f"Game initialized for {data["num_players"]} players"}), 201

# Add players
# @POST "/games/<int:game_id>/players"
@app.route('/games/<int:game_id>/players', methods = ['POST'])
def player_connect(game_id):
  game = Game.query.get(game_id)
  if not game:
    return jsonify({"error": "Game not found!"}), 404

  if len(game.players) >= game.num_players:
    return jsonify({"error": "maximum num of players reached"}), 400

  player_id = len(game.players) + 1
  player = Player(game_id = game.id, player_id_in_game = player_id, status = "joined", score = 0)
  db.session.add(player)
  db.session.commit()

  return jsonify({"player_id": player_id, "status": player.status, "score": player.score}), 201

# Player ready status
# @POST "/players/<int:player_id>/ready"
@app.route('/games/<int:game_id>/players/<int:player_id>/ready', methods = ['PUT'])
def player_ready(game_id, player_id):
  game = Game.query.get(game_id)
  if not game:
    return jsonify({"error": "Game not found!"}), 404

  player = Player.query.filter_by(game_id=game_id, player_id_in_game=player_id).first()
  if not player:
    return jsonify({"error": "Player not found"})

  player.status = "ready"
  db.session.commit()
  return jsonify({"message": f"Player {player_id} is ready" })



# Check if all players are ready
# @GET "/check_ready"
@app.route('/games/<int:game_id>/check_ready')
def check_ready(game_id):
  game = Game.query.get(game_id)
  if not game:
    return jsonify({"error": "Game not found!"}), 404

  if len(game.players) != game.num_players:
    return jsonify({"error": "Maximum number of players not reached yet!"})
  all_ready = all(p.status == 'ready' for p in game.players)

  return jsonify({"message": f"All ready: {all_ready}"})

# Round Entry
# @POST "/rounds/<int:player_id>/rounds/<int:player_id>"
@app.route('/games/<int:game_id>/rounds/<int:player_id>', methods = ['POST'])
def round_entry(game_id, player_id):
  game = Game.query.get(game_id)
  if not game:
    return jsonify({"error": "Game not found!"}), 404

  player = Player.query.filter_by(game_id = game_id, player_id_in_game = player_id).first()
  if not player:
    return jsonify({"error": "Player not found"})

  try:
    entry = request.get_json()["entry"]
    if not entry:
      return jsonify({"error": "Entry is required"}), 400

    existingEntry = RoundData.query.filter_by(game_id=game_id, player_id=player_id).first()
    if existingEntry:
      existingEntry.entry = entry
      db.session.commit()
    else:
      round_data = RoundData(game_id = game_id, player_id = player_id, entry = entry)
      db.session.add(round_data)
      db.session.commit()
    return jsonify({"message": f"Player {player_id} entry recieved"}), 201
  except Exception as e:
    return jsonify({"error": f"Invalid Entry: {e}"})

# Process Round
# @POST "/process_round"
@app.route('/games/<int:game_id>/process_round', methods = ['POST'])
def process_round(game_id):
  game = Game.query.get(game_id)
  if not game:
    return jsonify({"error": "Game not found!"}), 404

  round_data = game.round_data
  if not round_data:
    return jsonify({"error": "No entry found for the game!"}), 404


  # Check if entries is equal to the number of players
  if len(round_data) < len(game.players):
    return jsonify({"error":"Not all players have submitted an entry"})

  # # Calculate drop and assign winner
  sum_entries = sum(int(p.entry) for p in round_data)
  mean_entry = sum_entries / len(round_data)
  drop_value = mean_entry * 0.8

  winner = None
  min_diff = float('inf')

  for p in round_data:
    diff = abs(int(p.entry) - drop_value)
    if diff < min_diff:
      min_diff = diff
      winner = p.player_id

  # Update score
  for player in game.players:
    if player.id != winner:
      player.score -= 1


  scores = [{"player_id": p.id, "score": p.score} for p in game.players]
  entries = [{"player_id": p.player_id, "entry": p.entry} for p in round_data]

  db.session.commit()
  return jsonify({"message": f"Round Processed! Winner: Player {winner}", "scores": scores, "entries": entries, "sum": sum_entries, "mean": mean_entry, "drop": drop_value, "winner": winner})

# CHeck for disqualification
# @PUT "/disqualify"
@app.route('/disqualify/<int:game_id>', methods = ['PUT'])
def disqualify(game_id):
  game = Game.query.get(game_id)
  if not game:
    return jsonify({"error": "Game not found!"}), 404

  disqualified_players = Player.query.filter_by(game_id = game_id, score = -1).all()
  result = []
  for player in disqualified_players:
    result.append(player.player_id_in_game)
    db.session.delete(player)
  db.session.commit()
  return jsonify({"message": f"{len(disqualified_players)} Players have been disqualified", "players": result})

# Check gameover
# @PUT "/check_gameover"
@app.route('/check_gameover/<int:game_id>', methods = ['PUT'])
def check_gameover(game_id):
  game = Game.query.get(game_id)
  if not game:
    return jsonify({"error": "Game not found!"}), 404

  not_disqualified = Player.query.filter_by(game_id = game_id).filter(Player.score > -1).all()

  game_over = len(not_disqualified) == 1
  # if not game_over:
  #   db.session.delete(game.players)
  #   db.session.commit()
  return jsonify({"Game over": game_over})



# Show games
# @GET /games
@app.route('/games')
def get_games():
  # return jsonify(games)

  games = Game.query.all()
  result = []
  for game in games:
    result.append({'id': game.id, "num_players": game.num_players})
  return jsonify(result)

# Show all players
# @GET "/players"
@app.route('/players')
def get_allPlayers():
  games = Game.query.all()
  result = []
  for game in games:
    players = game.players
    for player in players:
      result.append({"id": player.player_id_in_game, "game_id": player.game_id,  "status": player.status, "score": player.score})

  return jsonify(result)

# Show all roundata
# @GET "/round_data"
@app.route('/round_data')
def get_allRound_data():
  games = Game.query.all()
  result = []
  for game in games:
    round_data = game.round_data
    for round in round_data:
      result.append({"game_id": round.game_id,  "player_id": round.player_id, "entry": round.entry})

  return jsonify(result)

# Show players in a game
# @GET "/games/<int:game_id>/get_players"
@app.route('/games/<int:game_id>/get_players')
def get_players(game_id):

  game = Game.query.get(game_id)
  if not game:
    return jsonify({"error": "Game not found!"}), 404

  players = game.players
  result = []
  for player in players:
    result.append({"id": player.player_id_in_game, "status": player.status, "score": player.score})
  return jsonify(result)


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