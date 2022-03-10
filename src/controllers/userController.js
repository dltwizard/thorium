const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const createUser = async function (req, res) {
  try {
    let data = req.body;
    console.log(data);
    if (Object.keys(data).length != 0) {
      let savedData = await userModel.create(data);
      res.status(201).send({ msg: savedData });
    } else res.status(400).send({ msg: "BAD REQUEST" });
  } catch (err) {
    console.log("This is the error :", err.message);
    res.status(500).send({ msg: "Error", error: err.message });
  }
};

const loginUser = async function (req, res) {
  let userName = req.body.emailId;
  let password = req.body.password;

  let user = await userModel.findOne({ emailId: userName, password: password });
  if (!user)
    return res.status(400).send({
      status: false,
      msg: "username or the password is not corerct",
    });

  let token = jwt.sign(
    {
      userId: user._id.toString(),
      batch: "thorium",
      organisation: "FUnctionUp",
    },
    "functionup-thorium"
  );
  res.setHeader("x-auth-token", token);
  res.send({ status: true, data: token });
};

const getUserData = async function (req, res) {
  // let token = req.headers["x-Auth-token"];
  // if (!token) token = req.headers["x-auth-token"];
  // //token verification for the one we created above
  // let decodedToken = jwt.verify(token, "functionup-thorium");
  // if (!decodedToken)
  //   return res.send({ status: false, msg: "token is invalid" });
  //   let user = req.params.userId;
  //   let userToBeModified = req.params.userId;
  //   let userLoggedIn = decodedToken.userId;
  //   if(userToBeModified != userLoggedIn) return res.send({status:false, msg:"User not logged in. Can't perform this action!"});
  //   if(!user) return res.send({status:false, msg:"User not found"});

  let userId = req.params.userId;
  let userDetails = await userModel.findById(userId);
  if (!userDetails)
    return res.status(404).send({ status: false, msg: "No such user exists" });

  res.send({ status: true, data: userDetails });
};

const updateUser = async function (req, res) {
  let userId = req.params.userId;
  let user = await userModel.findById(req.params.userId);
  if (!user) {
    return res.status(404).send("No such user exists");
  }
  let token = req.headers["x-auth-token"]; //expecting a header token in postman body.
  // if (!token) return res.send({ status: false, msg: "token must be present" });
  let decodedToken = jwt.verify(token, "functionup-thorium");
  if (!decodedToken)
    return res.status(400).send({ status: false, msg: "token is not valid" });
  let userToBeModified = req.params.userId;
  let userLoggedIn = decodedToken.userId;
  if (userToBeModified != userLoggedIn)
    return res
      .status(400)
      .send({
        status: false,
        msg: "User not logged in. Can't perform this action!",
      });
  if (!user) return res.send({ status: false, msg: "User not found" });

  let userData = req.body;
  let updatedUser = await userModel.findOneAndUpdate(
    { _id: userId },
    { new: true },
    userData
  );
  res.send({ status: true, data: updatedUser });
};

const deleteStatusUpdate = async (req, res) => {
  let userId = req.params.userId;
  let user = await userModel.findById(userId); //find the value that I inserted!
  if (!user) {
    return res.status(401).send("Invalid User ID!");
  }
  let changeState = await userModel.updateMany({ isDeleted: true });
  res.send("isDeleted changed to 'true'! Check DB.");
  //res.send({data: changeState});
};

const createPost = async (req, res) => {
  let message = req.body.message;
  // let token = req.headers["x-auth-token"];
  // if(!token) return res.send({status: false, msg: "token must be present in the request header"});
  // let decodedToken = jwt.verify(token, 'functionup-thorium');
  // if(!decodedToken) return res.send({status: false, msg:"token is not valid"});
  // let userToBeModified = req.params.userId;
  // let userLoggedIn = decodedToken.userId;
  // if(userToBeModified != userLoggedIn) return res.send({status:false, msg:"User not logged in. Can't perform this action!"});
  let user = await userModel.findById(req.params.userId);
  // if(!user) return res.send({status:false, msg:"User not found"});
  let updatedPost = user.posts;
  updatedPost.push(message);
  let updatedUser = await userModel.findOneAndUpdate(
    { _id: user._id },
    { posts: updatedPost },
    { new: true }
  );
  res.send({ status: true, data: updatedUser });
};

module.exports.createUser = createUser;
module.exports.getUserData = getUserData;
module.exports.updateUser = updateUser;
module.exports.loginUser = loginUser;
module.exports.deleteStatusUpdate = deleteStatusUpdate;
module.exports.createPost = createPost;
