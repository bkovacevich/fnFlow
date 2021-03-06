var flow = require('../lib/fnFlow').flow;
var us = require('underscore');
var test_data = require('../support/test-data');

Book = test_data.Book;
Author = test_data.Author;
Genre = test_data.Genre;
BookSeries = test_data.BookSeries;

module.exports.setUp = function(cb){
  cb();
}
module.exports.tearDown = function(cb){
  cb();
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
    getBooks: ['getGenre.findBooksByAuthor', 'getAuthor']
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
    getBooks: ['assertGenreExistence', 'getGenre.findBooksByAuthor', 'getAuthor']
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
    getBooks: ['assertGenreExistence', 'getGenre.findBooksByAuthor', 'getAuthor']
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

module.exports["multiple instance parameter"] = function(test){
  flow({
    page: {
      number: 1,
      chapter: {
        number: 2,
        book: Book.all[5]
      }
    }
  }, {
    getGenre: [Genre.getById, 'page.chapter.book.genreId']
  }, function(err, results){
    test.deepEqual(results.getGenre, Genre.all[4]);
    test.done();
  });
}

module.exports["result multi instance function"] = function(test){
  flow({
    page: {
      number: 1,
      chapter: {
        number: 2,
        book: Book.all[5]
      }
    }
  }, {
    getAuthor: ['page.chapter.book.getAuthor']
  }, function(err, results){
    test.deepEqual(results.getAuthor, Author.all[3]);
    test.done();
  });
}

module.exports["instance task execution with result instance parameter"] = function(test){
  flow({
    authorName: 'Dan Brown',
    genreName: 'Fiction'
  }, {
    getAuthor: [Author.getByName, 'authorName'],
    getGenre: [Genre.getByName, 'genreName'],
    getBooks: ['getGenre.findBooksByAuthor', 'getAuthor.id']
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
        getGenre: Genre.all[1],
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
    getBooks: ['assertGenreExistence', 'getGenre.findBooksByAuthor', 'getAuthor']
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
        getGenre: Genre.all[1],
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
    getBooks: ['assertGenreExistence', 'getGenre.findBooksByAuthor', 'getAuthor']
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
    getBooks: ['getGenre.getBooks']
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

module.exports["undefined instance error"] = function(test){
  flow({
    genreName: 'Fictiony'
  }, {
    getGenre: [Genre.getByName, 'genreName'],
    getBooks: ['getGenre.getBooks']
  }, function(e, results){
    test.ok(e, 'got an error'); 
    test.equals(e.name, "ArgumentNullError", "got proper error");
    test.equals(e.message, 'Not Found: "getGenre" with genreName "Fictiony"')
    test.done();
  });
}

module.exports["undefined instance error 2"] = function(test){
  flow({
    genreName: 'Fiction'
  }, {
    getGenre: [Genre.getByName, 'genreName'],
    getBooks: [Book.findByGenreId, 'getGenre.id.undef_value.err']
  }, function(e, results){
    test.ok(e, 'got an error'); 
    test.equals(e.name, "ArgumentNullError", "got proper error");
    test.equals(e.message, 'Not Found: "id.undef_value" for getGenre with genreName "Fiction"')
    test.done();
  });
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

// module.exports["multiple instance functions error"] = function(test){
//   try {
//     flow({
//       bookId: 1
//     }, {
//       getBook: [Book.getById, 'bookId'],
//       getBookAuthor: ['getBook.getAuthor', 'getBook.getAuthor']
//     }, function(err, results){
//       test.fail(null, null, "no error received");
//       test.done();
//     });
//   } catch(e) {
//     test.ok(e, 'got an error'); 
//     test.equals(e.name, "FlowTaskError", "got FlowTaskError");
//     test.equals(e.message, "Flow error in 'getBookAuthor': More than one function specified (at index 1 and 2).", "error message match")
//     test.done();
//   }
// }

module.exports["unknown symbol error"] = function(test){
  try {
    flow({
      bookId: 1
    }, {
      getBook: [Book.getById, 'bookId'],
      getAuthor: ['getBook.notafunction']
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
    test.equals(e.message, "Flow error in 'getAuthor': Unknown string 'notafunction' must be either the name of a task or the name of data", "error message match")
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

module.exports["invalid flow type task"] = function(test){
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
    test.equals(e.message, "Flow error in 'getAuthor': Invalid flow type. Must be function, subFlow, or array.", "error message match")
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



module.exports["subFlow execution"] = function(test){
  flow({ 
    genreName: 'Fantasy'
  }, {
    getGenre: [Genre.getByName, 'genreName'],
    getBooksByGenre: ['getGenre.getBooks'],
    getAuthors: flow.subFlow('getBooksByGenre', {
      getBookAuthor: ['getBooksByGenre.getAuthor']
    })
  }, function(err, results){
    test.ok(!err, 'no error');
    test.deepEqual(results, { 
      genreName: 'Fantasy',
      getGenre: Genre.all[1],
      getBooksByGenre: [Book.all[7], Book.all[8], Book.all[9], Book.all[10], Book.all[11]],
      getAuthors: [{
        getBookAuthor: Author.all[6]
      }, {
        getBookAuthor: Author.all[6]
      }, {
        getBookAuthor: Author.all[5]
      }, {
        getBookAuthor: Author.all[5]
      }, {
        getBookAuthor: Author.all[5]
      }]
    });
    test.done();
  });  
}


module.exports["subFlow execution with context"] = function(test){
  flow({ 
    genreName: 'Fantasy'
  }, {
    getGenre: [Genre.getByName, 'genreName'],
    getBooksByGenre: ['getGenre.getBooks'],
    getAuthors: flow.subFlow('getBooksByGenre', {
      getBookAuthor: [Author.getById, 'authorId']
    })
  }, function(err, results){
    test.ok(!err, 'no error');
    test.deepEqual(results, { 
      genreName: 'Fantasy',
      getGenre: Genre.all[1],
      getBooksByGenre: [Book.all[7], Book.all[8], Book.all[9], Book.all[10], Book.all[11]],
      getAuthors: [{
        getBookAuthor: Author.all[6]
      }, {
        getBookAuthor: Author.all[6]
      }, {
        getBookAuthor: Author.all[5]
      }, {
        getBookAuthor: Author.all[5]
      }, {
        getBookAuthor: Author.all[5]
      }]
    });
    test.done();
  });  
}


module.exports["subFlow execution using subFlow"] = function(test){
  flow({ 
    genreName: 'Fantasy'
  }, {
    getGenre: [Genre.getByName, 'genreName'],
    getBooksByGenre: ['getGenre.getBooks'],
    getAuthors: flow.subFlow('getBooksByGenre', {
      getBookAuthor: ['getBooksByGenre.getAuthor']
    })
  }, function(err, results){
    test.ok(!err, 'no error');
    test.deepEqual(results, { 
      genreName: 'Fantasy',
      getGenre: Genre.all[1],
      getBooksByGenre: [Book.all[7], Book.all[8], Book.all[9], Book.all[10], Book.all[11]],
      getAuthors: [{
        getBookAuthor: Author.all[6]
      }, {
        getBookAuthor: Author.all[6]
      }, {
        getBookAuthor: Author.all[5]
      }, {
        getBookAuthor: Author.all[5]
      }, {
        getBookAuthor: Author.all[5]
      }]
    });
    test.done();
  });  
}



module.exports["subFlow execution with prereqs"] = function(test){
  flow({ 
    genreName: 'Fantasy',
    authorName: 'Barbara Hambly'
  }, {
    getGenre: [Genre.getByName, 'genreName'],
    getBooksByGenre: ['getGenre.getBooks'],
    getAuthors: flow.subFlow('getBooksByGenre', {
      getHambly2: [Author.getById, 'getHambly']
    }),
    getHambly: [Author.getByName, 'authorName']
  }, function(err, results){
    test.ok(!err, 'no error');
    test.deepEqual(results, { 
      genreName: 'Fantasy',
      authorName: 'Barbara Hambly',
      getGenre: Genre.all[1],
      getBooksByGenre: [Book.all[7], Book.all[8], Book.all[9], Book.all[10], Book.all[11]],
      getHambly: Author.all[6],
      getAuthors: [{
        getHambly2: Author.all[6]
      }, {
        getHambly2: Author.all[6]
      }, {
        getHambly2: Author.all[6]
      }, {
        getHambly2: Author.all[6]
      }, {
        getHambly2: Author.all[6]
      }]
    });
    test.done();
  });  
}


module.exports["two nested subflows with prereqs"] = function(test){
  flow({ 
    genreName: 'Fantasy',
    authorName: 'Barbara Hambly'
  }, {
    getGenre: [Genre.getByName, 'genreName'],
    getBooksByGenre: ['getGenre.getBooks'],
    getAuthors: flow.subFlow('getBooksByGenre', {
      getBookAuthor: ['getBooksByGenre.getAuthor'],
      getBooksByAuthor: [Book.findByAuthorId, 'getBookAuthor'],
      getManyHamblies: flow.subFlow('getBooksByAuthor', {
        getHambly2: [Author.getById, 'getHambly']
      })
    }),
    getHambly: [Author.getByName, 'authorName']    
  }, function(err, results){
    test.ok(!err, 'no error');
    test.deepEqual(results, { 
      genreName: 'Fantasy',
      authorName: 'Barbara Hambly',
      getGenre: Genre.all[1],
      getBooksByGenre: [Book.all[7], Book.all[8], Book.all[9], Book.all[10], Book.all[11]],
      getHambly: Author.all[6],
      getAuthors: [{
        getBookAuthor: Author.all[6],
        getBooksByAuthor: [Book.all[7], Book.all[8]],
        getManyHamblies: [{
          getHambly2: Author.all[6]
        }, {
          getHambly2: Author.all[6]
        }]
      }, {
        getBookAuthor: Author.all[6],
        getBooksByAuthor: [Book.all[7], Book.all[8]],
        getManyHamblies: [{
          getHambly2: Author.all[6]
        }, {
          getHambly2: Author.all[6]
        }]
      }, {
        getBookAuthor: Author.all[5],
        getBooksByAuthor: [Book.all[9], Book.all[10], Book.all[11]],
        getManyHamblies: [{
          getHambly2: Author.all[6]
        }, {
          getHambly2: Author.all[6]
        }, {
          getHambly2: Author.all[6]
        }]
      }, {
        getBookAuthor: Author.all[5],
        getBooksByAuthor: [Book.all[9], Book.all[10], Book.all[11]],
        getManyHamblies: [{
          getHambly2: Author.all[6]
        }, {
          getHambly2: Author.all[6]
        }, {
          getHambly2: Author.all[6]
        }]
      }, {
        getBookAuthor: Author.all[5],
        getBooksByAuthor: [Book.all[9], Book.all[10], Book.all[11]],
        getManyHamblies: [{
          getHambly2: Author.all[6]
        }, {
          getHambly2: Author.all[6]
        }, {
          getHambly2: Author.all[6]
        }]
      }]
    });
    test.done();
  });  
}

module.exports["subflow with prereqs and result instance parameter"] = function(test){
  flow({ 
    genreName: 'Fantasy',
    authorName: 'Barbara Hambly'
  }, {
    getGenre: [Genre.getByName, 'genreName'],
    getBooksByGenre: ['getGenre.getBooks'],
    getAuthors: flow.subFlow('getBooksByGenre', {
      getHambly2: [Author.getById, 'getHambly.id']
    }),
    getHambly: [Author.getByName, 'authorName']
  }, function(err, results){
    test.ok(!err, 'no error');
    test.deepEqual(results, { 
      genreName: 'Fantasy',
      authorName: 'Barbara Hambly',
      getGenre: Genre.all[1],
      getBooksByGenre: [Book.all[7], Book.all[8], Book.all[9], Book.all[10], Book.all[11]],
      getHambly: Author.all[6],
      getAuthors: [{
        getHambly2: Author.all[6]
      }, {
        getHambly2: Author.all[6]
      }, {
        getHambly2: Author.all[6]
      }, {
        getHambly2: Author.all[6]
      }, {
        getHambly2: Author.all[6]
      }]
    });
    test.done();
  });  
}

module.exports["subflow with empty name"] = function(test){
  try {
    flow({ 
      genreName: 'Fantasy'
    }, {
      getGenre: [Genre.getByName, 'genreName'],
      getBooksByGenre: ['getGenre.getBooks'],
      getAuthors: flow.subFlow('', {
        getBookAuthor: ['getBooksByGenre.getAuthor']
      })
    }, function(err, results){
      test.fail(null, null, "no error received");
      test.done();
    });
  } catch(e) {
    test.ok(e, 'got an error'); 
    test.equals(e.name, "Error", "got Error");
    test.equals(e.message, "SubFlow error: No data given for subFlow. Provide the name of a task or data from the parent flow.", "error message match")
    test.done();    
  }  
}

module.exports["subflow with no tasks"] = function(test){
  try {
    flow({ 
      genreName: 'Fantasy'
    }, {
      getGenre: [Genre.getByName, 'genreName'],
      getBooksByGenre: ['getGenre.getBooks'],
      getAuthors: flow.subFlow('getBooksByGenre', null)
    }, function(err, results){
      test.fail(null, null, "no error received");
      test.done();
    });
  } catch(e) {
    test.ok(e, 'got an error'); 
    test.equals(e.name, "Error", "got Error");
    test.equals(e.message, "SubFlow error: No tasks given for subFlow.", "error message match")
    test.done();    
  }  
}


module.exports["subflow with bad data name"] = function(test){
  try {
    flow({ 
      genreName: 'Fantasy'
    }, {
      getGenre: [Genre.getByName, 'genreName'],
      getBooksByGenre: ['getGenre.getBooks'],
      getAuthors: flow.subFlow('asdf', {
        getBookAuthor: ['getBooksByGenre.getAuthor']
      })
    }, function(err, results){
      test.fail(null, null, "no error received");
      test.done();
    });
  } catch(e) {
    test.ok(e, 'got an error'); 
    test.equals(e.name, "FlowTaskError", "got Error");
    test.equals(e.message, "Flow error in 'getAuthors': SubFlow data 'asdf' does not exist. Provide the name of a task or data from the parent flow.  Possible values include: getGenre, getBooksByGenre, genreName", "error message match")
    test.done();    
  }  
}

module.exports["subflow task with own data name"] = function(test){
  try {
    flow({ 
      genreName: 'Fantasy'
    }, {
      getGenre: [Genre.getByName, 'genreName'],
      getBooksByGenre: ['getGenre.getBooks'],
      getAuthors: flow.subFlow('getAuthors', {
        getBookAuthor: ['getBooksByGenre.getAuthor']
      })
    }, function(err, results){
      test.fail(null, null, "no error received");
      test.done();
    });
  } catch(e) {
    test.ok(e, 'got an error'); 
    test.equals(e.name, "FlowTaskError", "got Error");
    test.equals(e.message, "Flow error in 'getAuthors': SubFlow data 'getAuthors' does not exist. Provide the name of a task or data from the parent flow.  Possible values include: getGenre, getBooksByGenre, genreName", "error message match")
    test.done();    
  }  
}


module.exports["subflow with explicit prereq"] = function(test){
  flow({ 
    genreName: 'Fantasy'
  }, {
    getGenre: [Genre.getByName, 'genreName'],
    assertGenreExistence: [Genre.assertExistence, 'getGenre'],
    getBooksByGenre: ['getGenre.getBooks'],
    getAuthors: ['assertGenreExistence', flow.subFlow('getBooksByGenre', {
      getBookAuthor: [Author.getById, 'authorId']
    })]
  }, function(err, results){
    test.ok(!err, 'no error');
    test.deepEqual(results, { 
      genreName: 'Fantasy',
      assertGenreExistence: true,
      getGenre: Genre.all[1],
      getBooksByGenre: [Book.all[7], Book.all[8], Book.all[9], Book.all[10], Book.all[11]],
      getAuthors: [{
        getBookAuthor: Author.all[6]
      }, {
        getBookAuthor: Author.all[6]
      }, {
        getBookAuthor: Author.all[5]
      }, {
        getBookAuthor: Author.all[5]
      }, {
        getBookAuthor: Author.all[5]
      }]
    });
    test.done();
  });  
}

module.exports["subflow out of order"] = function(test){
  try {
    flow({ 
      genreName: 'Fantasy'
    }, {
      getGenre: [Genre.getByName, 'genreName'],
      assertGenreExistence: [Genre.assertExistence, 'getGenre'],
      getBooksByGenre: ['getGenre.getBooks'],
      getAuthors: [flow.subFlow('getBooksByGenre', {
        getBookAuthor: [Author.getById, 'authorId']
      }), 'assertGenreExistence']
    }, function(err, results){
      test.fail(null, null, "no error received");
      test.done();
    });  
  } catch(e){
    test.ok(e, 'got an error'); 
    test.equals(e.name, "FlowTaskError", "got Error");
    test.equals(e.message, "Flow error in 'getAuthors': SubFlows must be at the last index.", "error message match")
    test.done();
  }
}


module.exports["subflow in task array with bad data name"] = function(test){
  try {
    flow({ 
      genreName: 'Fantasy'
    }, {
      getGenre: [Genre.getByName, 'genreName'],
      assertGenreExistence: [Genre.assertExistence, 'getGenre'],
      getBooksByGenre: ['getGenre.getBooks'],
      getAuthors: ['assertGenreExistence', flow.subFlow('asdf', {
        getBookAuthor: [Author.getById, 'authorId']
      })]
    }, function(err, results){
      test.fail(null, null, "no error received");
      test.done();
    });  
  } catch(e){
    test.ok(e, 'got an error'); 
    test.equals(e.name, "FlowTaskError", "got Error");
    test.equals(e.message, "Flow error in 'getAuthors': SubFlow data 'asdf' does not exist. Provide the name of a task or data from the parent flow.  Possible values include: getGenre, assertGenreExistence, getBooksByGenre, genreName", "error message match")
    test.done();
  }
}


module.exports["subflow in task array with own data name"] = function(test){
  try {
    flow({ 
      genreName: 'Fantasy'
    }, {
      getGenre: [Genre.getByName, 'genreName'],
      assertGenreExistence: [Genre.assertExistence, 'getGenre'],
      getBooksByGenre: ['getGenre.getBooks'],
      getAuthors: ['assertGenreExistence', flow.subFlow('getAuthors', {
        getBookAuthor: [Author.getById, 'authorId']
      })]
    }, function(err, results){
      test.fail(null, null, "no error received");
      test.done();
    });  
  } catch(e){
    test.ok(e, 'got an error'); 
    test.equals(e.name, "FlowTaskError", "got Error");
    test.equals(e.message, "Flow error in 'getAuthors': SubFlow data 'getAuthors' does not exist. Provide the name of a task or data from the parent flow.  Possible values include: getGenre, assertGenreExistence, getBooksByGenre, genreName", "error message match")
    test.done();
  }
}



module.exports["single data subflow execution"] = function(test){
  flow({ 
    genreName: 'Fantasy'
  }, {
    getGenre: [Genre.getByName, 'genreName'],
    getBooksByGenre: flow.subFlow('getGenre', {
      getBooksByGenre: [Book.findByGenreId, 'id']
    })
  }, function(err, results){
    test.ok(!err, 'no error');
    test.deepEqual(results, { 
      genreName: 'Fantasy',
      getGenre: Genre.all[1],
      getBooksByGenre: {
        getBooksByGenre: [Book.all[7], Book.all[8], Book.all[9], Book.all[10], Book.all[11]]
      }
    });
    test.done();
  });  
}


module.exports["single null data subflow execution"] = function(test){
  try {
    flow({ 
      genreName: 'Chainsaw slashers'
    }, {
      getGenre: [Genre.getByName, 'genreName'],
      getBooksByGenre: flow.subFlow('getGenre', {
        getBooksByGenre2: [Book.findByGenreId, 'id']
      })
    }, function(err, results){
      test.fail(null, null, "no error received");
      test.done();
    });
  } catch(e){
    test.ok(e, 'got an error'); 
    test.equals(e.name, "FlowTaskError", "got Error");
    test.equals(e.message, "Flow error in 'getBooksByGenre': Result of 'getGenre' returned no data. Could not start SubFlow.", "error message match")
    test.done();
  }
}

module.exports["subflow with result instance parameter"] = function(test){
  flow({ 
    genreName: 'Fantasy'
  }, {
    getGenre: [Genre.getByName, 'genreName'],
    getBooksByGenre: ['getGenre.getBooks'],
    getAuthors: flow.subFlow('getBooksByGenre', {
      getBookAuthor: [Author.getById, 'getBooksByGenre.authorId']
    })
  }, function(err, results){
    test.ok(!err, 'no error');
    test.deepEqual(results, { 
      genreName: 'Fantasy',
      getGenre: Genre.all[1],
      getBooksByGenre: [Book.all[7], Book.all[8], Book.all[9], Book.all[10], Book.all[11]],
      getAuthors: [{
        getBookAuthor: Author.all[6]
      }, {
        getBookAuthor: Author.all[6]
      }, {
        getBookAuthor: Author.all[5]
      }, {
        getBookAuthor: Author.all[5]
      }, {
        getBookAuthor: Author.all[5]
      }]
    });
    test.done();
  });  
}

module.exports["asynchronous task execution"] = function(test){
  flow({
    id: 3,
  }, {
    getBook: flow.asyncTask(Book.getById, 'id'),
    getAuthor: flow.asyncTask(Author.getById, 'getBook.authorId'),
  }, function(err, results){
    test.deepEqual({
      id: 3,
      getBook: Book.all[3],
      getAuthor: Author.all[1],
    }, results);
    test.done();
  });
}

module.exports["asynchronous task execution with array"] = function(test){
  flow({
    id: 3,
  }, {
    getBook: flow.asyncTask([Book.getById, 'id']),
    getAuthor: flow.asyncTask([Author.getById, 'getBook.authorId']),
  }, function(err, results){
    test.deepEqual({
      id: 3,
      getBook: Book.all[3],
      getAuthor: Author.all[1],
    }, results);
    test.done();
  });
}

module.exports["synchronous task execution"] = function(test){
  flow({
    id: 3,
    new_object: {}
  }, {
    getBook: [Book.getById, 'id'],
    getAuthor: [Author.getById, 'getBook.authorId'],
    getBookAuthorData: flow.syncTask(us.extend, 'new_object', 'getBook', 'getAuthor')
  }, function(err, results){
    test.deepEqual({
      id: 3,
      new_object: us.extend({}, Book.all[3], Author.all[1]),
      getBook: Book.all[3],
      getAuthor: Author.all[1],
      getBookAuthorData: us.extend({}, Book.all[3], Author.all[1])
    }, results);
    test.done();
  });
}

module.exports["synchronous task execution with array"] = function(test){
  flow({
    id: 3,
    new_object: {}
  }, {
    getBook: [Book.getById, 'id'],
    getAuthor: [Author.getById, 'getBook.authorId'],
    getBookAuthorData: flow.syncTask([us.extend, 'new_object', 'getBook', 'getAuthor'])
  }, function(err, results){
    test.deepEqual({
      id: 3,
      new_object: us.extend({}, Book.all[3], Author.all[1]),
      getBook: Book.all[3],
      getAuthor: Author.all[1],
      getBookAuthorData: us.extend({}, Book.all[3], Author.all[1])
    }, results);
    test.done();
  });
}


// module.exports["array result data execution"] = function(test){
//   var authors, fantasyAuthors;
//   fantasyAuthors = new FnFlow({
//     genreName: 'Fantasy',
//   })
//     .addTask('getGenre', Genre.getByName, fantasyAuthors.data('genreName'));
//     .addTask('getBooksByGenre', fantasyAuthors.task.getGenre, fantasyAuthors.task.getGenre.call('getBooks'));
//     .addTask('getAuthors', (authors = new FnFlow(fantasyAuthors.task.getBooksByGenre))
//       .addTask('getBookAuthor', authors.data.call('getAuthor'))
//       .addTask('getBookAuthor', Author.getById, author.data('authorId'))
//     )
//   }, function(err, results){
//     test.ok(!err, 'no error');
//     test.deepEqual(results, { 
//       genreName: 'Fantasy',
//       getGenre: Genre.all[1],
//       getBooksByGenre: [Book.all[7], Book.all[8], Book.all[9], Book.all[10], Book.all[11]],
//       getAuthors: [{
//         getBookAuthor: Author.all[6]
//       }, {
//         getBookAuthor: Author.all[6]
//       }, {
//         getBookAuthor: Author.all[5]
//       }, {
//         getBookAuthor: Author.all[5]
//       }, {
//         getBookAuthor: Author.all[5]
//       }]
//     });
//     test.done();
//   });  
// }


// flow({
//   some_data: 2,
//   some_value: '3.2',
// }, {
//   test1: flow.asyncTask([Class.doSomething, 'some_data']),
//   test3: flow.syncTask([parseInt, 'some_value'])
// })