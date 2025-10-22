const Joi = require('joi');

// User validation schemas
const userValidationSchemas = {
  createUser: Joi.object({
    uid: Joi.string().optional().messages({
      'string.base': 'UID must be a string'
    }),
    name: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    }),
    phone: Joi.string().optional().allow('').messages({
      'string.base': 'Phone must be a string'
    }),
    role: Joi.string().valid('employee', 'admin', 'super_admin').default('employee').messages({
      'any.only': 'Role must be employee, admin, or super_admin'
    }),
    address: Joi.string().max(200).optional().allow('').messages({
      'string.max': 'Address cannot exceed 200 characters'
    }),
    photoURL: Joi.string().optional().allow('').messages({
      'string.base': 'Photo URL must be a string'
    })
  }),

  updateUser: Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
    role: Joi.string().valid('employee', 'admin', 'super_admin').optional(),
    address: Joi.string().max(200).optional(),
    photoURL: Joi.string().uri().optional()
  })
};

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    console.log("Validation middleware - Request body:", req.body);
    
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });

    if (error) {
      console.log("Validation errors:", error.details);
      
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      console.log("Formatted validation errors:", errorMessages);

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorMessages
      });
    }

    console.log("Validation passed, cleaned data:", value);
    req.body = value;
    next();
  };
};

module.exports = {
  userValidationSchemas,
  validate
};
