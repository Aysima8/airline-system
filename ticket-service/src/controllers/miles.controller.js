const milesService = require('../services/miles.service');

class MilesController {
  // Miles ekle (scheduler veya admin için)
  async addMiles(req, res) {
    try {
      const { userId, memberNo, miles, reason } = req.body;

      if (!userId || !memberNo || !miles) {
        return res.status(400).json({
          success: false,
          message: 'userId, memberNo ve miles parametreleri gerekli'
        });
      }

      const member = await milesService.addMiles(userId, miles, reason || 'Manuel ekleme');

      res.status(200).json({
        success: true,
        message: `${miles} mil eklendi`,
        data: {
          userId,
          memberNo,
          totalMiles: member.totalMiles,
          availableMiles: member.availableMiles,
          tier: member.tier
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Kullanıcının miles bilgisini getir
  async getUserMiles(req, res) {
    try {
      const userId = req.user.id;
      const member = await milesService.getUserMiles(userId);

      if (!member) {
        return res.status(404).json({
          success: false,
          message: 'Miles üyeliği bulunamadı'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          membershipNumber: member.membershipNumber,
          totalMiles: member.totalMiles,
          availableMiles: member.availableMiles,
          tier: member.tier
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new MilesController();
