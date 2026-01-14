const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Flight = require('./flight.model');

const FlightInventory = sequelize.define('FlightInventory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  flightId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'flights',
      key: 'id'
    },
    comment: 'Reference to flight'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Flight date (YYYY-MM-DD)'
  },
  totalSeats: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 180,
    comment: 'Total seats for this date'
  },
  availableSeats: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 180,
    comment: 'Available seats for this date'
  },
  bookedSeats: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Number of booked seats'
  },
  basePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Base price for this date'
  },
  status: {
    type: DataTypes.ENUM('available', 'full', 'cancelled'),
    defaultValue: 'available',
    comment: 'Inventory status'
  }
}, {
  timestamps: true,
  tableName: 'flight_inventories',
  indexes: [
    {
      unique: true,
      fields: ['flightId', 'date']
    },
    {
      fields: ['date']
    },
    {
      fields: ['status']
    }
  ]
});

// Flight ile ilişki
FlightInventory.belongsTo(Flight, {
  foreignKey: 'flightId',
  as: 'flight'
});

Flight.hasMany(FlightInventory, {
  foreignKey: 'flightId',
  as: 'inventories'
});

module.exports = FlightInventory;
