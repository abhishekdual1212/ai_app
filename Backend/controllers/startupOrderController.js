const StartupOrder = require('../models/StartupOrder');
const StartupAnswer = require('../models/StartupAnswer');
const DiyChat = require('../models/DiyChat');
const User = require('../models/User');

const respond = (res, success, message, data = null, status = 200) => {
    return res.status(status).json({ success, message, data });
};

/**
 * @route   POST /api/startup-orders/store
 * @desc    Gathers and stores all startup answers and DIY outcomes for an order_id.
 * @access  Private
 */
exports.storeStartupOrder = async (req, res) => {
    try {
        const { order_id, chat_id } = req.body;

        if (!order_id || !chat_id) {
            return respond(res, false, 'order_id and chat_id are required', null, 400);
        }

        // 1. Fetch Startup Answers by order_id
        const startupAnswerDoc = await StartupAnswer.findOne({ order_id });
        if (!startupAnswerDoc) {
            return respond(res, false, 'Startup answers not found for the given order_id', null, 404);
        }

        // 2. Fetch DIY Chat Outcomes by chat_id
        const diyChatDoc = await DiyChat.findOne({ chat_id });
        if (!diyChatDoc) {
            return respond(res, false, 'DIY chat not found for the given chat_id', null, 404);
        }

        // 3. Find the User's MongoDB _id
        const user = await User.findOne({ firebase_uid: startupAnswerDoc.userId });
        if (!user) {
            return respond(res, false, 'User associated with the order not found', null, 404);
        }

        // 4. Map the outcomes to the new schema structure
        const startupOutcomes = (diyChatDoc.generated_outcomes || []).map(o => ({
             outcomeLabel: o.OutcomeLabel,
             description: o.description, // Assuming description exists
             price: o.price
         }));

        // 5. Use findOneAndUpdate with upsert to create or update the consolidated order
        const startupOrderData = {
            order_id: startupAnswerDoc.order_id,
            userId: startupAnswerDoc.userId,
            user: user._id,
            startupAnswers: startupAnswerDoc.answers || [],
            startupOutcomes: startupOutcomes
        };

        const options = {
            upsert: true, // Create if it doesn't exist
            new: true, // Return the new/updated document
            setDefaultsOnInsert: true
        };

        const savedOrder = await StartupOrder.findOneAndUpdate(
            { order_id: order_id },
            startupOrderData,
            options
        );

        return respond(res, true, 'Startup order data stored successfully', savedOrder, 200);

    } catch (err) {
        console.error('Error in storeStartupOrder:', err);
        return respond(res, false, 'Internal server error', null, 500);
    }
};
