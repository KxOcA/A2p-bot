// Configuration du lien d'invitation Discord
// Remplacez YOUR_BOT_ID par l'ID réel de votre bot

const BOT_ID = 'YOUR_BOT_ID'; // À remplacer par l'ID de votre bot

// Permissions nécessaires pour le bot A2P :
// - Send Messages (2048)
// - Move Members (16777216) 
// - Connect (1048576)
// - View Channels (1024)
// Total: 17825792

const PERMISSIONS = '17825792';

// Fonction pour générer le lien d'invitation
function generateInviteLink(botId = BOT_ID) {
    return `https://discord.com/api/oauth2/authorize?client_id=${botId}&permissions=${PERMISSIONS}&scope=bot`;
}

// Mettre à jour le lien d'invitation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    const inviteButton = document.querySelector('.btn-secondary[href*="oauth2/authorize"]');
    if (inviteButton && BOT_ID !== 'YOUR_BOT_ID') {
        inviteButton.href = generateInviteLink();
    }
});

// Fonction pour configurer l'ID du bot (à utiliser depuis la console)
function setBotId(newBotId) {
    console.log('🤖 Configuration du Bot ID:', newBotId);
    const inviteButton = document.querySelector('.btn-secondary[href*="oauth2/authorize"]');
    if (inviteButton) {
        inviteButton.href = generateInviteLink(newBotId);
        console.log('✅ Lien d\'invitation mis à jour:', inviteButton.href);
    }
}

// Instructions pour l'utilisateur
console.log(`
🔧 Configuration du Bot Discord
================================
Pour configurer le lien d'invitation :

1. Récupérez l'ID de votre bot depuis le portail Discord Developer
2. Utilisez cette commande dans la console :
   setBotId('VOTRE_BOT_ID')

Ou modifiez directement la variable BOT_ID dans ce fichier.

Permissions incluses :
- Envoyer des messages
- Déplacer des membres  
- Se connecter aux salons vocaux
- Voir les salons
`);