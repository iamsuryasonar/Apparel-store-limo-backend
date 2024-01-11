// Reset user password: POST /reset-password
// Change user password: PUT /change-password

const Admin = require('../../models/Admin');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { success, error, validation } = require('../../responseAPI')

exports.adminRegistration = async (req, res) => {
  if (!req.body.name) return res.status(422).json(validation({ username: "Name is required" }));
  if (!req.body.email) return res.status(422).json(validation({ username: "Email is required" }));
  if (!req.body.password) return res.status(42).json(validation({ username: "Password is required" }));

  //check if email exists in the database
  const emailExist = await Admin.findOne({ email: req.body.email })

  if (emailExist) return res.status(400).json(error("Email already exist", res.statusCode));

  // hash password using bcrypt 
  const hashedPassword = bcrypt.hashSync(req.body.password, 10)

  //calling User construction to create a new user with type User
  const admin = new Admin({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
  })
  try {
    // Mongoose provides a save function that will take a JSON 
    // object and store it in the database. Our body-parser (in our case express.json) middleware,
    // will convert the user’s input into the JSON format for us.

    const savedAdmin = await admin.save();
    res.status(201).json(success("OK", {
    },
      res.statusCode),
    );
  } catch (error) {
    return res.status(500).json(error("Something went wrong", res.statusCode));
  }

};

exports.adminLogIn = async (req, res) => {
  if (!req.body.email) return res.status(422).json(validation({ username: "Email is required" }));
  if (!req.body.password) return res.status(42).json(validation({ username: "Password is required" }));

  try {

    // check if email exists in the database and get the user's password(data) so that we can compare hashes
    const admin = await Admin.findOne({ email: req.body.email })
    if (!admin) return res.status(400).json(error("Email not found", res.statusCode));


    const matched = await bcrypt.compare(req.body.password, admin.password);
    if (!matched) return res.status(400).json(error("Invalid Password", res.statusCode));

    // create token using jsonwebtoken library
    const token = jwt.sign({ _id: admin._id, role: admin.role, exp: Math.floor(Date.now() / 1000) + 3 * 3600, }, process.env.TOKEN_SECRET,)
    const userData = await Admin.findOne({ email: req.body.email })
    const userinfo = {
      'name': userData.name,
      'email': userData.email,
    }

    res.status(200).json(success("OK", {
      ...userinfo, token
    },
      res.statusCode),
    );
  } catch (error) {
    return res.status(500).json(error("Something went wrong", res.statusCode));
  }

};
