import express from 'express';
import auth from '../middleware/auth.js';
import {
  sendMessage,
  getMessages,
  getLatestMessages
} from '../Controllers/messageController.js';

const router = express.Router();

/**
 * POST /api/messages/
 * @desc Send a message to a group
 * @access Private (auth)
 */
router.post('/', auth, sendMessage);

/**
 * GET /api/messages/:groupId
 * @desc Get all decrypted messages of a group
 * @access Private (auth)
 */
router.get('/:groupId', auth, getMessages);

/**
 * GET /api/messages/:groupId/latest?limit=20
 * @desc Get the latest X messages of a group (default 10 if not specified)
 * @access Private (auth)
 */
router.get('/:groupId/latest', auth, getLatestMessages);

export default router;
