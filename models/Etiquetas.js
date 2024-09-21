
const Etiquetas = sequelize.define('Etiquetas', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      adminId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      name:{
        type: DataTypes.STRING,
        allowNull: true,
      },
      color:{
        type: DataTypes.STRING,
        allowNull: true,
      }
}, {
    tableName: 'etiquetas',
    timestamps: true, 
  })