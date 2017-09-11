var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var climberSchema = mongoose.Schema({
    name          : { type: String, unique: true },
    gym           : String
});

climberSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
climberSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('Climber', climberSchema);
