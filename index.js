const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const PREFIX = "!"; // Komut öneki

client.once('ready', () => {
  console.log(`[+] Bot aktif! Giriş yapıldı: ${client.user.tag}`);
  client.user.setActivity('!yardım yazarak komutları görebilirsin', { type: 3 });
});

// Üye sunucuya katıldığında hoş geldin mesajı
client.on('guildMemberAdd', member => {
  const channel = member.guild.systemChannel;
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('Sunucuya Biri Katıldı!')
    .setDescription(`Aramıza hoş geldin, ${member}! Seninle beraber **${member.guild.memberCount}** kişi olduk. 🎉`)
    .setTimestamp();

  channel.send({ embeds: [embed] });
});

client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;

  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // 1. YARDIM MENÜSÜ
  if (command === 'yardım') {
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🤖 Bot Komut Listesi')
      .setDescription('Aşağıdan tüm komutları görebilirsin:')
      .addFields(
        { name: '🛠️ `!kurulum`', value: 'Sunucudaki her şeyi siler ve sıfırdan profesyonel kanallar kurar (Yönetici ister).', inline: false },
        { name: '🏓 `!ping`', value: 'Botun gecikme süresini gösterir.', inline: false },
        { name: '👤 `!profil`', value: 'Profil bilgilerini gösterir.', inline: false },
        { name: '🗑️ `!temizle [sayı]`', value: 'Mesajları temizler.', inline: false },
        { name: '🔨 `!ban [@kullanıcı]`', value: 'Kullanıcıyı yasaklar.', inline: false },
        { name: '🎲 `!zar`', value: 'Zar atar.', inline: false },
        { name: '⏰ `!saat`', value: 'Güncel saati gösterir.', inline: false }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }

  // 2. OTOMATİK SUNUCU KURULUM SİSTEMİ
  else if (command === 'kurulum') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('❌ Bu komutu kullanmak için **Yönetici** yetkisine sahip olmalısın.');
    }

    await message.reply('⚠️ Sunucu sıfırlanıyor ve yeni kanallar oluşturuluyor, lütfen bekleyin...');

    try {
      // Önce mevcut tüm kanal ve kategorileri sil
      const channels = await message.guild.channels.fetch();
      for (const [, channel] of channels) {
        await channel.delete().catch(() => {});
      }

      // KATEGORİ 1: BİLGİLENDİRME
      const infoCategory = await message.guild.channels.create({
        name: '📌 BİLGİLENDİRME',
        type: ChannelType.GuildCategory,
      });

      await message.guild.channels.create({
        name: '📜-kurallar',
        type: ChannelType.GuildText,
        parent: infoCategory.id,
      });

      await message.guild.channels.create({
        name: '📢-duyurular',
        type: ChannelType.GuildText,
        parent: infoCategory.id,
      });

      await message.guild.channels.create({
        name: '🎉-çekiliş-etkinlik',
        type: ChannelType.GuildText,
        parent: infoCategory.id,
      });

      // KATEGORİ 2: TOPLULUK
      const chatCategory = await message.guild.channels.create({
        name: '💬 TOPLULUK',
        type: ChannelType.GuildCategory,
      });

      await message.guild.channels.create({
        name: '💬-sohbet',
        type: ChannelType.GuildText,
        parent: chatCategory.id,
      });

      await message.guild.channels.create({
        name: '🤖-bot-komut',
        type: ChannelType.GuildText,
        parent: chatCategory.id,
      });

      await message.guild.channels.create({
        name: '📷-medya-foto',
        type: ChannelType.GuildText,
        parent: chatCategory.id,
      });

      await message.guild.channels.create({
        name: '🤖-yapay-zeka-chat',
        type: ChannelType.GuildText,
        parent: chatCategory.id,
      });

      // KATEGORİ 3: SES KANALLARI
      const voiceCategory = await message.guild.channels.create({
        name: '🔊 SES KANALLARI',
        type: ChannelType.GuildCategory,
      });

      await message.guild.channels.create({
        name: '🔊 Sohbet Odası 1',
        type: ChannelType.GuildVoice,
        parent: voiceCategory.id,
      });

      await message.guild.channels.create({
        name: '🔊 Sohbet Odası 2',
        type: ChannelType.GuildVoice,
        parent: voiceCategory.id,
      });

      await message.guild.channels.create({
        name: '🎵 Müzik Odası',
        type: ChannelType.GuildVoice,
        parent: voiceCategory.id,
      });

      await message.guild.channels.create({
        name: '💤 AFK Odası',
        type: ChannelType.GuildVoice,
        parent: voiceCategory.id,
      });

    } catch (error) {
      console.error(error);
    }
  }

  // 3. PİNG
  else if (command === 'ping') {
    const sent = await message.reply('Hesaplanıyor...');
    const ping = sent.createdTimestamp - message.createdTimestamp;
    sent.edit(`Pong! 🏓 Gecikme: **${ping}ms** | WebSocket: **${client.ws.ping}ms**`);
  }

  // 4. PROFİL
  else if (command === 'profil') {
    const target = message.mentions.users.first() || message.author;
    const member = message.guild.members.cache.get(target.id);

    const embed = new EmbedBuilder()
      .setColor('#FF0055')
      .setTitle(`${target.username} - Kullanıcı Profili`)
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'Kullanıcı Adı', value: target.tag, inline: true },
        { name: 'ID', value: target.id, inline: true },
        { name: 'Katılım', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: false }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }

  // 5. TEMİZLE
  else if (command === 'temizle') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply('❌ Mesajları Yönet yetkin yok.');
    }
    const count = parseInt(args[0]);
    if (!count || count < 1 || count > 100) {
      return message.reply('⚠️ 1 ile 100 arasında bir sayı gir.');
    }
    await message.channel.bulkDelete(count, true);
  }

  // 6. BAN
  else if (command === 'ban') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.reply('❌ Üyeleri Yasakla yetkin yok.');
    }
    const target = message.mentions.members.first();
    if (!target) return message.reply('⚠️ Banlanacak kişiyi etiketle.');
    await target.ban();
    message.channel.send(`🔨 **${target.user.tag}** yasaklandı.`);
  }

  // 7. ZAR
  else if (command === 'zar') {
    const result = Math.floor(Math.random() * 6) + 1;
    message.reply(`🎲 Zar: **${result}**`);
  }

  // 8. SAAT
  else if (command === 'saat') {
    const time = new Date().toLocaleTimeString('tr-TR', { timeZone: 'Europe/Istanbul' });
    message.reply(`🕒 Saat: **${time}**`);
  }
});

// Bot token'ı Render gizli kasasından okunur
client.login(process.env.DISCORD_TOKEN);
              
