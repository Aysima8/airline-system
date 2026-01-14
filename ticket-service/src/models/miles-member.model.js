const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MilesMember = sequelize.define('MilesMember', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    comment: 'Kullanıcı ID'
  },
  membershipNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    comment: 'Miles & Smiles üyelik numarası'
  },
  totalMiles: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Toplam kazanılan mil'
  },
  availableMiles: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Kullanılabilir mil'
  },
  tier: {
    type: DataTypes.ENUM('classic', 'elite', 'elite-plus'),
    defaultValue: 'classic',
    comment: 'Üyelik seviyesi'
  }
}, {
  timestamps: true,
  tableName: 'miles_members',
  hooks: {
    beforeCreate: (member) => {
      // Üyelik numarası oluştur (12 haneli)
      member.membershipNumber = `MS${Date.now()}${Math.floor(Math.random() * 100)}`;
    }
  }
});

module.exports = MilesMember;
