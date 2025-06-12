// Handle Stripe webhook events
const handleStripeWebhook = (req, res) => {
  res.status(200).json({ message: "Stripe webhook received" });
};

module.exports = {
  handleStripeWebhook
}; 