var express = require('express');
var router = express.Router();
let carts = require("../models/cart");
let users = require("../models/user");
let mongoose = require("mongoose");
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});


router.post('/insertUser', (req, res) => {
  console.log(" INSERT BODY", req.body);
  let { email, name } = req.body;
  users.findOne({ email: email }).then(foundUser => {
    if (foundUser) {
      users.findOneAndUpdate({ _id: foundUser._id }, { name: name, email: email }, { new: true }).then(updatedUser => {
        console.log("UPDATED USER", updatedUser);
        res.status(200).json({ message: "USER UPDATED", success: true });
      }).catch(errorInUpdating => {
        console.log("ERROR IN UPDATING", errorInUpdating);
        res.status(200).json({ message: "USER NOT UPDATED", success: false });
      })
    } else {
      let newUser = new users({
        email: email,
        name: name
      });
      newUser.save().then(savedUser => {
        console.log("USER SAVED");
        res.status(200).json({ message: "USER SAVED", success: true });
      }).catch(errorInSaving => {
        console.log("USER NOT SAVED", errorInSaving);
        res.status(200).json({ message: "USER NOT SAVED", success: false });
      })
    }
  }).catch(error => {
    console.log("ERROR IN FINDING USER", error);
  })
})

router.get('/getUsers', (req, res) => {
  users.find().then(userList => {
    console.log("USER LIST", userList);
    res.status(200).json({ success: true, data: userList });
  }).catch(error => {
    console.log("ERROR IN FINDING USER", error);
    res.status(200).json({ success: false, message: "ERROR IN FINDING USERS" });
  })
})

router.post('/insertNewElement', (req, res) => {
  console.log(" INSERT NEW ELEMENT BODY", req.body);
  let { userid, name, price, quantity } = req.body;
  if (!userid || !name || !price || !quantity) {
    console.log("ALL DETAILS ARE NOT PRESENT, PLEASE ADD ALL DETAILS");
    res.status(200).json({ message: "ALL DETAILS ARE NOT PRESENT, PLEASE ADD ALL DETAILS", success: false });
  } else {
    users.findOne({ _id: userid }).then(foundUser => {
      if (foundUser) {
        let newCartObject = new carts({
          name: name,
          price: price,
          quantity: quantity,
          userId: userid
        });
        newCartObject.save().then(savedNewCartObject => {
          console.log("OBJECT SAVED");
          res.status(200).json({ message: "OBJECT SAVED", success: true });
        }).catch(errorInSaving => {
          console.log("OBJECT NOT SAVED", errorInSaving);
          res.status(200).json({ message: "OBJECT NOT SAVED", success: false });
        })
      } else {
        res.status(200).json({ success: false, message: "USER NOT FOUND" });
      }
    }).catch(errorInFindUser => {
      console.log("ERROR IN FINDING USER", errorInFindUser);
      res.status(200).json({ success: false, message: "ERROR IN FINDING USER" });
    })
  }
})


router.post('/updateCartElement', (req, res) => {
  console.log(" INSERT UPDATE CART BODY", req.body);
  let { cartElementId, userid, name, price, quantity } = req.body;
  if (!cartElementId || !userid || !name || !price || !quantity) {
    console.log("ALL DETAILS ARE NOT PRESENT, PLEASE ADD ALL DETAILS");
    res.status(200).json({ message: "ALL DETAILS ARE NOT PRESENT, PLEASE ADD ALL DETAILS", success: false });
  } else {
    users.findOne({ _id: userid }).then(foundUser => {
      if (foundUser) {
        carts.findOne({ _id: cartElementId }).then(foundCartElement => {
          if (foundCartElement) {
            carts.findOneAndUpdate({ _id: foundCartElement._id }, { name: name, price: price, quantity: quantity }, { new: true }).then(updatedCartObject => {
              console.log("UPDATED CART OBJECT", updatedCartObject);
              res.status(200).json({ message: "CART OBJECT UPDATED", success: true });
            }).catch(errorInUpdating => {
              console.log("ERROR IN UPDATING", errorInUpdating);
              res.status(200).json({ message: "CART OBJECT NOT UPDATED", success: false });
            })
          } else {
            res.status(200).json({ success: false, message: "CART ELEMENT NOT FOUND" });
          }
        }).catch(errorInFindingCartObject => {
          console.log("ERROR IN FINDING CART OBJECT", errorInFindingCartObject);
          res.status(200).json({ success: false, message: "ERROR IN FINDING CART OBJECT" });
        })
      } else {
        res.status(200).json({ success: false, message: "USER NOT FOUND" });
      }
    }).catch(errorInFindUser => {
      console.log("ERROR IN FINDING USER", errorInFindUser);
      res.status(200).json({ success: false, message: "ERROR IN FINDING USER" });
    })
  }
})

router.post('/deleteCartObject', function (req, res) {
  let { userid, cartElementId } = req.body;
  if (userid && cartElementId) {
    users.findOne({ _id: userid }).then(foundUser => {
      if (foundUser) {
        carts.findOneAndRemove({ _id: cartElementId }).then(deletedCartObject => {
          console.log("DELETED CART OBJECT", deletedCartObject);
          res.status(200).json({ success: false, message: "OBJECT DELETED" });
        }).catch(errorInDeletingCartObject => {
          console.log("ERROR IN DELETING USER CART OBJECT", errorInDeletingCartObject);
          res.status(200).json({ success: false, message: "ERROR IN DELETING USER CART OBJECT" });
        })
      } else {
        res.status(200).json({ success: false, message: "USER NOT FOUND" });
      }
    }).catch(errorInFindUser => {
      console.log("ERROR IN FINDING USER", errorInFindUser);
      res.status(200).json({ success: false, message: "ERROR IN FINDING USER" });
    })
  } else {
    console.log("ALL DETAILS ARE NOT PRESENT, PLEASE ADD ALL DETAILS");
    res.status(200).json({ success: false, message: "ALL DETAILS ARE NOT PRESENT, PLEASE ADD ALL DETAILS" });
  }
});


router.post('/getCartOrder', function (req, res) {
  let { userid } = req.body;
  if (userid) {
    users.findOne({ _id: userid }).then(foundUser => {
      if (foundUser) {
        carts.aggregate([
          { $match: { userId: mongoose.Types.ObjectId(userid) } },
          {
            $project: {
              total: { $sum: { $multiply: [ "$price", "$quantity" ] }},
              name: 1,
              price: 1,
              quantity: 1
            }
          }
        ]).then(cartOrder => {
          // console.log("CART ORDER", cartOrder);
          if(cartOrder.length > 0) {
            let total = 0;
            cartOrder.forEach(element => {
              total += element.total;
            })
            // console.log("TOTAL", total);
  
            res.status(200).json({ success: true, cart: cartOrder, total: total });
          } else {
            res.status(200).json({ success: true, message: "Your cart is empty" });
          }
        })
      } else {
        res.status(200).json({ success: false, message: "USER NOT FOUND" });
      }
    }).catch(errorInFindUser => {
      console.log("ERROR IN FINDING USER", errorInFindUser);
      res.status(200).json({ success: false, message: "ERROR IN FINDING USER" });
    })
  } else {
    console.log("USER ID NOT PRESENT");
    res.status(200).json({ success: false, message: "User not specified" });
  }
});


module.exports = router;
