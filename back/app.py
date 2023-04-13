from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import exc
from flask_marshmallow import Marshmallow
from flask_cors import CORS
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__)
CORS(app)

basedir =  os.path.abspath(os.path.dirname(__file__))
app.config["SQLALCHEMY_DATABASE_URI"] = 'sqlite:///' + os.path.join(basedir, 'app.sqlite')

db = SQLAlchemy(app)
ma = Marshmallow(app)

class Player(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    player_name = db.Column(db.String(15), nullable=False, unique=True)
    player_title = db.Column(db.String, nullable=False)
    player_coin = db.Column(db.Integer, nullable=False)
    player_inventory = db.Column(db.PickleType, nullable = True)
    account_id = db.Column(db.Integer, db.ForeignKey('account_info.id'), nullable=False)

    def __init__(self, player_name, player_title, player_coin, player_inventory, account_id):
        self.player_name = player_name
        self.player_title = player_title
        self.player_coin = player_coin
        self.player_inventory = player_inventory
        self.account_id = account_id

class Account_info(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    player_email = db.Column(db.String(50), nullable=False, unique=True)
    player_password_hash = db.Column(db.String(128), nullable=False)
    account_creation_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    account_status = db.Column(db.Boolean, nullable=False)
    players = db.relationship('Player', backref='account', lazy=True)

    def __init__(self, player_email, player_password_hash, account_creation_date, account_status):
        self.player_email = player_email
        self.player_password_hash = player_password_hash
        self.account_creation_date = datetime.strptime(account_creation_date, '%Y-%m-%dT%H:%M:%S.%fZ')
        self.account_status = account_status

    def set_password(self, password):
        self.player_password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.player_password_hash, password)

class PlayerSchema(ma.Schema):
    class Meta:
        fields = ('id', 'player_name', 'player_title', 'player_coin', 'player_inventory')
player_schema = PlayerSchema()
players_schema = PlayerSchema(many=True)

class AccountSchema(ma.Schema):
    class Meta:
        fields = ('id', 'player_email', 'player_password_hash', 'account_creation_date', 'account_status')
account_schema = AccountSchema()
multi_account_schema = AccountSchema(many=True)

#***** Account Endpoints *****
#***** Account Creation *****
@app.route('/account/create', methods=["POST"])
def account_create():
    if request.content_type != 'application/json':
        return jsonify({"Error: JSONIFY"}), 400
    
    post_data = request.get_json()
    player_email = post_data.get('player_email')
    player_password_hash = post_data.get('player_password')
    account_creation_date = post_data.get('account_creation_date')
    account_status = post_data.get('account_status', True)

    if player_email == None:
        return jsonify({"Email is required"}), 400
    
    if player_password_hash == None:
        return jsonify({"Error: Password is required"}), 400
    try:
        hashed_password = generate_password_hash(player_password_hash, method='sha256')
        new_account = Account_info(player_email, hashed_password, account_creation_date, account_status)
        db.session.add(new_account)
        db.session.commit()
        return jsonify({'success': 'Account created successfully'})
    except exc.IntegrityError:
        db.session.rollback()
        return jsonify({'Error': 'Email already exists.'}), 400
    except:
        db.session.rollback()
        return jsonify({'Error': 'Unable to create account'}), 500
#***** Account edit *****
@app.route('/account/edit/<id>', methods=['PUT'])
def account_edit(id):
    if request.content_type != 'application/json':
        return jsonify("Error: JSONIFY")
    
    post_data = request.get_json()
    player_email = post_data.get('player_email')
    player_password = post_data.get('player_password')


    account_edit_id = db.session.query(Account_info).filter(Account_info.id == id).first()

    if player_email != None:
        account_edit_id.player_email = player_email
    if player_password != None:
        account_edit_id.player_password = player_password
    
    db.session.commit()
    return jsonify(account_schema.dump(account_edit_id))
#***** Account Deactivation *****
@app.route('/account/deactivate/<id>', methods=['PUT'])
def account_deact(id):
    if request.content_type != 'application/json':
        return jsonify("Error: JSONIFY")
    
    post_data = request.get_json()
    account_status = post_data.get('account_status', False)

    deact_id = db.session.query(Account_info).filter(Account_info.id == id).first()
    if deact_id is None:
        return jsonify({"error": "Account not found"}), 404
    if deact_id.account_status == False:
        return jsonify({"Account already deactivated"}), 400
    if deact_id.account_status == True:
        deact_id.account_status = False

    db.session.commit()
    return jsonify(account_schema.dump(deact_id))
#***** Account Reactivation *****
@app.route('/account/reactivate/<id>', methods=['PUT'])
def account_react(id):
    if request.content_type != 'application/json':
        return jsonify({"error": "Invalid content type"}), 400
    
    post_data = request.get_json()
    account_status = post_data.get('account_status', True)

    react_id = db.session.query(Account_info).filter(Account_info.id == id).first()
    if react_id is None:
        return jsonify({"error": "Account not found"}), 404
    if react_id.account_status == True:
        return jsonify({"error": "Account is already activated"}), 400
    if react_id.account_status == False:
        react_id.account_status = True

    db.session.commit()
    return jsonify(account_schema.dump(react_id))
#***** All Account Query *****
@app.route('/account/all', methods=["GET"])
def get_accounts():
    all_accounts = db.session.query(Account_info).all()
    data = {
        "accounts": multi_account_schema.dump(all_accounts)
    }
    return jsonify(data)
#***** Single Account Query *****
@app.route('/account/<id>', methods=["GET"])
def get_account(id):
    account = db.session.query(Account_info).get(id)
    if not account:
        return jsonify({"Error: Account not found"}), 404
    players = []
    for player in account.players:
        players.append(player_schema.dump(player))
    data = {
        "account": account_schema.dump(account),
        "players": players
    }
    return jsonify(data)
#***** Login *****
@app.route('/login', methods=["POST"])
def login():
    if request.content_type != 'application/json':
        return jsonify({"Error: JSONIFY"}), 400
    email = request.json.get("player_email")
    password = request.json.get("player_password")
    player = db.session.query(Account_info).filter(Account_info.player_email == email).first()
    if player is None:
        return jsonify({'error': 'Invalid email'}), 401
    if not player.check_password(password):
         return jsonify({'error': 'Invalid password'}), 401
    return jsonify({'id': player.id}, 'login successful'), 200
# ***** Player Endpoints *****
@app.route('/account/<id>/playercreate', methods=["POST"])
def player_create(id):
    if request.content_type != 'application/json':
        return jsonify({"Error: JSONIFY"}), 400
    post_data = request.get_json()
    player_name = post_data.get('player_name')
    player_title = post_data.get('player_title')
    player_coin = post_data.get('player_coin')
    player_inventory = post_data.get('player_inventory')
    account = Account_info.query.get(id)
    if not account:
        return jsonify({"Error: Account not found"}), 404
    new_player = Player(player_name,player_title, player_coin, player_inventory, account.id)
    db.session.add(new_player)
    db.session.commit()
    return jsonify({'success':'Player created successfully'}, player_schema.dump(new_player))
#***** Delete Player *****
@app.route('/account/<account_id>/playerdelete/<player_id>', methods=['DELETE'])
def delete_player(account_id, player_id):
    player = Player.query.filter_by(id=player_id, account_id=account_id).first()
    if not player:
        return jsonify({'error': 'Player not found.'}), 404
    db.session.delete(player)
    db.session.commit()
    return jsonify({'message': 'Player deleted successfully.'}), 200
#***** Set Username *****
@app.route('/account/<account_id>/player', methods=["GET"])
@app.route('/account/<account_id>/player/<player_id>', methods=["GET"])
def get_player_for_account(account_id, player_id=None):
    account = Account_info.query.get(account_id)
    if not account:
        return jsonify({'error': 'Account not found'}), 404
    
    if player_id:
        player = Player.query.filter_by(id=player_id, account_id=account_id).first()
    else:
        player = Player.query.filter_by(account_id=account_id).first()
    
    if not player:
        return jsonify({'error': 'Player not found for account'}), 404

    data = {
        'player_name': player.player_name,
        'player_title': player.player_title,
        'player_coin': player.player_coin,
        'player_inventory': player.player_inventory,
        'player_id': player.id
    }
    return jsonify(data)

#***** Change Username *****
#***** Coin Purse *****
#***** Inventory *****
#***** Purchase *****
@app.route('/player/purchase/<id>', methods=['PUT'])
def add_potion():
    player_name = request.json['player_name']
    item_price = request.json['item_price']
#***** Sell *****

if __name__ == '__main__':
    app.run(debug=True)