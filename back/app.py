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

class Player(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    player_name = db.Column(db.String(15), nullable=False, unique=True)
    player_title = db.Column(db.String, nullable=False)
    player_coin = db.Column(db.Integer, nullable=False)
    player_inventory = db.Column(db.PickleType, nullable = True)
    player_creation_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    account_id = db.Column(db.Integer, db.ForeignKey('account_info.id'), nullable=False)
    inventory_items = db.relationship('Inventory', backref='player', lazy=True)

    def __init__(self, player_name, player_title, player_coin, player_creation_date, account_id):
        self.player_name = player_name
        self.player_title = player_title
        self.player_coin = player_coin
        self.player_creation_date = player_creation_date
        self.account_id = account_id

class Inventory(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    item_name = db.Column(db.String, nullable=False, default="empty")
    item_type = db.Column(db.String, nullable=False, default="empty")
    item_price = db.Column(db.Integer, nullable=False, default=0)
    item_quantity = db.Column(db.Integer, nullable=False, default=0)
    player_id = db.Column(db.Integer, db.ForeignKey('player.id'), nullable=False)

    def __init__(self, item_name, item_type, item_price, item_quantity, player_id):
        self.item_name = item_name
        self.item_type = item_type
        self.item_price = item_price
        self.item_quantity = item_quantity
        self.player_id = player_id

class AccountSchema(ma.Schema):
    class Meta:
        fields = ('id', 'player_email', 'player_password_hash', 'account_creation_date', 'account_status')
account_schema = AccountSchema()
multi_account_schema = AccountSchema(many=True)

class PlayerSchema(ma.Schema):
    class Meta:
        fields = ('id', 'player_name', 'player_title', 'player_coin', 'player_inventory', 'player_creation_date')
player_schema = PlayerSchema()
players_schema = PlayerSchema(many=True)

class InventorySchema(ma.Schema):
    class Meta:
        fields = ('id', 'item_name', 'item_type', 'item_price', 'item_quantity', 'player_id')
inventory_item_schema = InventorySchema()
inventory_items_schema = InventorySchema(many=True)


#***** Account Endpoints *****
# ***** Account Creation *****
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
# ***** Account edit *****
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
# ***** Account Deactivation *****
@app.route('/account/deactivate/<id>', methods=['PUT'])
def account_deact(id):
    if request.content_type != 'application/json':
        return jsonify("Error: JSONIFY")
    
    post_data = request.get_json()
    account_status = post_data.get('account_status')

    deact_id = db.session.query(Account_info).filter(Account_info.id == id).first()
    if deact_id is None:
        return jsonify({"error": "Account not found"}), 404
    if deact_id.account_status == False:
        return jsonify({"error": "Account already deactivated"}), 400
    try:
        account_status = False
        deact_id.account_status = account_status
        db.session.add(deact_id)
        db.session.commit()
        return jsonify({'success': 'Account deactivated successfully'})
    except exc.IntegrityError:
        db.session.rollback()
        return jsonify({'Error': 'Account already deactivated.'}), 400
    except:
        db.session.rollback()
        return jsonify({'Error': 'Unable to deactivate account'}), 500
# ***** Account Reactivation *****
@app.route('/account/reactivate/<id>', methods=['PUT'])
def account_react(id):
    if request.content_type != 'application/json':
        return jsonify({"error": "Invalid content type"}), 400
    
    post_data = request.get_json()
    account_status = post_data.get('account_status')

    react_id = db.session.query(Account_info).filter(Account_info.id == id).first()
    if react_id is None:
        return jsonify({"error": "Account not found"}), 404
    if react_id.account_status == True:
        return jsonify({"error": "Account is already activated"}), 400
    try:
        account_status = True
        react_id.account_status = account_status
        db.session.add(react_id)
        db.session.commit()
        return jsonify({'success': 'Account reactivated successfully'})
    except exc.IntegrityError:
        db.session.rollback()
        return jsonify({'Error': 'Account already active.'}), 400
    except:
        db.session.rollback()
        return jsonify({'Error': 'Unable to reactivate account'}), 500
# ***** All Account Query *****
@app.route('/account/all', methods=["GET"])
def get_accounts():
    all_accounts = db.session.query(Account_info).all()
    data = {
        "accounts": multi_account_schema.dump(all_accounts)
    }
    return jsonify(data)
# ***** Single Account Query *****
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
# ***** Login *****
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
#***** Player Endpoints *****
# ***** Create Player *****
@app.route('/account/<id>/playercreate', methods=["POST"])
def player_create(id):
    if request.content_type != 'application/json':
        return jsonify({"Error: JSONIFY"}), 400
    post_data = request.get_json()
    player_name = post_data.get('player_name')
    player_title = post_data.get('player_title')
    player_coin = post_data.get('player_coin')
    player_creation_date = post_data.get('player_creation_date')
    account = Account_info.query.get(id)
    if not account:
        return jsonify({"Error: Account not found"}), 404
    if len(account.players) >=3:
        return jsonify ({"Error": "Maximum number of players reached"}), 400
    try:
        new_player = Player(player_name,player_title, player_coin, player_creation_date, account.id)
        db.session.add(new_player)
        db.session.commit()
        return jsonify({'success':'Player created successfully'}, player_schema.dump(new_player))
    except:
        db.session.rollback()
        return jsonify({"Error: Could not create player"}), 500
# ***** Delete Player *****
@app.route('/account/<account_id>/playerdelete/<player_id>', methods=['DELETE'])
def delete_player(account_id, player_id):
    player = Player.query.filter_by(id=player_id, account_id=account_id).first()
    if not player:
        return jsonify({'error': 'Player not found.'}), 404
    db.session.delete(player)
    db.session.commit()
    return jsonify({'message': 'Player deleted successfully.'}), 200
# ***** Set Username *****
@app.route('/account/<account_id>/player', methods=["GET"])
def get_player_for_account(account_id):
    account = Account_info.query.get(account_id)
    if not account:
        return jsonify({'error': 'Account not found'}), 404
    players = Player.query.filter_by(account_id=account_id).all()
    if not players:
        return jsonify({'error': 'No players found for account'}), 404
    data = []
    for player in players:
        player_data = {
            'player_id': player.id,
            'player_email': account.player_email,
            'account_status': account.account_status,
            'account_creation_date': account.account_creation_date,
            'player_creation_date': player.player_creation_date,
            'player_name': player.player_name,
            'player_title': player.player_title,
            'player_coin': player.player_coin,
        }
        data.append(player_data)
    return jsonify(data)
# ***** Change Username *****
@app.route('/account/<account_id>/player/<player_id>', methods=['PUT'])
def player_update(account_id, player_id):
    player = Player.query.filter_by(id=player_id, account_id=account_id).first()
    if not player:
        return jsonify({'error': 'Player not found.'}), 404
    post_data = request.get_json()
    player_name = post_data.get('player_name')
    player_title = post_data.get('player_title')
    if player_name is not None:
        player.player_name = player_name
    if player_title is not None:
        player.player_title = player_title
    data = {
        'player_name': player.player_name,
        'player_title': player.player_title,
    }
    try: 
        db.session.commit()
        return jsonify(data), 200
    except:
        db.session.rollback()
        return jsonify({"Error: Could not update player"}), 500
# ***** Coin Purse *****
#***** Inventory *****
# ***** Get Inventory *****
@app.route ('/account/<account_id>/player/<player_id>/inventory', methods=['GET'])
def get_inventory(account_id, player_id):
    player = Player.query.filter_by(id=player_id, account_id=account_id).first()
    if not player:
        return jsonify({'error': "Player not found."}), 400
    inventory = Inventory.query.filter_by(player_id=player_id).all()
    if not inventory:
        return jsonify({'Error': "Unable to retrieve inventory."}), 404
    inventory_items = []
    for item in inventory:
        inventory_item = {
            'inventory_item_id': item.id,
            'inventory_item_name': item.item_name,
            'inventory_item_type': item.item_type,
            'inventory_item_quantity': item.item_quantity,
            'inventory_item_price': item.item_price
        }
        inventory_items.append(inventory_item)
    return jsonify(inventory_items)
#***** Purchase *****
@app.route('/account/<account_id>/player/<player_id>/inventory/add', methods=['POST'])
def add_inventory_item(account_id, player_id):
    if request.content_type != 'application/json':
        return jsonify({"error": "Invalid content type. Expected application/json."}), 404
    player = Player.query.filter_by(id=player_id, account_id=account_id).first()
    if not player:
        return jsonify({'error': "Player not found."}), 400
    inventory_items = Inventory.query.filter_by(player_id=player_id).all()
    if len(inventory_items) >=20:
        return jsonify ({"Error": "Maximum number of inventory slots reached"}), 400

    post_data = request.get_json()
    item_name = post_data.get('item_name')
    item_type = post_data.get('item_type')
    item_quantity = post_data.get('item_quantity')
    item_price = post_data.get('item_price')

    try:
        new_item = Inventory(item_name=item_name, item_type=item_type, item_quantity=item_quantity, item_price=item_price, player_id=player_id)
        db.session.add(new_item)
        db.session.commit()
        return jsonify({'success':'Inventory item added successfully'}), 201
    except Exception as e:
        print(e)
        db.session.rollback()
        return jsonify({"error": "Could not add inventory item"}), 500


if __name__ == '__main__':
    app.run(debug=True)