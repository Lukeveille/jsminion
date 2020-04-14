export default {
  "cost": 'num',
  "victory": 'num',
  "treasure": 'num',
  "cards": 'num || string',
  "actions": 'num',
  "buys": 'num',
  "action": {
    "attack": {
      "players": 'array',
      "effect": 'string'
    },
    "reaction": 'string',
    "instructions": 'string',
    "supply": 'int',
    "discard": 'string',
    "text": 'string',
    "treasure": 'num',
    "victory": 'num'
  },
}