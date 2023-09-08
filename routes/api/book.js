import express from 'express';
import debug from 'debug';
const debugServer = debug('app:book');
const router = express.Router();

const books = [
  {"title": "Collector, The (Komornik)","author": "Hamlen Yarnell","publication_date": "12/4/1921","genre": "fiction","_id": 1}, 
  {"title": "Smiling Lieutenant, The","author": "Jeramey MacLeod","publication_date": "12/23/1906","genre": "non-fiction","_id": 2}, 
  {"title": "Man Who Laughs, The","author": "Giuditta Penna","publication_date": "5/22/1934","genre": "mystery","_id": 3}, 
  {"title": "New Country, The (Det nya landet)","author": "Dasi Martland","publication_date": "2/15/1916","genre": "romance","_id": 4}, 
  {"title": "Sapphire","author": "Lambert Nairn","publication_date": "12/13/1926","genre": "mystery","_id": 5}
]

router.get('/list', (req, res) => {
  res.status(200).json(books);
});

router.get('/:id', (req, res) => {
  const id = req.params.id;
  const book = books.find(book => book._id == id);
  if(book){
    res.status(200).send(book);
  } else {
    res.status(404).send({message: `Book ${id} not found`});
  }
});

router.put('/:id', (req, res) => {
  const id = req.params.id;
  const currentBook = books.find(book => book._id == id);
  const updatedBook = req.body;

  if(currentBook){
    for(const key in updatedBook){
      if(currentBook[key] != updatedBook[key]){
        currentBook[key] = updatedBook[key]
      }
    }
    const index = books.findIndex(book => book._id == id);
    if(index != -1){
      books[index] = currentBook;
    }
    res.status(200).send(`Book ${id} updated`);
  } else {
    res.status(400).send({message: `Book ${id} not found`});
  }

  res.json(updatedBook);
});

router.post('/add', (req, res) => {
  const newBook = req.body;

  if(newBook){
  const id = books.length + 1;
  newBook._id = id;
  books.push(newBook);
  res.status(200).json({message: `Book ${newBook.title} added`});
  } else {
    res.status(400).json({message: `Error in adding book`});
  }
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  const index = books.findIndex(book => book._id == id);
  if(index != -1){
    books.splice(index,1);
    res.status(200).json(`Book ${id} deleted`);
  } else {
    res.status(400).json({message: `Book ${id} not found`});
  }
});

export {router as BookRouter};