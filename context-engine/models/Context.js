const mongoose = require('mongoose');

/**
 * ContextRecord Schema
 * Stores high-signal context extracted from Tavily API & user queries
 */
const ContextRecordSchema = new mongoose.Schema(
  {
    query: {
      type: String,
      required: [true, 'Query string is required'],
      trim: true,
      index: true
    },
    sourceId: {
      type: String,
      required: [true, 'Source ID is required'],
      trim: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    extractedFacts: {
      type: String,
      required: [true, 'Extracted facts text is required'],
      trim: true
    },
    reliabilityScore: {
      type: Number,
      required: [true, 'Reliability score is required'],
      min: [0, 'Reliability score cannot be less than 0'],
      max: [1, 'Reliability score cannot exceed 1.0']
    },
    url: {
      type: String,
      required: [true, 'Source URL is required'],
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true,
    collection: 'context_records'
  }
);

// Create compound index for fast query lookups & source deduplication
ContextRecordSchema.index({ query: 1, sourceId: 1 }, { unique: true });

const ContextRecord = mongoose.model('ContextRecord', ContextRecordSchema);

module.exports = ContextRecord;
