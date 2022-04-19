var Author = require('../models/author');
var Book = require('../models/book');
var async = require('async');

const { body,validationResult } = require('express-validator');

exports.author_list = function(req, res, next){
    //res.send('NOT IMPLEMENTED Author list');
    Author.find()
        .sort([['family_name', 'ascending']])
        .exec(function(err, list_authors){
            if(err){
                return next(err);
            }
            res.render('author_list', {title:'Author List', author_list: list_authors})
        })
};
exports.author_detail = function(req, res){
    //res.send('NOT IMPLEMENTED Author detail' + req.param.id);
    async.parallel({
        author: function(callback){
            Author.findById(req.params.id).exec(callback);
        },
        author_books: function(callback){
            Book.find({'author': req.params.id}, 'title summary').exec(callback);
        }
    },
    function(err, results){
        if(err){
            return next(err);
        }
        if(results.author==null){
            var err = new Error('Author not found');
            err.status = 404;
            return next(err);
        }
        res.render('author_detail', {title:'Author Detail', author: results.author, author_books: results.author_books})
    });
}
exports.author_create_get = function(req, res){
    res.render('author_form', { title: 'Create Author'});
}
// Handle Author create on POST.
exports.author_create_post = [

    // Validate and sanitize fields.
    body('first_name').trim().isLength({ min: 1 }).escape().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('family_name').trim().isLength({ min: 1 }).escape().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601().toDate(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601().toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('author_form', { title: 'Create Author', author: req.body, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.

            // Create an Author object with escaped and trimmed data.
            var author = new Author(
                {
                    first_name: req.body.first_name,
                    family_name: req.body.family_name,
                    date_of_birth: req.body.date_of_birth,
                    date_of_death: req.body.date_of_death
                });
            author.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new author record.
                res.redirect(author.url);
            });
        }
    }
];

exports.author_delete_get = function(req, res, next) {

    async.parallel({
        author: function(callback) {
            Author.findById(req.params.id).exec(callback)
        },
        authors_books: function(callback) {
            Book.find({ 'author': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.author==null) { // No results.
            res.redirect('/catalog/authors');
        }
        // Successful, so render.
        res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books } );
    });

};
// Handle Author delete on POST.
exports.author_delete_post = function(req, res, next) {

    async.parallel({
        author: function(callback) {
          Author.findById(req.body.authorid).exec(callback)
        },
        authors_books: function(callback) {
          Book.find({ 'author': req.body.authorid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.authors_books.length > 0) {
            // Author has books. Render in same way as for GET route.
            res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books } );
            return;
        }
        else {
            // Author has no books. Delete object and redirect to the list of authors.
            Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
                if (err) { return next(err); }
                // Success - go to author list
                res.redirect('/catalog/authors')
            })
        }
    });
};

exports.author_update_get = function(req, res, next){
    Author.findById(req.params.id, function(err, author){
        if(err){
            console.log('Aqui!!');
            console.log(err);
            console.log(author)
            return next(err);
        }
        if(author==null){
            console.log('Aqui!!');
            var err = new Error('Author Not Found');
            err.status = 404;
            return next(err);
        }
        res.render('author_form', {title: 'Update Author', author: author})
    })
};
exports.author_update_post = [
    
    body('first_name').trim().isLength({ min: 1 }).escape().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('family_name').trim().isLength({ min: 1 }).escape().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601().toDate(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601().toDate(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped/trimmed data and old id.
        var author = new Author(
            {
                first_name: req.body.first_name,
                family_name: req.body.family_name,
                date_of_birth: req.body.date_of_birth,
                date_of_death: req.body.date_of_death,
                _id: req.params.id
            }
        );

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.
            res.render('author_form', { title: 'Update Author', author: result.author, errors: errors.array()});
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Author.findByIdAndUpdate(req.params.id, author, {}, function(err, theauthor){
                if(err){return next(err);}
                res.redirect(theauthor.url);
            })
        }
    }
];
