'use strict';

const express = require('express');
const { check, validationResult } = require('express-validator');

// Construct a router instance.
const router = express.Router();

// Async Handler
function asyncHandler(cb) {
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error) {
      next(error);
    }
  }
}

// Users
// GET /api/users 200 - returns currently authenticated user
router.get('/users', asyncHandler(async (req, res) => {

}));

// POST /api/users 201 - creates a user, sets location header to "/" and returns no content
router.post('/users', [
  check('firstName')
    .exists()
    .withMessage('Please provide a value for "firstName"'),
  check('lastName')
    .exists()
    .withMessage('Please provide a value for "lastName"'),
  check('email')
    .exists()
    .withMessage('Please provide a value for "email"'),
  check('password')
    .exists()
    .withMessage('Please provide a value for "password"')
], asyncHandler(async (req, res) => {
  //Attempt to get the validation result from the Request object.
  const errors = validationResult(req);
  // If there are validation errors...
  if(!errors.isEmpty()) {
    // User the Array `map()` mthod to get a list of error messages.
    const errorMessages = errors.array().map(error => error.msg);
    // Return the validation errrors to the client.
    res.status(400).json({ errors: errorMessages });
  }
}));

// Courses
// GET /api/course 200 - returns a list of courses (including the user that owns each course)
router.get('/courses', asyncHandler(async (req, res) => {
  const courses = await Course.findAll({
    include: {
      model:
      as:
      attributes:
    },
    attributes:
  })
  res.json(courses);
}));

// GET /api/courses/:id 200 - returns the course (including the user that owns the course) for the provided course ID
router.get('/courses/:id', asyncHandler(async (req, res) => {
  const courseId = req.params.id;
  const course = await Course.findByPk(courseId, {
    include: {
      model:
      as:
      attributes:
    },
    attributes:
  })
  if (course) {

  }
}));

// POST /api/courses 201 - creates a course, sets the Location header to the URI for the course and returns no content
router.post('/courses, [
  check('title')
    .exists()
    .withMessage('Please provide a value for "title"'),
  check('description')
    .exists()
    .withMessage('Please provide a value for "description"')
], asyncHandler(async (req, res) => {
  //Attempt to get the validation result from the Request object.
  const errors = validationResult(req);
  // If there are validation errors...
  if(!errors.isEmpty()) {
    // User the Array `map()` mthod to get a list of error messages.
    const errorMessages = errors.array().map(error => error.msg);
    // Return the validation errrors to the client.
    res.status(400).json({ errors: errorMessages });
  }
}));

// PUT /api/courses/:id 204 - updates a course and returns no content
router.put('/courses/:id', asyncHandler(async (req, res) => {

}));

// DELETE /api/courses/:id 204 - deletes a course and returns no content
router.delete('/courses/:id', asyncHandler(async (req, res) => {

})) ;

module.exports = router;

