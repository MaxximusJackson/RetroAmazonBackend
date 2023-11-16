import express from 'express';
import debug from 'debug';
const debugBook = debug('app:Book');
import { connect,getBooks,getBookById, updateBook, addBook, deleteBook, saveEdit } from '../../database.js';
import {validId} from '../../middleware/validId.js';
import { validBody } from '../../middleware/validBody.js';
import Joi from 'joi';
import {isLoggedIn} from '@merlin4/express-auth';

const router = express.Router();

const newBookSchema = Joi.object({
  isbn:Joi.string().trim().min(14).required(),
  title:Joi.string().trim().min(1).required(),
  author:Joi.string().trim().min(1).required(),
  genre:Joi.string().valid('Fiction', 'Magical Realism', 'Dystopian', 'Mystery', 'Young Adult', 'Non-Fiction').required(),
  publication_year:Joi.number().integer().min(1900).max(2023).required(),
  price:Joi.number().min(0).required(),
  description:Joi.string().trim().min(1).required(),
});

const updateBookSchema = Joi.object({
  isbn:Joi.string().trim().min(14),
  title:Joi.string().trim().min(1),
  author:Joi.string().trim().min(1),
  genre:Joi.string().valid('Fiction', 'Magical Realism', 'Dystopian', 'Mystery', 'Young Adult', 'Non-Fiction', 'Adventure'),
  publication_year:Joi.number().integer().min(1900).max(2023),
  price:Joi.number().min(0),
  description:Joi.string().trim().min(1),
})

router.get('/list',  async (req, res) => {
 
  try {
    const db = await getBooks();
    const books = await getBooks();
  res.status(200).json(books);
  } catch (error) {
    res.status(500).json({error: error.stack});
  }
});



router.get('/:id', isLoggedIn(), validId('id'), async (req, res) => {
  const id = req.id;
  try {
    const book = await getBookById(id);
    if(book){
      res.status(200).json(book);
    }else{
      res.status(404).json({message: `Book ${id} not found`});
    }
   
  } catch (error) {
    res.status(500).json({error: error.stack});
  }
});

router.put('/update/:id', isLoggedIn(), validId('id'), validBody(updateBookSchema), async (req, res) => {
  const id = req.id;
  const updatedBook = req.body;

  if(updatedBook.price){
    updatedBook.price = parseFloat(updatedBook.price);
  }
  try {
    const updateResult = await updateBook(id, updatedBook);
    if (updateResult.modifiedCount == 1) {
      const edit = {
        timeStamp: new Date(),
        op: 'Update Book',
        collection:'Book',
        target:id,
        auth:req.auth
      }
      await saveEdit(edit);
      res.status(200).json({message: `Book ${id} updated`});
    } else {
      res.status(400).json({message: `Book ${id} not updated`});
    }
  } catch (err) {
    res.status(500).json({error: err.stack});
  }
  
});

router.post('/add', isLoggedIn(), validBody(newBookSchema), async (req, res) => {
  const newBook = req.body;
  const dbResult = await addBook(newBook);
  try{
  if(dbResult.acknowledged == true){
    res.status(200).json({message: `Book ${newBook.title} added`});
  }else{
    res.status(400).json({message: `Book ${newBook.title} not added`});
  }
}catch(err){
  res.status(500).json({error: err.stack});
}
});

router.delete('/delete/:id', isLoggedIn(), validId('bookId'), async(req, res) => {
  const id = req.id;
  
  try {
    const dbResult = await deleteBook(id);

    if (dbResult.deletedCount == 1) {
      res.status(200).json({message: `Book ${id} deleted`});
    }else{
      res.status(400).json({message: `Book ${id} not deleted`});
    }
  } catch (err) {
    res.status(500).json({error: err.stack});
  }
  
});

export {router as BookRouter};