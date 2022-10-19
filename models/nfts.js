const nfts = (sequelize, dataTypes) => {
    const nfts = sequelize.define("nfts", {
        name: {
            type: dataTypes.STRING,
            allowNull: false,
        },
        royalty: {
            type: dataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        physical: {
            type: dataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        description: {
            type: dataTypes.STRING,
            allowNull: true,
        },
        url: {
            type: dataTypes.STRING,
            allowNull: false,
            validate: {
                isUrl: true
            }
        },
        lazyMint: {
            type: dataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        price: {
            type: dataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        listingType: {
            type: dataTypes.ENUM("AUCTION", "NORMAL"),
            allowNull: false,
            defaultValue: "NORMAL"
        },
        timeout: {
            type: dataTypes.DATE,
            allowNull: true,
        },
        advancedSetting: {
            type: dataTypes.JSON,
            allowNull: true,
            
        },
    })

    nfts.associate = (models) => {
        nfts.hasMany(models.nftLikes, {
            foreignKey: {
                allowNull: false
            },
            onDelete: "cascade"
        })
        nfts.hasMany(models.nftFavorites, {
            foreignKey: {
                allowNull: false
            },
            onDelete: "cascade"
        })

        nfts.belongsTo(models.collections);
        nfts.belongsTo(models.chains)
        nfts.belongsTo(models.users, {
            foreignKey: {
                allowNull: false
            },
            onDelete: "cascade"
        })
        nfts.belongsTo(models.categories)
    }

    return nfts
}

module.exports = nfts