const express = require("express");
const bookCtrl = require("../controllers/book");
const multer = require("../middleware/multer-config");
const router = express.Router();

const auth = require("../middleware/auth");

router.get("/", bookCtrl.getBook);

router.get("/bestrating", bookCtrl.bestBook);

router.get("/:id", bookCtrl.getOneBook);

router.post("/", auth, multer, bookCtrl.postBook);

router.put("/:id", auth, multer, bookCtrl.updateBook);

router.delete("/:id", auth, bookCtrl.deleteBook);

router.post("/:id/rating", auth, bookCtrl.rateBook);

module.exports = router;
