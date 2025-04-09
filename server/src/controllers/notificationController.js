const Approval = require("../models/PendingApproval");
const { sendApprovalEmail } = require("../config/email");

exports.checkPendingApprovals = async () => {
  try {
    const pendingApprovals = await Approval.find({ status: "pending" });

    if (pendingApprovals.length > 0) {
      await sendApprovalEmail(
        "noreply@approauto.com",
        "ouday.oueslati@esprit.tn",
        "Rappel quotidien : Demandes en attente",
        "Suivi automatique des demandes",
        `Bonjour,<br><br>Il reste actuellement <strong>${pendingApprovals.length}</strong> demande(s) d'approbation en attente.<br><br>Merci de consulter la plateforme pour les traiter.`,
        "https://monapp.com/admin/approvals",
        "Voir les demandes"
      );
      console.log("📧 Email de rappel professionnel envoyé.");
    }
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi du rappel automatique :", error);
  }
};
