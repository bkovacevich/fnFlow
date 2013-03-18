var util = require('util');
var flow = require('../lib/fnFlow').flow;
var us = require('underscore');

module.exports.setUp = function(cb){
  cb();
}
module.exports.tearDown = function(cb){
  cb();
}

var bindFunctions = function(C){
  for(var name in C){
    var fn = C[name];
    if(typeof fn == 'function') C[name] = fn.bind(C);
  }
}

BaseClass = function BaseClass(){};
BaseClass.getAll = function(cb){ return cb(null, this.all); }
BaseClass.getByAttribute = function(attribute, value, cb){
  var self = this;
  var o = self.all[us.find(Object.keys(self.all), function(id){ return self.all[id][attribute] == value; })];
  return cb(null, o);
}
BaseClass.findByAttribute = function(attribute, value, cb){
  var self = this;
  value = value && value.id || value;
  var results = us.map(us.filter(Object.keys(self.all), function(id){ return self.all[id][attribute] == value; }), function(o){ return self.all[o]; });
  return cb(null, results);
}
BaseClass.getById = function(id, cb){
  id = id && id.id || id;
  return cb(null, this.all[id]);
}
BaseClass.assertExistence = function(object, cb){
  if(!object) return cb(new Error(this.name + " did not exist"));
  return cb(null, true);
};

Genre = us.extend(function Genre(){}, BaseClass);
util.inherits(Genre, BaseClass);
Genre.getByName = function(name, cb){ return this.getByAttribute('name', name, cb); };
Genre.prototype.findBooksByAuthor = function(author, cb) { return Book.findByGenreAndAuthor(this, author, cb); }
Genre.prototype.getBooks = function(cb){ return Book.findByGenreId(this.id, cb); }
Genre.prototype.getGenre = function(cb){ return cb(null, this.id); }
bindFunctions(Genre);

Author = us.extend(function Author(){}, BaseClass);
util.inherits(Author, BaseClass);
Author.getByName = function(name, cb){ return this.getByAttribute('name', name, cb); };
Author.prototype.getBooks = function(cb){ return Book.findByAuthorId(this.id, cb); };
bindFunctions(Author);

BookSeries = us.extend(function BookSeries(){}, BaseClass);
util.inherits(BookSeries, BaseClass);
BookSeries.getByName = function(name, cb){ return this.getByAttribute('name', name, cb); };
BookSeries.findByAuthorId = function(authorId, cb){ return BookSeries.findByAttribute('authorId', authorId, cb); };
bindFunctions(BookSeries);

Book = us.extend(function Book(){}, BaseClass);
util.inherits(Book, BaseClass);
Book.getByTitle = function(title, cb){ return Book.getByAttribute('title', title, cb); };
Book.findBySeriesId = function(seriesId, cb){ return Book.findByAttribute('bookSeriesId', seriesId, cb); };
Book.findByAuthorId = function(authorId, cb){ return Book.findByAttribute('authorId', authorId, cb); };
Book.findByGenreId = function(genreId, cb){ return Book.findByAttribute('genreId', genreId, cb); };
Book.findByGenreAndAuthor = function(genreId, authorId, cb){ 
  genreId = genreId && genreId.id || genreId; 
  authorId = authorId && authorId.id || authorId; 
  if(genreId == 5) return cb(new Error("this was a test"));
  cb(null, us.where(Book.all, {genreId: genreId, authorId: authorId})); 
};
Book.prototype.getAuthor = function(cb){ return Author.getById(this.author_id, cb); }
bindFunctions(Book);

Genre.all = {
  1: us.extend(new Genre(), {id: 1, name: "Fantasy"}),
  2: us.extend(new Genre(), {id: 2, name: "Romance"}),
  3: us.extend(new Genre(), {id: 3, name: "Fiction"}),
  4: us.extend(new Genre(), {id: 4, name: "Sports"}),
  5: us.extend(new Genre(), {id: 5, name: "???"})
}

Author.all = {
  1: us.extend(new Author(), {id: 1, name: "Patricia Briggs"}),
  2: us.extend(new Author(), {id: 2, name: "Clive Cussler"}),
  3: us.extend(new Author(), {id: 3, name: "Tom Coughlin"}),
  4: us.extend(new Author(), {id: 4, name: "Dan Brown"}),
  5: us.extend(new Author(), {id: 5, name: "Robert Jordan"}),
  6: us.extend(new Author(), {id: 6, name: "Barbara Hambly"})
}

BookSeries.all = {
  1: us.extend(new BookSeries(), {id: 1, name: "Mercy Thompson", authorId: 1}),
  2: us.extend(new BookSeries(), {id: 2, name: "The Wheel of Time", authorId: 5}),
  3: us.extend(new BookSeries(), {id: 3, name: "Sun-Cross", authorId: 6})
}

Book.all = {
  1: us.extend(new Book(), {id: 1, title: "Frost Burned", authorId: 1, bookSeriesId: 1, genreId: 2}),
  2: us.extend(new Book(), {id: 2, title: "Moon Called", authorId: 1, bookSeriesId: 1, genreId: 2}),
  3: us.extend(new Book(), {id: 3, title: "River Marked", authorId: 1, bookSeriesId: 1, genreId: 2}),
  4: us.extend(new Book(), {id: 4, title: "The Striker", authorId: 2, genreId: 3}),
  5: us.extend(new Book(), {id: 5, title: "Earn the Right to Win", authorId: 3, genreId: 4}),
  6: us.extend(new Book(), {id: 6, title: "Inferno", authorId: 4, genreId: 3}),
  7: us.extend(new Book(), {id: 7, title: "The Rainbow Abyss", authorId: 6, bookSeriesId: 3, genreId: 1}),
  8: us.extend(new Book(), {id: 8, title: "The Magicians of Night", authorId: 6, bookSeriesId: 3, genreId: 1}),
  9: us.extend(new Book(), {id: 9, title: "The Eye of the World", authorId: 5, bookSeriesId: 2, genreId: 1}),
  10: us.extend(new Book(), {id: 10, title: "The Gathering Storm", authorId: 5, bookSeriesId: 2, genreId: 1}),
  11: us.extend(new Book(), {id: 11, title: "The Towers of Midnight", authorId: 5, bookSeriesId: 2, genreId: 1})
}


module.exports["flow data"] = function(test){
  flow({
    bookId: 1
  }, {
    getBook: [Book.getById, 'bookId']
  }, function(err, results){
    test.equals(results.getBook, Book.all[1]);
    test.done();
  });
}

module.exports["flow functions and data"] = function(test){
  flow({
    authorId: 5
  }, {
    getAuthor: [Author.getById, 'authorId'],
    getBooks: [Book.findByAuthorId, 'getAuthor']
  }, function(err, results){
    test.ok(!err);
    test.deepEqual(results, {
      authorId: 5,
      getAuthor: Author.all[5],
      getBooks: [Book.all[9], Book.all[10], Book.all[11]]
    });
    test.done();
  });
}

module.exports["parallel flow functions and data"] = function(test){
  flow({
    authorName: 'Dan Brown',
    genreName: 'Fiction'
  }, {
    getAuthor: [Author.getByName, 'authorName'],
    getGenre: [Genre.getByName, 'genreName'],
    getBooks: [Book.findByGenreAndAuthor, 'getGenre', 'getAuthor']
  }, function(err, results){
    test.ok(!err);
    test.deepEqual(results, {
      authorName: 'Dan Brown',
      genreName: 'Fiction',
      getAuthor: Author.all[4],
      getGenre: Genre.all[3],
      getBooks: [Book.all[6]]
    });
    test.done();
  });
}

module.exports["function as task"] = function(test){
  flow({
  }, {
    getAuthors: Author.getAll
  }, function(err, results){
    test.ok(!err, "no error");
    test.deepEqual(results, {
      getAuthors: Author.all
    }, 'results match');
    test.done();
  });
}

module.exports["flow task callback with error"] = function(test){
  flow({
    authorName: 'Dan Brown',
    genreName: '???'
  }, {
    getAuthor: [Author.getByName, 'authorName'],
    getGenre: [Genre.getByName, 'genreName'],
    getBooks: [Book.findByGenreAndAuthor, 'getGenre', 'getAuthor']
  }, function(err, results){
    test.ok(err);
    test.equals(err.message, "this was a test");
    test.done();
  });
}

module.exports["instance task execution"] = function(test){
  flow({
    authorName: 'Dan Brown',
    genreName: 'Fiction'
  }, {
    getAuthor: [Author.getByName, 'authorName'],
    getGenre: [Genre.getByName, 'genreName'],
    getBooks: ['getGenre', 'findBooksByAuthor', 'getAuthor']
  }, function(err, results){
    test.ok(!err);
    test.deepEqual(results, {
      authorName: 'Dan Brown',
      genreName: 'Fiction',
      getAuthor: Author.all[4],
      getGenre: Genre.all[3],
      getBooks: [Book.all[6]]
    });
    test.done();
  });  
}

module.exports["prerequisite task execution"] = function(test){
  flow({
    authorName: 'Dan Brown',
    genreName: 'Fiction'
  }, {
    getAuthor: [Author.getByName, 'authorName'],
    getGenre: [Genre.getByName, 'genreName'],
    assertGenreExistence: [Genre.assertExistence, 'getGenre'],
    getBooks: ['assertGenreExistence', Book.findByGenreAndAuthor, 'getGenre', 'getAuthor']
  }, function(err, results){
    test.ok(!err);
    test.deepEqual(results, {
      authorName: 'Dan Brown',
      genreName: 'Fiction',
      getAuthor: Author.all[4],
      getGenre: Genre.all[3],
      assertGenreExistence: true,
      getBooks: [Book.all[6]]
    });
    test.done();
  });
}


module.exports["prerequisite task execution with short circuit error"] = function(test){
  flow({
    authorName: 'Dan Brown',
    genreName: 'Yourmom'
  }, {
    getAuthor: [Author.getByName, 'authorName'],
    getGenre: [Genre.getByName, 'genreName'],
    assertGenreExistence: [Genre.assertExistence, 'getGenre'],
    getBooks: ['assertGenreExistence', Book.findByGenreAndAuthor, 'getGenre', 'getAuthor']
  }, function(err, results){
    test.ok(err);
    test.equals(err.message, "Genre did not exist");
    test.deepEqual(results, {
      authorName: 'Dan Brown',
      genreName: 'Yourmom',
      getAuthor: Author.all[4],
      getGenre: undefined,
      assertGenreExistence: undefined
    });
    test.done();
  });
}


module.exports["prerequisite instance task execution"] = function(test){
  flow({
    authorName: 'Dan Brown',
    genreName: 'Fiction'
  }, {
    getAuthor: [Author.getByName, 'authorName'],
    getGenre: [Genre.getByName, 'genreName'],
    assertGenreExistence: [Genre.assertExistence, 'getGenre'],
    getBooks: ['assertGenreExistence', 'getGenre', 'findBooksByAuthor', 'getAuthor']
  }, function(err, results){
    test.ok(!err);
    test.deepEqual(results, {
      authorName: 'Dan Brown',
      genreName: 'Fiction',
      getAuthor: Author.all[4],
      getGenre: Genre.all[3],
      assertGenreExistence: true,
      getBooks: [Book.all[6]]
    });
    test.done();
  });  
}


module.exports["prerequisite instance task execution with short circuit error"] = function(test){
  flow({
    authorName: 'Dan Brown',
    genreName: 'Yourmom'
  }, {
    getAuthor: [Author.getByName, 'authorName'],
    getGenre: [Genre.getByName, 'genreName'],
    assertGenreExistence: [Genre.assertExistence, 'getGenre'],
    getBooks: ['assertGenreExistence', 'getGenre', 'findBooksByAuthor', 'getAuthor']
  }, function(err, results){
    test.ok(err);
    test.equals(err.message, "Genre did not exist");
    test.deepEqual(results, {
      authorName: 'Dan Brown',
      genreName: 'Yourmom',
      getAuthor: Author.all[4],
      getGenre: undefined,
      assertGenreExistence: undefined
    });
    test.done();
  });
}


module.exports["multiple asyncronus tasks with prerequisite task execution"] = function(test){
  flow( [
    { authorName: 'Dan Brown',
      genreName: 'Fiction'
    },
    { authorName: 'Patricia Briggs',
      genreName: 'Fantasy'
    }
  ], {
    getAuthor: [Author.getByName, 'authorName'],
    getGenre: [Genre.getByName, 'genreName'],
    assertGenreExistence: [Genre.assertExistence, 'getGenre'],
    getBooks: ['assertGenreExistence', Book.findByGenreAndAuthor, 'getGenre', 'getAuthor']
  }, function(err, results){
    test.ok(!err);
    test.deepEqual(results, [
      { authorName: 'Dan Brown',
        genreName: 'Fiction',
        getAuthor: { id: 4, name: 'Dan Brown' },
        getGenre: { id: 3, name: 'Fiction' },
        assertGenreExistence: true,
        getBooks: [ { id: 6, title: 'Inferno', authorId: 4, genreId: 3 } ] },
      { authorName: 'Patricia Briggs',
        genreName: 'Fantasy',
        getAuthor: { id: 1, name: 'Patricia Briggs' },
        getGenre: { id: 1, name: 'Fantasy' },
        assertGenreExistence: true,
        getBooks: [] }]
    );
    test.done();
  });
}

module.exports["multiple asyncronus tasks with prerequisite task execution (error)"] = function(test){
  flow([
      { authorName: 'Dan Brown',
        genreName: 'Fiction'
      },
      { authorName: 'Patricia Briggs',
        genreName: 'Robot Romance Novels'
      }
  ], {
    getAuthor: [Author.getByName, 'authorName'],
    getGenre: [Genre.getByName, 'genreName'],
    assertGenreExistence: [Genre.assertExistence, 'getGenre'],
    getBooks: ['assertGenreExistence', Book.findByGenreAndAuthor, 'getGenre', 'getAuthor']
  }, function(err, results){
    test.ok(err);
    test.equal(results[0], undefined);
    test.deepEqual(results[1], { 
      authorName: 'Patricia Briggs',
      genreName: 'Robot Romance Novels',
      getAuthor: { id: 1, name: 'Patricia Briggs' },
      getGenre: undefined,
      assertGenreExistence: undefined
    });
    test.done();
  });
}

module.exports["multiple asyncronus tasks with prerequisite instance task execution"] = function(test){
  flow([
    { authorName: 'Dan Brown',
      genreName: 'Fiction'
    },
    { authorName: 'Patricia Briggs',
      genreName: 'Fantasy'
    }
  ], {
    getAuthor: [Author.getByName, 'authorName'],
    getGenre: [Genre.getByName, 'genreName'],
    assertGenreExistence: [Genre.assertExistence, 'getGenre'],
    getBooks: ['assertGenreExistence', 'getGenre', 'findBooksByAuthor', 'getAuthor']
  }, function(err, results){
    test.ok(!err);
    test.deepEqual(results, [
      { authorName: 'Dan Brown',
        genreName: 'Fiction',
        getAuthor: { id: 4, name: 'Dan Brown' },
        getGenre: { id: 3, name: 'Fiction' },
        assertGenreExistence: true,
        getBooks: [ { id: 6, title: 'Inferno', authorId: 4, genreId: 3 } ] },
      { authorName: 'Patricia Briggs',
        genreName: 'Fantasy',
        getAuthor: { id: 1, name: 'Patricia Briggs' },
        getGenre: { id: 1, name: 'Fantasy' },
        assertGenreExistence: true,
        getBooks: [] } 
    ]);
    test.done();
  });  
}


module.exports["multiple asyncronus tasks with prerequisite instance task execution (error)"] = function(test){
  flow([
    { authorName: 'Dan Brown',
      genreName: 'Fiction'
    },
    { authorName: 'Patricia Briggs',
      genreName: 'Robot Romance Novels'
    }
  ], {
    getAuthor: [Author.getByName, 'authorName'],
    getGenre: [Genre.getByName, 'genreName'],
    assertGenreExistence: [Genre.assertExistence, 'getGenre'],
    getBooks: ['assertGenreExistence', 'getGenre', 'findBooksByAuthor', 'getAuthor']
  }, function(err, results){
    test.ok(err);
    test.equal(results[0], undefined);
    test.deepEqual(results[1], { 
      authorName: 'Patricia Briggs',
      genreName: 'Robot Romance Novels',
      getAuthor: { id: 1, name: 'Patricia Briggs' },
      getGenre: undefined,
      assertGenreExistence: undefined
    });
    test.done();
  });  
}



module.exports["task name same as instance method"] = function(test){
  flow({
    genreName: 'Fantasy'
  }, {
    getGenre: [Genre.getByName, 'genreName'],
    getBooks: ['getGenre', 'getBooks']
  }, function(err, results){
    test.ok(!err);
    test.deepEqual(results, {
      genreName: 'Fantasy',
      getGenre: Genre.all[1],
      getBooks: [Book.all[7], Book.all[8], Book.all[9], Book.all[10], Book.all[11]]
    });
    test.done();
  });
}

module.exports["different task name same as instance method"] = function(test){
  try {
    flow({
      genreName: 'Fantasy'
    }, {
      getGenre: [Genre.getByName, 'genreName'],
      getBooksByGenre: ['getGenre', 'getBooks'],
      getBooks: ['getBooksByGenre', Book.findByGenreId, 'getGenre']
    }, function(err, results){
      test.fail(null, null, "no error received");
      test.done();
    });
  } catch(e) {
    test.ok(e, 'got an error'); 
    test.equals(e.name, "FlowTaskError", "got FlowTaskError");
    test.equals(e.message, "Flow error in 'getBooksByGenre': Function required.", "error message match")
    test.done();
  }
}


module.exports["undefined instance error"] = function(test){
  try {
    flow({
      genreName: 'Fictiony'
    }, {
      getGenre: [Genre.getByName, 'genreName'],
      getBooks: ['getGenre', 'getBooks']
    }, function(err, results){
      test.fail(null, null, "no error received");
    });
  } catch(e) {
    test.ok(e, 'got an error'); 
    test.equals(e.name, "FlowTaskError", "got FlowTaskError");
    test.equals(e.message, "Flow error in 'getBooks': Cannot call function 'getBooks' on undefined", "error message match")
    test.done();
  }
}

module.exports["multiple functions error"] = function(test){
  try {
    flow({
      bookId: 1
    }, {
      getBook: [Book.getById, Book.getById, 'bookId']
    }, function(err, results){
      test.fail(null, null, "no error received");
      test.done();
    });
  } catch(e) {
    test.ok(e, 'got an error'); 
    test.equals(e.name, "FlowTaskError", "got FlowTaskError");
    test.equals(e.message, "Flow error in 'getBook': More than one function specified (at index 0 and 1).", "error message match")
    test.done();
  }
}

module.exports["multiple instance functions error"] = function(test){
  try {
    flow({
      bookId: 1
    }, {
      getBook: [Book.getById, 'bookId'],
      getBookAuthor: ['getBook', 'getAuthor', 'getAuthor']
    }, function(err, results){
      test.fail(null, null, "no error received");
      test.done();
    });
  } catch(e) {
    test.ok(e, 'got an error'); 
    test.equals(e.name, "FlowTaskError", "got FlowTaskError");
    test.equals(e.message, "Flow error in 'getBookAuthor': More than one function specified (at index 1 and 2).", "error message match")
    test.done();
  }
}

module.exports["unknown symbol error"] = function(test){
  try {
    flow({
      bookId: 1
    }, {
      getBook: [Book.getById, 'bookId'],
      getAuthor: ['getBook', 'notafunction']
    }, function(err, results){
      test.fail(null, null, "no error received");
      test.done();
    });
  } catch(e) {
    test.ok(e, 'got an error'); 
    test.equals(e.name, "FlowTaskError", "got FlowTaskError");
    test.equals(e.message, "Flow error in 'getAuthor': Unknown symbol 'notafunction' must be either the name of a task, the name of data, or the name of a function on 'getBook'", "error message match")
    test.done();
  }
}

module.exports["unknown symbol for first task argument"] = function(test){
  try {
    flow({
      bookId: 1
    }, {
      getBook: [Book.getById, 'bookId'],
      getAuthor: ['notafunction']
    }, function(err, results){
      test.fail(null, null, "no error received");
      test.done();
    });
  } catch(e) {
    test.ok(e, 'got an error'); 
    test.equals(e.name, 'FlowTaskError')
    test.equals(e.message, "Flow error in 'getAuthor': Unknown symbol at index '0' must be either the name of a task, the name of data, or be the name of a function on the result of a task or data", "error message match")
    test.done();
  }
}

module.exports["undefined task argument error"] = function(test){
  try {
    flow({
      bookId: 1
    }, {
      getBook: [Book.getById, 'bookId'],
      getAuthor: [Book.getAuthorByBookId, 'getBook']
    }, function(err, results){
      test.fail(null, null, "no error received");
      test.done();
    });
  } catch(e) {
    test.ok(e, 'got an error'); 
    test.equals(e.name, "FlowTaskError", "got FlowTaskError");
    test.equals(e.message, "Flow error in 'getAuthor': Unknown symbol at index '0' must be either the name of a task, the name of data, or be the name of a function on the result of a task or data", "error message match")
    test.done();
  }
}

module.exports["missing task args error"] = function(test){
  try {
    flow({
      bookId: 1
    }, {
      getBook: [Book.getById, 'bookId'],
      getAuthor: []
    }, function(err, results){
      test.fail(null, null, "no error received");
      test.done();
    });
  } catch(e) {
    test.ok(e, 'got an error'); 
    test.equals(e.name, "FlowTaskError", "got FlowTaskError");
    test.equals(e.message, "Flow error in 'getAuthor': Function required.", "error message match")
    test.done();
  }
}


module.exports["missing function in task args error"] = function(test){
  try {
    flow({
      bookId: 1
    }, {
      getBook: [Book.getById, 'bookId'],
      getAuthor: ['getBook']
    }, function(err, results){
      test.fail(null, null, "no error received");
      test.done();
    });
  } catch(e) {
    test.ok(e, 'got an error'); 
    test.equals(e.name, "FlowTaskError", "got FlowTaskError");
    test.equals(e.message, "Flow error in 'getAuthor': Function required.", "error message match")
    test.done();
  }
}

module.exports["missing function in task args error"] = function(test){
  try {
    flow({
      bookId: 1
    }, {
      getBook: [Book.getById, 'bookId'],
      getAuthor: 'getBook'
    }, function(err, results){
      test.fail(null, null, "no error received");
      test.done();
    });
  } catch(e) {
    test.ok(e, 'got an error'); 
    test.equals(e.name, "FlowTaskError", "got FlowTaskError");
    test.equals(e.message, "Flow error in 'getAuthor': Invalid flow type. Must be function or array.", "error message match")
    test.done();
  }
}

module.exports["error in task function"] = function(test){
  try {
    flow({
      bookId: 1
    }, {
      getBook: [Book.getById, 'bookId'],
      getAuthor: [Author.getById]
    }, function(err, results){
      test.fail(null, null, "no error received");
      test.done();
    });
  } catch(e) {
    test.ok(e, 'got an error'); 
    test.equals(e.name, "FlowTaskError", "got FlowTaskError");
    test.equals(e.message, "Flow error in 'getAuthor': Error during execution of function.", "error message match")
    test.ok(/TypeError: undefined is not a function/.test(e.stack))
    test.done();
  }
}
