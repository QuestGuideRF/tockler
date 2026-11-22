CREATE TABLE `AppSettings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`color` text
);
CREATE UNIQUE INDEX `AppSettings_name_unique` ON `AppSettings` (`name`);
CREATE INDEX `app_settings_name` ON `AppSettings` (`name`);
CREATE TABLE `Settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`jsonData` text
);
CREATE UNIQUE INDEX `Settings_name_unique` ON `Settings` (`name`);
CREATE INDEX `settings_name` ON `Settings` (`name`);
CREATE TABLE `TrackItems` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`app` text NOT NULL,
	`taskName` text,
	`title` text,
	`url` text,
	`color` text,
	`beginDate` integer NOT NULL,
	`endDate` integer NOT NULL
);
CREATE INDEX `track_items_begin_date` ON `TrackItems` (`beginDate`);
CREATE INDEX `track_items_end_date` ON `TrackItems` (`endDate`);
CREATE INDEX `track_items_task_name` ON `TrackItems` (`taskName`);