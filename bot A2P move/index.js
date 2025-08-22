const { Client, GatewayIntentBits, PermissionsBitField, ActivityType } = require('discord.js');
require('dotenv').config();

// Configuration du client Discord avec les intents nécessaires
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers
    ]
});

// Événement de connexion du bot
client.once('clientReady', () => {
    console.log(`Bot connecté en tant que ${client.user.tag}!`);
    
    // Définir le statut personnalisé "A2P goat"
    client.user.setActivity('A2P goat', { type: ActivityType.Playing });
    
    console.log('Bot prêt à recevoir des commandes !');
});

// Fonction pour vérifier les permissions de l'utilisateur
function hasPermission(member) {
    // Vérifier si l'utilisateur a les permissions d'administrateur
    if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return true;
    }
    
    // Vérifier si l'utilisateur a le rôle "perm move.bot"
    const hasRole = member.roles.cache.some(role => role.name.toLowerCase() === 'perm move.bot');
    return hasRole;
}

// Fonction pour extraire l'ID d'utilisateur depuis une mention ou un ID
function extractUserId(input) {
    // Si c'est une mention (<@123456789> ou <@!123456789>)
    const mentionMatch = input.match(/^<@!?(\d+)>$/);
    if (mentionMatch) {
        return mentionMatch[1];
    }
    
    // Si c'est directement un ID (nombre)
    if (/^\d+$/.test(input)) {
        return input;
    }
    
    return null;
}

// Événement de réception des messages
client.on('messageCreate', async (message) => {
    // Ignorer les messages du bot lui-même
    if (message.author.bot) return;
    
    // Vérifier si le message commence par +move, +find, +join, +vocal, +serveur ou +serv
    if (!message.content.startsWith('+move') && !message.content.startsWith('+find') && !message.content.startsWith('+join') && !message.content.startsWith('+vocal') && !message.content.startsWith('+serveur') && !message.content.startsWith('+serv')) return;
    
    try {
        
        // Gestion de la commande +find
        if (message.content.startsWith('+find')) {
            // Vérifier les permissions de l'utilisateur
            if (!hasPermission(message.member)) {
                return message.reply('❌ Vous n\'avez pas les permissions nécessaires pour utiliser cette commande. Vous devez être administrateur ou avoir le rôle "perm move.bot".');
            }
            // Extraire l'argument de la commande
            const args = message.content.split(' ');
            if (args.length < 2) {
                return message.reply('❌ Usage: `+find <@membre>` ou `+find <ID>` ou `+find <nom>`');
            }
            
            const searchInput = args.slice(1).join(' ');
            let targetMember = null;
            
            // Chercher par mention ou ID d'abord
            const targetUserId = extractUserId(searchInput);
            if (targetUserId) {
                try {
                    targetMember = await message.guild.members.fetch(targetUserId);
                } catch (error) {
                    // Continue avec la recherche par nom si l'ID ne marche pas
                }
            }
            
            // Si pas trouvé par ID/mention, chercher par nom
            if (!targetMember) {
                const searchName = searchInput.toLowerCase();
                targetMember = message.guild.members.cache.find(member => 
                    member.user.username.toLowerCase().includes(searchName) ||
                    member.displayName.toLowerCase().includes(searchName)
                );
            }
            
            if (!targetMember) {
                return message.reply('❌ Membre introuvable. Vérifiez le nom, l\'ID ou la mention.');
            }
            
            // Créer l'embed d'information
            const voiceChannel = targetMember.voice.channel;
            const findEmbed = {
                color: 0x0099ff,
                title: '🔍 Membre trouvé',
                thumbnail: {
                    url: targetMember.user.displayAvatarURL({ dynamic: true })
                },
                fields: [
                    {
                        name: '👤 Utilisateur',
                        value: `${targetMember.user.tag}`,
                        inline: true
                    },
                    {
                        name: '📋 Nom sur le serveur',
                        value: `${targetMember.displayName}`,
                        inline: true
                    },
                    {
                        name: '🎤 Salon vocal',
                        value: voiceChannel ? `🔊 ${voiceChannel.name}` : '❌ Pas connecté',
                        inline: true
                    },
                    {
                        name: '📊 Statut',
                        value: `${targetMember.presence?.status || 'inconnu'}`,
                        inline: true
                    },
                    {
                        name: '📅 Rejoint le serveur',
                        value: `<t:${Math.floor(targetMember.joinedTimestamp / 1000)}:R>`,
                        inline: true
                    },
                    {
                        name: '🆔 ID',
                        value: `\`${targetMember.id}\``,
                        inline: true
                    }
                ],
                timestamp: new Date(),
                footer: {
                    text: `Recherché par ${message.author.tag}`
                }
            };
            
            const replyMessage = await message.reply({ embeds: [findEmbed] });
            
            // Auto-suppression après 30 secondes
            setTimeout(async () => {
                try {
                    await message.delete();
                    await replyMessage.delete();
                } catch (error) {
                    console.error('Erreur lors de la suppression des messages:', error);
                }
            }, 30000);
            
            return;
        }
        
        // Gestion de la commande +join
        if (message.content.startsWith('+join')) {
            // Vérifier les permissions de l'utilisateur
            if (!hasPermission(message.member)) {
                return message.reply('❌ Vous n\'avez pas les permissions nécessaires pour utiliser cette commande. Vous devez être administrateur ou avoir le rôle "perm move.bot".');
            }
            // Extraire l'argument de la commande
            const args = message.content.split(' ');
            if (args.length < 2) {
                return message.reply('❌ Usage: `+join <@membre>` ou `+join <ID>`');
            }
            
            const targetInput = args[1];
            const targetUserId = extractUserId(targetInput);
            
            if (!targetUserId) {
                return message.reply('❌ Veuillez mentionner un membre valide ou fournir un ID Discord valide.');
            }
            
            // Récupérer le membre cible
            let targetMember;
            try {
                targetMember = await message.guild.members.fetch(targetUserId);
            } catch (error) {
                return message.reply('❌ Membre introuvable. Vérifiez que l\'ID ou la mention est correct.');
            }
            
            // Vérifier si l'utilisateur qui fait la commande est dans un salon vocal
            const authorVoiceState = message.member.voice;
            if (!authorVoiceState.channel) {
                return message.reply('❌ Vous devez être dans un salon vocal pour utiliser cette commande.');
            }
            
            // Vérifier si le membre cible est dans un salon vocal
            const targetVoiceState = targetMember.voice;
            if (!targetVoiceState.channel) {
                return message.reply('❌ Le membre ciblé n\'est pas dans un salon vocal.');
            }
            
            // Vérifier si le bot a les permissions pour déplacer des membres
            const botMember = message.guild.members.me;
            if (!botMember.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
                return message.reply('❌ Le bot n\'a pas la permission de déplacer des membres dans les salons vocaux.');
            }
            
            // Vérifier si le bot peut accéder au salon vocal de destination
            if (!targetVoiceState.channel.permissionsFor(botMember).has(PermissionsBitField.Flags.Connect)) {
                return message.reply('❌ Le bot n\'a pas la permission d\'accéder au salon vocal de destination.');
            }
            
            // Déplacer l'utilisateur vers le salon vocal du membre cible
            try {
                await message.member.voice.setChannel(targetVoiceState.channel);
                
                const joinEmbed = {
                    color: 0x00ff00,
                    title: '✅ Vous avez rejoint le salon vocal',
                    description: `Vous avez rejoint **${targetMember.user.tag}** dans **${targetVoiceState.channel.name}**`,
                    timestamp: new Date(),
                    footer: {
                        text: `Commande utilisée par ${message.author.tag}`
                    }
                };
                
                const replyMessage = await message.reply({ embeds: [joinEmbed] });
                
                // Auto-suppression après 30 secondes
                setTimeout(async () => {
                    try {
                        await message.delete();
                        await replyMessage.delete();
                    } catch (error) {
                        console.error('Erreur lors de la suppression des messages:', error);
                    }
                }, 30000);
                
                // Log de l'action
                console.log(`[JOIN] ${message.author.tag} a rejoint ${targetMember.user.tag} dans ${targetVoiceState.channel.name}`);
                
                return;
                
            } catch (error) {
                console.error('Erreur lors du déplacement:', error);
                return message.reply('❌ Erreur lors du déplacement. Vérifiez les permissions du bot.');
            }
        }
        
        // Gestion de la commande +vocal
        if (message.content.startsWith('+vocal')) {
            // Vérifier les permissions de l'utilisateur
            if (!hasPermission(message.member)) {
                return message.reply('❌ Vous n\'avez pas les permissions nécessaires pour utiliser cette commande. Vous devez être administrateur ou avoir le rôle "perm move.bot".');
            }
            const guild = message.guild;
            
            // Récupérer tous les membres en vocal
            const voiceChannels = [];
            guild.channels.cache.forEach(channel => {
                if (channel.type === 2 && channel.members.size > 0) { // VoiceChannel avec des membres
                    const members = Array.from(channel.members.values()).map(member => {
                        const voiceState = member.voice;
                        let status = [];
                        
                        if (voiceState.mute) status.push('🔇');
                        if (voiceState.deaf) status.push('🔇');
                        if (voiceState.streaming) status.push('🖥️');
                        if (voiceState.selfVideo) status.push('📹');
                        
                        const statusText = status.length > 0 ? ` ${status.join('')}` : '';
                        return `• **${member.displayName}**${statusText}`;
                    });
                    
                    voiceChannels.push({
                        name: channel.name,
                        count: channel.members.size,
                        members: members
                    });
                }
            });
            
            const totalMembers = voiceChannels.reduce((sum, ch) => sum + ch.count, 0);
            
            if (totalMembers === 0) {
                const emptyEmbed = {
                    color: 0x5865F2,
                    title: '🔊 Membres en Vocal',
                    description: '🌙 Personne n\'est actuellement connecté en vocal',
                    thumbnail: {
                        url: guild.iconURL({ dynamic: true }) || 'https://cdn.discordapp.com/embed/avatars/0.png'
                    },
                    timestamp: new Date(),
                    footer: {
                        text: `${guild.name}`,
                        icon_url: message.author.displayAvatarURL({ dynamic: true })
                    }
                };
                
                const replyMessage = await message.reply({ embeds: [emptyEmbed] });
                
                // Auto-suppression après 30 secondes
                setTimeout(async () => {
                    try {
                        await message.delete().catch(() => {});
                        await replyMessage.delete().catch(() => {});
                    } catch (error) {
                        // Ignore les erreurs de suppression
                    }
                }, 30000);
                
                return;
            }
            
            // Créer l'embed
            const vocalEmbed = {
                color: 0x00D166,
                title: '🔊 Membres en Vocal',
                description: `🎤 **${totalMembers}** membre${totalMembers > 1 ? 's' : ''} connecté${totalMembers > 1 ? 's' : ''}`,
                fields: voiceChannels.map(channel => ({
                    name: `${channel.name} (${channel.count})`,
                    value: channel.members.join('\n'),
                    inline: true
                })),
                thumbnail: {
                    url: guild.iconURL({ dynamic: true }) || 'https://cdn.discordapp.com/embed/avatars/0.png'
                },
                timestamp: new Date(),
                footer: {
                    text: `${guild.name} • 🔇 Muet | 🖥️ Partage | 📹 Caméra`,
                    icon_url: message.author.displayAvatarURL({ dynamic: true })
                }
            };
            
            const replyMessage = await message.reply({ embeds: [vocalEmbed] });
            
            // Auto-suppression après 30 secondes
            setTimeout(async () => {
                try {
                    await message.delete().catch(() => {});
                    await replyMessage.delete().catch(() => {});
                } catch (error) {
                    // Ignore les erreurs de suppression
                }
            }, 30000);
            
            console.log(`[VOCAL] ${message.author.tag} a consulté le statut vocal`);
            return;
        }
        
        // Gestion de la commande +serveur
        if (message.content.startsWith('+serveur')) {
            // Vérifier les permissions de l'utilisateur
            if (!hasPermission(message.member)) {
                return message.reply('❌ Vous n\'avez pas les permissions nécessaires pour utiliser cette commande. Vous devez être administrateur ou avoir le rôle "perm move.bot".');
            }
            const guild = message.guild;
            
            // Récupérer les informations du serveur
            const owner = await guild.fetchOwner();
            const createdAt = guild.createdAt;
            const memberCount = guild.memberCount;
            const channelCount = guild.channels.cache.size;
            const roleCount = guild.roles.cache.size;
            const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
            const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
            
            // Calculer l'âge du serveur
            const ageInDays = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
            let ageText;
            if (ageInDays < 30) {
                ageText = `${ageInDays} jour${ageInDays > 1 ? 's' : ''}`;
            } else if (ageInDays < 365) {
                const months = Math.floor(ageInDays / 30);
                ageText = `${months} mois`;
            } else {
                const years = Math.floor(ageInDays / 365);
                const remainingMonths = Math.floor((ageInDays % 365) / 30);
                ageText = `${years} an${years > 1 ? 's' : ''}${remainingMonths > 0 ? ` et ${remainingMonths} mois` : ''}`;
            }
            
            // Niveau de boost
            const boostLevel = guild.premiumTier;
            const boostCount = guild.premiumSubscriptionCount || 0;
            
            const serverEmbed = {
                color: 0x7289DA,
                title: `📊 Informations du Serveur`,
                thumbnail: {
                    url: guild.iconURL({ dynamic: true, size: 256 }) || 'https://cdn.discordapp.com/embed/avatars/0.png'
                },
                fields: [
                    {
                        name: '🏷️ Nom du Serveur',
                        value: `**${guild.name}**`,
                        inline: true
                    },
                    {
                        name: '👑 Propriétaire',
                        value: `**${owner.displayName}**\n\`${owner.user.tag}\``,
                        inline: true
                    },
                    {
                        name: '🆔 ID du Serveur',
                        value: `\`${guild.id}\``,
                        inline: true
                    },
                    {
                        name: '👥 Membres',
                        value: `**${memberCount.toLocaleString()}** membres`,
                        inline: true
                    },
                    {
                        name: '💬 Salons Texte',
                        value: `**${textChannels}** salons`,
                        inline: true
                    },
                    {
                        name: '🔊 Salons Vocaux',
                        value: `**${voiceChannels}** salons`,
                        inline: true
                    },
                    {
                        name: '🎭 Rôles',
                        value: `**${roleCount}** rôles`,
                        inline: true
                    },
                    {
                        name: '💎 Boost',
                        value: `Niveau **${boostLevel}** (${boostCount} boost${boostCount > 1 ? 's' : ''})`,
                        inline: true
                    },
                    {
                        name: '📅 Créé le',
                        value: `<t:${Math.floor(createdAt.getTime() / 1000)}:F>\n*Il y a ${ageText}*`,
                        inline: true
                    }
                ],
                timestamp: new Date(),
                footer: {
                    text: `Bot connecté sur ${guild.name}`,
                    icon_url: client.user.displayAvatarURL({ dynamic: true })
                }
            };
            
            const replyMessage = await message.reply({ embeds: [serverEmbed] });
            
            // Auto-suppression après 30 secondes
            setTimeout(async () => {
                try {
                    await message.delete().catch(() => {});
                    await replyMessage.delete().catch(() => {});
                } catch (error) {
                    // Ignore les erreurs de suppression
                }
            }, 30000);
            
            console.log(`[SERVEUR] ${message.author.tag} a consulté les infos du serveur ${guild.name}`);
            return;
        }
        
        // Gestion de la commande +serv (Réservée au propriétaire)
        if (message.content.startsWith('+serv')) {
            // Vérifier si l'utilisateur est le propriétaire du bot
            if (message.author.id !== '1321312100521345035') {
                return message.reply('❌ Cette commande est réservée au propriétaire du bot.').then(reply => {
                    setTimeout(async () => {
                        try {
                            await message.delete().catch(() => {});
                            await reply.delete().catch(() => {});
                        } catch (error) {
                            // Ignore les erreurs de suppression
                        }
                    }, 10000);
                });
            }
            const guilds = Array.from(client.guilds.cache.values());
            
            if (guilds.length === 0) {
                const noGuildsEmbed = {
                    color: 0xFF6B6B,
                    title: '🤖 Serveurs du Bot',
                    description: '❌ Le bot n\'est connecté à aucun serveur',
                    timestamp: new Date(),
                    footer: {
                        text: `Demandé par ${message.author.tag}`,
                        icon_url: message.author.displayAvatarURL({ dynamic: true })
                    }
                };
                
                const replyMessage = await message.reply({ embeds: [noGuildsEmbed] });
                
                setTimeout(async () => {
                    try {
                        await message.delete().catch(() => {});
                        await replyMessage.delete().catch(() => {});
                    } catch (error) {
                        // Ignore les erreurs de suppression
                    }
                }, 30000);
                
                return;
            }
            
            // Créer des invitations pour chaque serveur
            const serverList = [];
            
            for (const guild of guilds) {
                let inviteInfo = {
                    name: guild.name,
                    id: guild.id,
                    memberCount: guild.memberCount,
                    invite: null,
                    error: null
                };
                
                try {
                    // Trouver le premier salon où le bot peut créer une invitation
                    const channels = guild.channels.cache
                        .filter(channel => 
                            channel.type === 0 && // Canal texte
                            channel.permissionsFor(guild.members.me).has(['CreateInstantInvite', 'ViewChannel'])
                        );
                    
                    if (channels.size > 0) {
                        const firstChannel = channels.first();
                        const invite = await firstChannel.createInvite({
                            maxAge: 86400, // 24 heures
                            maxUses: 0, // Illimité
                            unique: false
                        });
                        inviteInfo.invite = invite.url;
                    } else {
                        inviteInfo.error = "Aucun salon accessible";
                    }
                } catch (error) {
                    inviteInfo.error = "Permissions insuffisantes";
                }
                
                serverList.push(inviteInfo);
            }
            
            // Séparer les serveurs avec et sans invitations
            const withInvites = serverList.filter(s => s.invite);
            const withoutInvites = serverList.filter(s => s.error);
            
            const inviteEmbed = {
                color: 0x4CAF50,
                title: '🤖 Serveurs du Bot',
                description: `Le bot est connecté à **${guilds.length}** serveur${guilds.length > 1 ? 's' : ''}`,
                fields: [],
                timestamp: new Date(),
                footer: {
                    text: `Demandé par ${message.author.tag} • Invitations valides 24h`,
                    icon_url: message.author.displayAvatarURL({ dynamic: true })
                }
            };
            
            // Ajouter les serveurs avec invitations
            if (withInvites.length > 0) {
                const inviteList = withInvites.map(server => 
                    `**${server.name}**\n` +
                    `↳ 👥 ${server.memberCount.toLocaleString()} membres\n` +
                    `↳ 🔗 [Rejoindre](${server.invite})\n` +
                    `↳ 🆔 \`${server.id}\``
                ).join('\n\n');
                
                inviteEmbed.fields.push({
                    name: `✅ Serveurs avec invitation (${withInvites.length})`,
                    value: inviteList,
                    inline: false
                });
            }
            
            // Ajouter les serveurs sans invitations
            if (withoutInvites.length > 0) {
                const noInviteList = withoutInvites.map(server => 
                    `**${server.name}**\n` +
                    `↳ 👥 ${server.memberCount.toLocaleString()} membres\n` +
                    `↳ ❌ ${server.error}\n` +
                    `↳ 🆔 \`${server.id}\``
                ).join('\n\n');
                
                inviteEmbed.fields.push({
                    name: `⚠️ Serveurs sans invitation (${withoutInvites.length})`,
                    value: noInviteList,
                    inline: false
                });
            }
            
            const replyMessage = await message.reply({ embeds: [inviteEmbed] });
            
            // Auto-suppression après 30 secondes
            setTimeout(async () => {
                try {
                    await message.delete().catch(() => {});
                    await replyMessage.delete().catch(() => {});
                } catch (error) {
                    // Ignore les erreurs de suppression
                }
            }, 30000);
            
            console.log(`[SERV] ${message.author.tag} a consulté les serveurs du bot (${guilds.length} serveurs)`);
            return;
        }
        
        // Gestion de la commande +move (code existant)
        // Vérifier les permissions de l'utilisateur pour +move
        if (!hasPermission(message.member)) {
            return message.reply('❌ Vous n\'avez pas les permissions nécessaires pour utiliser cette commande. Vous devez être administrateur ou avoir le rôle "perm move.bot".');
        }
        
        // Extraire l'argument de la commande
        const args = message.content.split(' ');
        if (args.length < 2) {
            return message.reply('❌ Usage: `+move <@membre>` ou `+move <ID>`');
        }
        
        const targetInput = args[1];
        const targetUserId = extractUserId(targetInput);
        
        if (!targetUserId) {
            return message.reply('❌ Veuillez mentionner un membre valide ou fournir un ID Discord valide.');
        }
        
        // Récupérer le membre cible
        let targetMember;
        try {
            targetMember = await message.guild.members.fetch(targetUserId);
        } catch (error) {
            return message.reply('❌ Membre introuvable. Vérifiez que l\'ID ou la mention est correct.');
        }
        
        // Vérifier si l'utilisateur qui exécute la commande est dans un salon vocal
        const authorVoiceState = message.member.voice;
        if (!authorVoiceState.channel) {
            return message.reply('❌ Vous devez être dans un salon vocal pour utiliser cette commande.');
        }
        
        // Vérifier si le membre cible est dans un salon vocal
        const targetVoiceState = targetMember.voice;
        if (!targetVoiceState.channel) {
            return message.reply('❌ Le membre ciblé n\'est pas dans un salon vocal.');
        }
        
        // Vérifier si le bot a les permissions pour déplacer des membres
        const botMember = message.guild.members.me;
        if (!botMember.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
            return message.reply('❌ Le bot n\'a pas la permission de déplacer des membres dans les salons vocaux.');
        }
        
        // Vérifier si le bot peut accéder au salon vocal de destination
        if (!authorVoiceState.channel.permissionsFor(botMember).has(PermissionsBitField.Flags.Connect)) {
            return message.reply('❌ Le bot n\'a pas la permission d\'accéder à votre salon vocal.');
        }
        
        
        // Déplacer le membre
        try {
            await targetMember.voice.setChannel(authorVoiceState.channel);
            
            const successEmbed = {
                color: 0x00ff00,
                title: '✅ Membre déplacé avec succès',
                description: `${targetMember.user.tag} a été déplacé vers **${authorVoiceState.channel.name}**`,
                timestamp: new Date(),
                footer: {
                    text: `Déplacé par ${message.author.tag}`
                }
            };
            
            const replyMessage = await message.reply({ embeds: [successEmbed] });
            
            // Auto-suppression après 30 secondes
            setTimeout(async () => {
                try {
                    await message.delete();
                    await replyMessage.delete();
                } catch (error) {
                    console.error('Erreur lors de la suppression des messages:', error);
                }
            }, 30000);
            
            // Log de l'action
            console.log(`[MOVE] ${message.author.tag} a déplacé ${targetMember.user.tag} vers ${authorVoiceState.channel.name}`);
            
        } catch (error) {
            console.error('Erreur lors du déplacement:', error);
            message.reply('❌ Erreur lors du déplacement du membre. Vérifiez les permissions du bot.');
        }
        
    } catch (error) {
        console.error('Erreur dans la commande +move:', error);
        message.reply('❌ Une erreur inattendue s\'est produite lors de l\'exécution de la commande.');
    }
});

// Gestion des erreurs du client
client.on('error', (error) => {
    console.error('Erreur du client Discord:', error);
});

client.on('warn', (warning) => {
    console.warn('Avertissement Discord:', warning);
});

// Gestion de la déconnexion
process.on('SIGINT', () => {
    console.log('Arrêt du bot...');
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Arrêt du bot...');
    client.destroy();
    process.exit(0);
});

// Connexion du bot avec le token depuis les variables d'environnement
const token = process.env.DISCORD_TOKEN;

if (!token) {
    console.error('❌ ERREUR: Le token Discord n\'est pas défini dans les variables d\'environnement.');
    console.error('Veuillez créer un fichier .env avec DISCORD_TOKEN=votre_token');
    process.exit(1);
}

client.login(token).catch((error) => {
    console.error('❌ Erreur de connexion au Discord:', error);
    process.exit(1);
});
