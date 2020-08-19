'use strict'

const express = require('express');
const {check, validationResult} = require('express-validator');
const bcryptjs = require('bcryptjs');
const { models } = require('./db');
const basicAuth = require('basic-auth');

// Construct a router instance.
const router = express.Router();

const { User, Course } = models;

// Async Handler
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      return next(error)
    }
  }
}

// Users
// Authenticate User
const authenticateUser = asyncHandler(async(req, res, next) => {
  let message = null;
  const credentials = basicAuth(req);
  // If credentials found - email
  if (credentials) {
    const user = await User.findOne({
      where: {emailAddress: credentials.name}
    });
    // If user is found - password
    if (user) {
      const authenticated = bcryptjs
        .compareSync(credentials.pass, user.password);
      // If password matches
      if (authenticated) {
        req.currentUser = user;
      } else {
        message = `Authentication failure for email: ${user.emailAddress}`;
      }
    } else {
      message = "User not found";
    }
  } else {
    message = 'Auth header not found';
  }
  // If user authentication fails -> access denied
  if (message) {
    res.status(401).json({ message: 'Access Denied' });
  } else {
    next();
  }
});

// GET /api/users 200 - returns currently authenticated user
router.get('/users', authenticateUser, asyncHandler(async(req, res) => {
  const user = req.currentUser;
  res.json({
    Id: user.id,
    Name: `${user.firstName} ${user.lastName}`,
    Email: user.emailAddress
  });
  res.status(200).end();
}));

// POST /api/users 201 - creates a user, sets location header to '/' and returns no content
router.post('/users', [
  check('firstName')
    .exists()
    .withMessage('Please provide a value for "firstName"'),
  check('lastName')
    .exists()
    .withMessage('Please provide a value for "lastName"'),
  check('emailAddress')
    .exists()
    .withMessage('Please provide a value for "email"'),
  check('password')
    .exists()
    .withMessage('Please provide a value for "password"')
], asyncHandler(async( req, res ) => {
      const errors = validationResult(req);
      const user = req.body;
      // If there are validation errors
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        return res.status(400).json({ errors: errorMessages });
      }
      const emailExists = await User.findOne({
        where: {emailAddress: req.body.emailAddress,}
      });
      // If the email exists
      if(emailExists) {
        res.status(400).json({ message: "This email is already in use"})
      }
      // Encrypt password
      if(user.password) {
        user.password = bcryptjs.hashSync(user.password);
      }
    try {
      // Create user
      await User.create(user);
      res.status(201).location('/').end();
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      res.status(400).location('/').json({error: error.errors[0].message});
    } else {
      throw error;
    }
  }
}));

// GET /api/course 200 - returns a list of courses (including the user that owns each course)
router.get('/courses', asyncHandler(async(req, res) => {
  const courses = await Course.findAll();
    res.json(courses)
    res.status(200).end();
}));

// GET /api/course/:id 200 - returns the course (including the user that owns the course) for the provided course ID
router.get('/courses/:id', asyncHandler(async(req, res) => {
  const course = await Course.findByPk(req.params.id);
  if(course) {
    res.json(course);
    res.status(200).end();
  } else {
    res.status(404).json({ message: "There is no course associated with this id"})
  }
}));

// POST /api/courses 201 - creates a course, sets the Location header to the URI for the course and returns no content
router.post('/courses', [
  check('title')
    .exists()
    .withMessage('Please provide a value for "title"'),
  check('description')
    .exists()
    .withMessage('Please provide a value for "description"'),
  check('userId')
    .exists()
    .withMessage('Please provide a value for "userID"'),
], authenticateUser, asyncHandler(async(req, res) => {
  const errors = validationResult(req);
  // If there are validation errors
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    res.status(400).json({ errors: errorMessages });
  } else {
    const course = await Course.create(req.body);
    const courseId = course.dataValues.id
    res.status(201).location(`/courses/${courseId}`).end();
  }
}));

// PUT /api/courses/:id 204 - updates a course and returns no content
router.put('/courses/:id', [
  check('title')
    .exists()
    .withMessage('Please provide a value for "title"'),
  check('description')
    .exists()
    .withMessage('Please provide a value for "description"'),
  check('userId')
    .exists()
    .withMessage('Please provide a value for "userID"'),
], authenticateUser, asyncHandler(async(req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    res.status(400).json({ errors: errorMessages });
  }
  const course = await Course.findByPk(req.params.id);
  if(course) {
    const updated = await course.update(req.body);
    res.status(204).end();
  } else {
    res.status(404).json({ message: "No courses found to Update" });
  }
}));

// DELETE /api/courses/:id 204 - deletes a course and returns no content
router.delete('/courses/:id', authenticateUser, asyncHandler(async(req, res) => {
  const course = await Course.findByPk(req.params.id)
  if(course) {
    await course.destroy();
    res.status(204).end();
    } else {
    res.status(404).json({ message: "No courses found to Delete" })
  }
}));

module.exports = router;