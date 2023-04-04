const Book = require("../models/Book");
const fs = require("fs");
const console = require("console");

exports.getBook = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

exports.postBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });

  book
    .save()
    .then(() => {
      res.status(201).json({ message: "Livre enregistré !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.updateBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Livre modifié!" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Livre supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.rateBook = (req, res, next) => {
  const newRate = req.body.rating;
  delete newRate.userId;
  Book.findOne({ _id: req.params.id }).then((book) => {
    let alreadyRate = false;
    const bookObj = book.ratings;
    bookObj.forEach((element) => {
      if (element.userId === req.auth.userId) {
        alreadyRate = true;
      }
    });
    if (alreadyRate) {
      res.status(401).send(book);
    } else {
      const notes = book.ratings;
      let total = newRate;
      notes.forEach((note) => {
        total += note.grade;
      });
      const newMoyenne = Math.round((total / (notes.length + 1)) * 100) / 100;
      Book.updateOne(
        { _id: req.params.id },
        {
          $push: { ratings: { userId: req.auth.userId, grade: newRate } },
          $set: { averageRating: newMoyenne },
        }
      ).then(() => {
        Book.findOne({ _id: req.params.id }).then((updateBook) => {
          res.status(200).send(updateBook);
        });
      });
    }
  });
};

exports.bestBook = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(400).json({ error }));
};
