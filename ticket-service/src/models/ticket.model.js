const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'Bileti satın alan kullanıcı'
  },
  flightId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'Uçuş ID (Flight Service)'
  },
  passengers: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Yolcu bilgileri array [{name, surname, tcNo, birthDate}]'
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentType: {
    type: DataTypes.ENUM('CARD', 'MILES'),
    allowNull: false,
    defaultValue: 'CARD',
    comment: 'Ödeme tipi: Kredi Kartı veya Miles & Smiles'
  },
  milesUsed: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Kullanılan Miles puanı'
  },
  milesEarned: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Kazanılan Miles puanı'
  },
  memberNo: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Miles & Smiles üye numarası'
  },
  paymentId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Ödeme transaction ID'
  },
  status: {
    type: DataTypes.ENUM('confirmed', 'cancelled', 'refunded'),
    defaultValue: 'confirmed'
  },
  pnr: {
    type: DataTypes.STRING(6),
    allowNull: true,
    unique: true,
    comment: 'Passenger Name Record - rezervasyon kodu'
  }
}, {
  timestamps: true,
  tableName: 'tickets',
  hooks: {
    beforeCreate: (ticket) => {
      // PNR oluştur (6 karakter)
      ticket.pnr = Math.random().toString(36).substr(2, 6).toUpperCase();
    }
  }
});

module.exports = Ticket;
