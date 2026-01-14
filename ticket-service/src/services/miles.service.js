const MilesMember = require('../models/miles-member.model');

class MilesService {
  // Mil ekle
  async addMiles(userId, miles, description = 'Bilet satın alma') {
    try {
      // Kullanıcının miles üyeliğini bul veya oluştur
      let member = await MilesMember.findOne({ where: { userId } });

      if (!member) {
        member = await MilesMember.create({
          userId,
          totalMiles: 0,
          availableMiles: 0,
          tier: 'classic'
        });
      }

      // Mil ekle
      member.totalMiles += miles;
      member.availableMiles += miles;

      // Tier kontrolü
      member.tier = this.calculateTier(member.totalMiles);

      await member.save();

      console.log(`✅ ${userId} kullanıcısına ${miles} mil eklendi`);
      return member;
    } catch (error) {
      console.error('Miles ekleme hatası:', error);
      throw error;
    }
  }

  // Mil kullan
  async useMiles(userId, memberNo, miles) {
    const member = await MilesMember.findOne({ where: { userId, membershipNumber: memberNo } });

    if (!member) {
      throw new Error('Miles üyeliği bulunamadı');
    }

    if (member.availableMiles < miles) {
      throw new Error('Yeterli mil yok');
    }

    member.availableMiles -= miles;
    await member.save();

    return member;
  }

  // Mil bakiyesini getir
  async getMilesBalance(userId, memberNo) {
    const member = await MilesMember.findOne({ where: { userId, membershipNumber: memberNo } });

    if (!member) {
      return 0; // Üyelik yoksa bakiye 0
    }

    return member.availableMiles;
  }

  // Kullanıcının mil bilgisini getir
  async getUserMiles(userId) {
    return await MilesMember.findOne({ where: { userId } });
  }

  // Tier hesaplama
  calculateTier(totalMiles) {
    if (totalMiles >= 40000) return 'elite-plus';
    if (totalMiles >= 25000) return 'elite';
    return 'classic';
  }

  /**
   * Deterministik mil hesaplama - Uçuş mesafesine göre
   * Assumption:
   * - Ekonomi: Her 1 km için 1 mil
   * - Business: Her 1 km için 1.5 mil
   * - First Class: Her 1 km için 2 mil
   *
   * Mesafe hesaplama yoksa base formula:
   * - Ekonomi: price * 0.1
   * - Business: price * 0.15
   * - First: price * 0.2
   */
  calculateFlightMiles(price, cabin = 'economy', distance = null) {
    if (distance) {
      // Mesafeye göre hesaplama
      const multipliers = {
        economy: 1.0,
        business: 1.5,
        first: 2.0
      };
      return Math.floor(distance * (multipliers[cabin] || 1.0));
    }

    // Fiyata göre deterministik hesaplama
    const multipliers = {
      economy: 0.1,
      business: 0.15,
      first: 0.2
    };

    return Math.floor(price * (multipliers[cabin] || 0.1));
  }
}

module.exports = new MilesService();
