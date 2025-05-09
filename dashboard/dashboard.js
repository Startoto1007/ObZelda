// Script pour le tableau de bord de OB Zelda

document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si l'utilisateur est connecté
    if (!checkAuth()) {
        window.location.href = 'index.html';
        return;
    }
    
    // Récupérer les données utilisateur stockées
    const userData = JSON.parse(localStorage.getItem('user_data'));
    
    if (!userData) {
        console.error('Aucune donnée utilisateur disponible');
        logout();
        return;
    }
    
    // Mettre à jour l'interface avec les informations de l'utilisateur
    updateUserInterface(userData);
    
    // Gérer le bouton de déconnexion
    document.querySelector('.logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
    
    // Gérer le formulaire de changement de pseudo
    const changeUsernameForm = document.querySelector('.change-username form');
    if (changeUsernameForm) {
        changeUsernameForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const newUsername = document.getElementById('new-username').value.trim();
            if (newUsername) {
                // Dans un cas réel, on enverrait cette information à un backend
                // Ici, on simule simplement une mise à jour locale
                updateVerifiedName(newUsername);
                document.getElementById('new-username').value = '';
                
                // Afficher un message de confirmation (à implémenter)
                alert('Pseudo vérifié mis à jour avec succès !');
            }
        });
    }
});

// Mettre à jour l'interface utilisateur avec les données Discord
function updateUserInterface(userData) {
    // Avatar de l'utilisateur
    const avatarUrl = getAvatarUrl(userData);
    document.querySelectorAll('.user-avatar, .profile-avatar').forEach(img => {
        img.src = avatarUrl;
        img.alt = `Avatar de ${userData.username}`;
    });
    
    // Nom d'utilisateur
    document.querySelector('.username').textContent = userData.username;
    document.querySelector('.profile-name').textContent = userData.username;
    
    // ID Discord
    document.querySelector('.discord-id').textContent = `ID: ${userData.id}`;
    
    // Date de création du compte
    // Convertir le snowflake Discord en timestamp
    const accountCreatedDate = new Date(getTimestampFromSnowflake(userData.id));
    document.querySelector('[class*="info-value"]:nth-of-type(1)').textContent = 
        accountCreatedDate.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    
    // Date de rejoindre le serveur (simulée)
    // Dans un cas réel, cette information viendrait du backend
    const randomJoinDate = new Date();
    randomJoinDate.setMonth(randomJoinDate.getMonth() - Math.floor(Math.random() * 12));
    document.querySelector('[class*="info-value"]:nth-of-type(2)').textContent = 
        randomJoinDate.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    
    // Pseudo vérifié (par défaut, utilisez le pseudo Discord)
    updateVerifiedName(userData.username);
}

// Mettre à jour le pseudo vérifié affiché
function updateVerifiedName(name) {
    const verifiedNameElement = document.querySelector('.verified-name');
    if (verifiedNameElement) {
        // Garder le badge de vérification
        const badge = verifiedNameElement.querySelector('.verified-badge');
        verifiedNameElement.textContent = name + ' ';
        verifiedNameElement.appendChild(badge);
    }
}

// Convertir un ID snowflake Discord en timestamp
function getTimestampFromSnowflake(snowflake) {
    return Number(BigInt(snowflake) >> 22n) + 1420070400000;
}

// Fonction de déconnexion
function logout() {
    localStorage.removeItem('discord_access_token');
    localStorage.removeItem('token_expires');
    localStorage.removeItem('user_data');
    
    // Redirection vers la page d'accueil
    window.location.href = 'index.html';
}

// Vérifier l'authentification
function checkAuth() {
    const accessToken = localStorage.getItem('discord_access_token');
    const tokenExpires = localStorage.getItem('token_expires');
    
    // Si le token existe et est valide
    if (accessToken && tokenExpires && Date.now() < parseInt(tokenExpires)) {
        return true;
    }
    
    return false;
}

// Obtenir l'URL de l'avatar Discord
function getAvatarUrl(user) {
    if (!user.avatar) {
        // Avatar par défaut si l'utilisateur n'en a pas
        return 'https://res.cloudinary.com/dor9octmp/image/upload/v1745145521/Logo_discord_uj0p2v.png';
    }
    
    const format = user.avatar.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${format}`;
}
