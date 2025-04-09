const cron = require("node-cron");
const { checkPendingApprovals } = require("./controllers/notificationController");

// Exécuter toutes les 1 minute
cron.schedule("*/1 * * * *", checkPendingApprovals);
