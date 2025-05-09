// auth.js - Système d'authentification Discord pour OB Zelda
// Configuration OAuth2 Discord
const CLIENT_ID = '1357762980497981731';
const REDIRECT_URI = 'https://startoto1007.github.io/ObZelda/callback.html';
const DISCORD_API = 'https://discord.com/api/v10';

// Générer l'URL d'authentification Discord
function getAuthUrl() {
    const scope = 'identify guilds';
    return `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=${scope}`;
}

// Vérifier si l'utilisateur est déjà connecté
function checkAuth() {
    const accessToken = localStorage.getItem('discord_access_token');
    const tokenExpires = localStorage.getItem('token_expires');
    
    // Si le token existe et est valide
    if (accessToken && tokenExpires && Date.now() < parseInt(tokenExpires)) {
        return true;
    }
    
    // Si le token est expiré, on le supprime
    if (accessToken && tokenExpires && Date.now() >= parseInt(tokenExpires)) {
        logout();
    }
    
    return false;
}

// Récupérer les informations de l'utilisateur depuis l'API Discord
async function fetchUserInfo() {
    const accessToken = localStorage.getItem('discord_access_token');
    
    if (!accessToken) {
        console.error('Aucun token d\'accès disponible');
        return null;
    }
    
    try {
        const response = await fetch(`${DISCORD_API}/users/@me`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erreur API Discord: ${response.status}`);
        }
        
        const userData = await response.json();
        localStorage.setItem('user_data', JSON.stringify(userData));
        return userData;
    } catch (error) {
        console.error('Erreur lors de la récupération des informations utilisateur:', error);
        return null;
    }
}

// Récupérer les guildes (serveurs) de l'utilisateur
async function fetchUserGuilds() {
    const accessToken = localStorage.getItem('discord_access_token');
    
    if (!accessToken) {
        console.error('Aucun token d\'accès disponible');
        return null;
    }
    
    try {
        const response = await fetch(`${DISCORD_API}/users/@me/guilds`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erreur API Discord: ${response.status}`);
        }
        
        const guildsData = await response.json();
        return guildsData;
    } catch (error) {
        console.error('Erreur lors de la récupération des serveurs:', error);
        return null;
    }
}

// Déconnexion de l'utilisateur
function logout() {
    localStorage.removeItem('discord_access_token');
    localStorage.removeItem('token_expires');
    localStorage.removeItem('user_data');
    
    // Redirection vers la page d'accueil
    window.location.href = 'index.html';
}

// Rediriger vers la page de dashboard si l'utilisateur est connecté
function redirectIfLoggedIn() {
    if (checkAuth()) {
        window.location.href = 'dashboard.html';
    }
}

// Rediriger vers la page d'accueil si l'utilisateur n'est pas connecté
function redirectIfNotLoggedIn() {
    if (!checkAuth()) {
        window.location.href = 'index.html';
    }
}

// Charger les informations utilisateur dans le dashboard
async function loadUserDashboard() {
    // Vérifier si l'utilisateur est connecté
    if (!checkAuth()) {
        window.location.href = 'index.html';
        return;
    }
    
    // Récupérer les données utilisateur stockées ou les fetchier à nouveau
    let userData = JSON.parse(localStorage.getItem('user_data'));
    if (!userData) {
        userData = await fetchUserInfo();
        if (!userData) {
            logout();
            return;
        }
    }
    
    // Mettre à jour les éléments du DOM avec les données utilisateur
    const avatarUrl = getAvatarUrl(userData);
    
    // Mettre à jour l'avatar et le nom d'utilisateur dans le header
    document.querySelectorAll('.user-avatar').forEach(el => {
        el.src = avatarUrl;
        el.alt = `Avatar de ${userData.username}`;
    });
    
    document.querySelectorAll('.username').forEach(el => {
        el.textContent = userData.username;
    });
    
    // Mettre à jour les informations du profil
    document.querySelectorAll('.profile-name').forEach(el => {
        el.textContent = userData.username;
    });
    
    document.querySelectorAll('.discord-id').forEach(el => {
        el.textContent = `ID: ${userData.id}`;
    });
    
    // Ajouter la date de création du compte (formater le snowflake Discord)
    const creationTimestamp = getCreationDateFromDiscordId(userData.id);
    document.querySelectorAll('[data-field="account_created_date"]').forEach(el => {
        el.textContent = formatDate(creationTimestamp);
    });
    
    // Ajouter le tag Discord
    document.querySelectorAll('[data-field="verified_name"]').forEach(el => {
        el.textContent = userData.username + (userData.discriminator !== '0' ? `#${userData.discriminator}` : '');
    });
    
    // Mettre à jour les autres champs avec des valeurs par défaut pour la démo
    document.querySelectorAll('[data-field="server_join_date"]').forEach(el => {
        el.textContent = formatDate(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 jours avant maintenant par défaut
    });
    
    // Attacher l'événement de déconnexion
    document.querySelectorAll('.logout-btn').forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            logout();
        });
    });
}

// Utilitaires
// Obtenir l'URL de l'avatar Discord
function getAvatarUrl(user) {
    if (!user || !user.avatar) {
        // Avatar par défaut si l'utilisateur n'en a pas
        return 'https://res.cloudinary.com/dor9octmp/image/upload/v1745145521/Logo_discord_uj0p2v.png';
    }
    
    const format = user.avatar.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${format}`;
}

// Formatage de date
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Calculer la date de création à partir d'un ID Discord (snowflake)
function getCreationDateFromDiscordId(id) {
    // Discord epoch (2015-01-01)
    const DISCORD_EPOCH = 1420070400000;
    
    // Convertir l'identifiant en binaire et obtenir les 42 premiers bits
    const binary = BigInt(id).toString(2);
    const timestamp = parseInt(binary.padStart(64, '0').slice(0, 42), 2);
    
    // Convertir en milliseconde et ajouter l'epoch Discord
    return Number(timestamp) + DISCORD_EPOCH;
}
