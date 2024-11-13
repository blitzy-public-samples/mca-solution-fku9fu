/**
 * @fileoverview Express middleware for validating email message and attachment data
 * 
 * Human Tasks:
 * 1. Review and adjust MAX_ATTACHMENT_SIZE if needed based on infrastructure capacity
 * 2. Update ALLOWED_CONTENT_TYPES if additional file types need to be supported
 * 3. Monitor validation error rates for potential adjustments to validation rules
 */

import { Request, Response, NextFunction } from 'express'; // ^4.18.2
import * as Joi from 'joi'; // ^17.9.0
import { IEmailMessage, IEmailAttachment, AttachmentType } from '../interfaces/email.interface';

// Constants for attachment validation
const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10MB max file size
const ALLOWED_CONTENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

/**
 * @description Schema for validating email message structure
 * @requirement Data Validation - Ensure data integrity and format compliance for email processing
 */
const emailMessageSchema = Joi.object({
  messageId: Joi.string().required(),
  from: Joi.string().email().required(),
  subject: Joi.string().required(),
  attachments: Joi.array().items(
    Joi.object({
      filename: Joi.string().required(),
      contentType: Joi.string().valid(...ALLOWED_CONTENT_TYPES).required(),
      size: Joi.number().max(MAX_ATTACHMENT_SIZE).required(),
      type: Joi.string().valid(...Object.values(AttachmentType)).required()
    })
  )
});

/**
 * Validates incoming email message data against defined schema
 * @requirement Email Processing - Automated monitoring and processing of submissions@dollarfunding.com
 */
export const validateEmailMessage = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const emailData: Partial<IEmailMessage> = req.body;

    const { error } = emailMessageSchema.validate(emailData, {
      abortEarly: false,
      allowUnknown: true
    });

    if (error) {
      res.status(400).json({
        success: false,
        message: 'Email message validation failed',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
      return;
    }

    next();
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Internal server error during email validation',
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

/**
 * Validates email attachments for size, content type and attachment type
 * @requirement Data Validation - Ensure data integrity and format compliance for email processing
 */
export const validateAttachments = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const attachments: IEmailAttachment[] = req.body.attachments || [];

    if (!Array.isArray(attachments)) {
      res.status(400).json({
        success: false,
        message: 'Attachments must be provided as an array'
      });
      return;
    }

    const validationErrors: Array<{
      attachment: string;
      error: string;
    }> = [];

    attachments.forEach((attachment, index) => {
      // Validate file size
      if (attachment.size > MAX_ATTACHMENT_SIZE) {
        validationErrors.push({
          attachment: attachment.filename,
          error: `File size exceeds maximum allowed size of ${MAX_ATTACHMENT_SIZE} bytes`
        });
      }

      // Validate content type
      if (!ALLOWED_CONTENT_TYPES.includes(attachment.contentType)) {
        validationErrors.push({
          attachment: attachment.filename,
          error: `Invalid content type. Allowed types: ${ALLOWED_CONTENT_TYPES.join(', ')}`
        });
      }

      // Validate attachment type
      if (!Object.values(AttachmentType).includes(attachment.type)) {
        validationErrors.push({
          attachment: attachment.filename,
          error: `Invalid attachment type. Allowed types: ${Object.values(AttachmentType).join(', ')}`
        });
      }
    });

    if (validationErrors.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Attachment validation failed',
        errors: validationErrors
      });
      return;
    }

    next();
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Internal server error during attachment validation',
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};