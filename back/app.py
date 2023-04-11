from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_cors import CORS
from datetime import datetime
import os

app = Flask (__name__)
CORS(app)

basedir =  os.path.abspath(os.path.dirname(__file__))
app.config["SQLALCHEMY_DATABASE_URI"] = 'sqlite:///' + os.path.join(basedir, 'app.sqlite')

db = SQLAlchemy(app)
ma = Marshmallow(app)

class Player(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    player_name = db.Column(db.String(15), nullable=False, unique=True)
    player_coin = db.Column(db.Integer, nullable = False)
    player_inventory = db.Column(db.PickleType, nullable = True)
    def __init__(self, player_name, player_coin,player_inventory):

        self.player_name = player_name
        self.player_coin = player_coin
        self.player_inventory = player_inventory

class Account_info(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    player_email = db.Column(db.String(50), nullable=False, unique=True)
    player_password = db.Column(db.String(50), nullable=False)
    account_creation_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    account_status = db.Column(db.Boolean, nullable=False)

    def __init__(self, player_email, player_password, account_creation_date, account_status):
        self.player_email = player_email
        self.player_password = player_password
        self.account_creation_date = account_creation_date
        self.account_status = account_status

class PlayerSchema(ma.Schema):
    class Meta:
        fields = ('player_name', 'player_coin', 'player_inventory')
player_schema = PlayerSchema()

class AccountSchema(ma.Schema):
    class Meta:
        fields = ('id', 'player_email', 'player_password', 'account_creation_date', 'account_status')
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
    player_password = post_data.get('player_password')
    account_creation_date = post_data.get('account_creation_date')
    account_status = post_data.get('account_status', True)

    if player_email == None:
        return jsonify({"Email is required"}), 400
    
    if player_email == None:
        return jsonify({"Error: Password is required"}), 400
    
    new_account = Account_info(player_email, player_password, account_creation_date, account_status)
    db.session.add(new_account)
    db.session.commit()

    return jsonify({'success': 'Account created successfully'})
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
    data = {
        "account": account_schema.dump(account)
    }
    return jsonify(data)
# ***** Player Endpoints *****

@app.route('/player/purchase/<id>', methods=['PUT'])
def add_potion():
    player_name = request.json['player_name']
    item_price = request.json['item_price']

if __name__ == '__main__':
    app.run(debug=True)