exports.up = function (knex) {
    const trackItemsTable = knex.schema.hasTable('TrackItem').then(function (oldExists) {
        if (oldExists) {
            return knex.schema.hasTable('TrackItem').then(function (newExists) {
                if (newExists) {
                    return knex.schema.dropTable('TrackItem');
                } else {
                    return knex.schema.renameTable('TrackItem', 'TrackItems');
                }
            });
        } else {
            return knex.schema.hasTable('TrackItems').then(function (newExists) {
                if (!newExists) {
                    return knex.schema.createTable('TrackItems', function (table) {
                        table.increments('id');
                        table.string('app', 255);
                        table.string('taskName', 255);
                        table.string('title', 255);
                        table.string('color', 10);
                        table.dateTime('beginDate');
                        table.dateTime('endDate');
                    });
                }
            });
        }
    });
    const appSettingTable = knex.schema.hasTable('AppSetting').then(function (oldExists) {
        if (oldExists) {
            return knex.schema.hasTable('AppSettings').then(function (newExists) {
                if (newExists) {
                    return knex.schema.dropTable('AppSetting');
                } else {
                    return knex.schema.renameTable('AppSetting', 'AppSettings');
                }
            });
        } else {
            return knex.schema.hasTable('AppSettings').then(function (newExists) {
                if (!newExists) {
                    return knex.schema
                        .createTable('AppSettings', function (table) {
                            table.increments('id');
                            table.string('name', 255);
                            table.string('color', 255);
                        })
                        .then(function () {
                            return knex('AppSettings').insert([
                                { name: 'ONLINE', color: '#7ed321' },
                                { name: 'OFFLINE', color: '#f31b1b' },
                                { name: 'IDLE', color: '#f5a623' },
                            ]);
                        });
                }
            });
        }
    });
    return Promise.all(
        [trackItemsTable, appSettingTable].map((p) => p.catch((e) => console.error(e))),
    )
        .then((results) =>
            knex.schema.hasTable('Settings').then(function (newExists) {
                if (!newExists) {
                    return knex.schema.createTable('Settings', function (table) {
                        table.increments('id');
                        table.string('name', 255);
                        table.string('jsonData', 255);
                    });
                }
            }),
        )
        .catch((e) => console.log(e));
};
exports.down = function (knex) {
    return knex.schema.dropTable('TrackItems').dropTable('AppSettings').dropTable('Settings');
};