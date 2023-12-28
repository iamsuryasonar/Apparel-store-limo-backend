// Reset user password: POST /reset-password
// Change user password: PUT /change-password

const Admin = require('../../models').Admin;
const sequelize = require('../../config/db');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.adminRegistration = async (req, res) => {
  const t = await sequelize.transaction();
  const { name, email, password } = req.body;

  try {
    const existingAdmin = await Admin.findOne({ where: { email } }, { transaction: t });
    if (existingAdmin) {
      await t.rollback();
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const newAdmin = await Admin.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: 'ADMIN'
    }, { transaction: t });
    await t.commit();
    res.status(201).json({ message: 'Admin created successfully' });
  } catch (error) {
    await t.rollback();
    console.log(error);
    res.status(500).json({ message: 'Internal server error', error: error });
  }
};

exports.adminLogIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({ "data": { message: 'Admin logged in successfully', token, role: admin.role } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
