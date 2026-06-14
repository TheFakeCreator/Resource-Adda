"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o)
            if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const WellbeingPostSchema = new mongoose_1.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: ["confession", "question", "support"],
      required: true,
    },
    author: {
      type: mongoose_1.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isAnonymous: { type: Boolean, default: true }, // Posts are anonymous by default for wellbeing
    tags: [{ type: String }],
    mediaUrls: [{ type: String }],
    reactions: [
      {
        type: {
          type: String,
          enum: ["hugs", "relatable", "helpful", "care"],
          required: true,
        },
        user: {
          type: mongoose_1.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
// Virtual for fetching comments
WellbeingPostSchema.virtual("comments", {
  ref: "WellbeingComment",
  localField: "_id",
  foreignField: "post",
  options: { sort: { createdAt: -1 }, limit: 3 }, // Only fetch 3 preview comments by default
});
exports.default = mongoose_1.default.model(
  "WellbeingPost",
  WellbeingPostSchema,
);
