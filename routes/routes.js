const express = require("express");
const router = express.Router();
const User = require("../models/users");
const multer = require("multer");
const session = require("express-session");
const fs = require("fs");

// Image upload configuration
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

var upload = multer({
  storage: storage,
}).single("image");

// Insert item in the database
router.post("/add", (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      req.session.message = { message: err.message, type: "danger" };
      return res.redirect("/");
    }
    if (!req.file) {
      req.session.message = { message: "No file uploaded", type: "danger" };
      return res.redirect("/");
    }

    try {
      const user = new User({
        name: req.body.name,
        price: req.body.price,
        quantity: req.body.quantity,
        image: req.file.filename,
      });
      await user.save();
      req.session.message = {
        type: "success",
        message: "Item added successfully!",
      };
      res.redirect("/");
    } catch (err) {
      req.session.message = { message: err.message, type: "danger" };
      res.redirect("/");
    }
  });
});

// Get all items
router.get("/", async (req, res) => {
  try {
    const users = await User.find(); // Use async/await instead of callback
    const message = req.session.message; // Store the session message
    req.session.message = null; // Clear the message after storing it
    res.render("index", {
      title: "Home Page",
      users: users,
      message: message, // Pass the stored message to the template
    });
  } catch (err) {
    res.json({ message: err.message });
  }
});

router.get("/add", (req, res) => {
  res.render("add_items", { title: "Add item" });
});

router.get("/about", (req, res) => {
  res.render("about", { title: "About section" });
});

router.get("/contact", (req, res) => {
  res.render("contact", { title: "Contact me" });
});

//edit an item file
router.get("/edit/:id", async (req, res) => {
  try {
    let id = req.params.id;
    const user = await User.findById(id);
    if (user == null) {
      res.redirect("/");
    } else {
      res.render("edit_items", {
        title: "Edit Item",
        user: user,
      });
    }
  } catch (err) {
    res.redirect("/");
  }
});

// Update user routes
router.post("/update/:id", (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      req.session.message = { message: err.message, type: "danger" };
      return res.redirect("/");
    }

    let id = req.params.id;
    let new_image = "";

    if (req.file) {
      new_image = req.file.filename;
      try {
        fs.unlinkSync("./uploads/" + req.body.old_image);
      } catch (err) {
        console.log(err);
      }
    } else {
      new_image = req.body.old_image;
    }

    try {
      await User.findByIdAndUpdate(id, {
        name: req.body.name,
        price: req.body.price,
        quantity: req.body.quantity,
        image: new_image,
      });
      req.session.message = {
        type: "success",
        message: "Item updated successfully!",
      };
      console.log('Item updated successfully!'); // Debugging log
      res.redirect("/");
    } catch (err) {
      req.session.message = { message: err.message, type: "danger" };
      console.log(err.message); // Debugging log
      res.redirect("/");
    }
  });
});

// delete the item 
router.get("/delete/:id", async (req, res) => {
  try {
    let id = req.params.id;
    const user = await User.findByIdAndDelete(id);

    if (user.image) {
      try {
        fs.unlinkSync("./uploads/" + user.image);
      } catch (err) {
        console.log(err);
      }
    }

    req.session.message = {
      type: "success",
      message: "Item deleted successfully!",
    };
    res.redirect("/");
  } catch (err) {
    req.session.message = { message: err.message, type: "danger" };
    res.redirect("/");
  }
});

router.post('/submit-contact-form', (req, res) => {
  const { name, email, subject, message } = req.body;
  // Handle the form submission, e.g., save to the database or send an email
  console.log(`Received contact form submission: ${name}, ${email}, ${subject}, ${message}`);
  
  // Redirect or render a success page
  res.redirect('/contact');
});

module.exports = router;
