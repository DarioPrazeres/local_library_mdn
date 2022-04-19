const { DateTime } = require('luxon');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BookInstanceSchema = new Schema(
    {
        book: {type: Schema.Types.ObjectId, ref: 'Book', required: true},
        imprint: {type: String, required: true}, 
        status: {type: String, required: true, enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'],  default: 'Maintance'},
        due_back: {type: Date, default: Date.now}
    }
);
BookInstanceSchema.virtual('url').get(function(){
    return '/catalog/bookinstance/' + this._id;
});
BookInstanceSchema.virtual('due_back_formatted').get(function(){
    return DateTime.fromJSDate(this.due_back).toLocaleString(DateTim.DATE_MED);
});
module.exports = mongoose.model('BookInstance', BookInstanceSchema);