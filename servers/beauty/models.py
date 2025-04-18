from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Game(db.Model):
  id = db.Column(db.Integer, primary_key = True)
  num_players = db.Column(db.Integer, nullable = False)
  players = db.relationship('Player', backref = 'game', lazy = True)
  round_data = db.relationship('RoundData', backref = 'game', lazy = True)

class Player(db.Model):
  id = db.Column(db.Integer, primary_key = True)
  game_id = db.Column(db.Integer, db.ForeignKey('game.id'), nullable = False)
  player_id_in_game = db.Column(db.Integer, nullable = False)
  status = db.Column(db.String(100), nullable = False, default = 'joined')
  score = db.Column(db.Integer, nullable = False, default = 0)

class RoundData(db.Model):
  id = db.Column(db.Integer, primary_key = True)
  game_id = db.Column(db.Integer, db.ForeignKey('game.id'), nullable = False)
  player_id = db.Column(db.Integer, nullable = False)
  entry = db.Column(db.Integer, nullable = False)

class RoundResult(db.Model):
  id = db.Column(db.Integer, primary_key = True)
  game_id = db.Column(db.Integer, db.ForeignKey('game.id'), nullable = False)
  round_num = db.Column(db.Integer, nullable = False)
  sum_entries = db.Column(db.Integer, nullable = False)
  mean_entries = db.Column(db.Float, nullable = False)
  drop_value = db.Column(db.Float, nullable = False)
  winner_id = db.Column(db.Integer, nullable = False)
