// Fonctions d'authentification pour OB Zelda

// Configuration OAuth2 Discord
const clientId = '1357762980497981731';
const redirectUri = 'https://startoto1007.github.io/ObZelda/callback.html';
const discordApiEndpoint = 'https://discord.com/api/v10';

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
        const response = await fetch(`${discordApiEndpoint}/users/@me`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erreur API Discord: ${response.status}`);
        }
        
        const userData = await response.json();
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
        const response = await fetch(`${discordApiEndpoint}/users/@me/guilds`, {
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

// Formater la date depuis un timestamp Discord
function formatDiscordDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
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
