/**
 * @fileoverview Mongoose model and schema definition for email messages
 * @version 1.0.0
 * 
 * Human Tasks:
 * 1. Ensure MongoDB indexes are created during deployment
 * 2. Configure MongoDB connection timeouts and retry settings
 * 3. Set up monitoring for slow queries and index usage
 */

// mongoose v6.9.0
import { Schema, model, Document } from 'mongoose';
import { 
  IEmailMessage,
  IEmailAttachment,
  EmailProcessingStatus,
  AttachmentType
} from '../interfaces/email.interface';

/**
 * @description Schema definition for email attachments
 * @requirement Document Management - AI-powered classification and secure storage of application documents
 */
const EmailAttachmentSchema = new Schema<IEmailAttachment>({
  filename: {
    type: String,
    required: true,
    trim: true
  },
  contentType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true,
    min: 0
  },
  checksum: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: Object.values(AttachmentType),
    required: true
  }
}, { _id: false });

/**
 * @description Schema definition for email messages
 * @requirement Email Processing - Automated monitoring and processing of submissions@dollarfunding.com
 */
const EmailSchema = new Schema<IEmailMessage>({
  messageId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  from: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  receivedDate: {
    type: Date,
    required: true,
    index: true
  },
  processingStatus: {
    type: String,
    enum: Object.values(EmailProcessingStatus),
    required: true,
    default: EmailProcessingStatus.PENDING,
    index: true
  },
  attachments: {
    type: [EmailAttachmentSchema],
    default: [],
    validate: {
      validator: function(attachments: IEmailAttachment[]) {
        return attachments.length <= 20; // Maximum 20 attachments per email
      },
      message: 'Maximum number of attachments exceeded'
    }
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    }
  }
});

// Create compound indexes for common query patterns
EmailSchema.index({ processingStatus: 1, receivedDate: -1 });
EmailSchema.index({ from: 1, receivedDate: -1 });

// Add custom instance methods if needed
EmailSchema.methods.toJSON = function() {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  return obj;
};

// Create and export the model
export const EmailModel = model<IEmailMessage & Document>('Email', EmailSchema);