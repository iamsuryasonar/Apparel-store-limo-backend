// Reset user password: POST /reset-password
// Change user password: PUT /change-password

const Customer = require('../../models').Customer;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sequelize = require('../../config/db');

exports.customerRegistration = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { firstName, lastName, email, password } = req.body;
    const existingCustomer = await Customer.findOne({ where: { email } }, { transaction: t });
    if (existingCustomer) {
      await t.rollback();
      return res.status(400).send('Email already in use');
    }
    const hashedPassword = await bcrypt.hash(password, 8);
    const customer = await Customer.create({ firstName, lastName, email, password: hashedPassword }, { transaction: t });
    await t.commit();
    res.send('Customer created successfully');
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.customerLogIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const customer = await Customer.findOne({ where: { email } });
    if (!customer) {
      return res.status(401).send('Invalid email or password');
    }
    const isValidPassword = await bcrypt.compare(password, customer.password);
    if (!isValidPassword) {
      return res.status(401).send('Invalid email or password');
    }
    const token = jwt.sign({ id: customer.id, role: customer.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.send({ token });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
