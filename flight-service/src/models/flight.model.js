const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Flight = sequelize.define('Flight', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  flightNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  airline: {
    type: DataTypes.STRING,
    allowNull: false
  },
  origin: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Kalkış havaalanı kodu (örn: IST)'
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Varış havaalanı kodu (örn: AYT)'
  },
  departureTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  arrivalTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  totalSeats: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 180
  },
  availableSeats: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 180
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'delayed', 'cancelled', 'completed'),
    defaultValue: 'scheduled'
  },
  basePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Base price for the flight'
  },
  duration: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Flight duration in hours'
  }
}, {
  timestamps: true,
  tableName: 'flights',
  indexes: [
    {
      unique: true,
      fields: ['flightNumber']
    },
    {
      fields: ['origin', 'destination']
    },
    {
      fields: ['departureTime']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = Flight;
