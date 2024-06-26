const { Schema, model } = require('mongoose');
      
const customRoleSchema = new Schema({
  userId: String,

});

module.exports = model('CustomRole', customRoleSchema); 