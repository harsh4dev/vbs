const { User } = require('../../models');

// Invokable-style controller (like Laravel's __invoke)
exports.verifyEmail = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.redirect('/login');
        }

        // If already verified, redirect with query param
        if (user.emailVerified) {
            return res.redirect('/dashboard?verified=1');
        }

        // Mark email as verified
        user.emailVerified = true;
        await user.save();

        // Optionally: Emit an event or log it
        // eventEmitter.emit('emailVerified', user);

        return res.redirect('/dashboard?verified=1');
    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(500).send('Internal Server Error');
    }
};
