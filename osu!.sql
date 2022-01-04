SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `osu!` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `osu!`;

CREATE TABLE `friends` (
  `user` int(11) NOT NULL,
  `friendsWith` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `scores` (
  `id` int(11) NOT NULL,
  `userid` int(11) NOT NULL,
  `beatmap_md5` varchar(32) NOT NULL DEFAULT '',
  `username` varchar(30) NOT NULL DEFAULT '',
  `score` bigint(20) NOT NULL,
  `max_combo` int(11) NOT NULL DEFAULT '0',
  `full_combo` tinyint(1) NOT NULL DEFAULT '0',
  `mods` int(11) NOT NULL DEFAULT '0',
  `300_count` int(11) NOT NULL DEFAULT '0',
  `100_count` int(11) NOT NULL DEFAULT '0',
  `50_count` int(11) NOT NULL DEFAULT '0',
  `katus_count` int(11) NOT NULL DEFAULT '0',
  `gekis_count` int(11) NOT NULL DEFAULT '0',
  `misses_count` int(11) NOT NULL DEFAULT '0',
  `time` varchar(18) NOT NULL DEFAULT '',
  `play_mode` tinyint(4) NOT NULL DEFAULT '0',
  `completed` tinyint(11) NOT NULL DEFAULT '0',
  `accuracy` float(15,12) DEFAULT NULL,
  `pp` float NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `users_info` (
  `id` int(11) NOT NULL,
  `username` varchar(15) NOT NULL,
  `username_safe` varchar(15) NOT NULL,
  `password` text NOT NULL,
  `email` text NOT NULL,
  `country` varchar(2) NOT NULL,
  `reg_date` datetime NOT NULL,
  `last_login_date` datetime NOT NULL,
  `last_played_mode` tinyint(4) NOT NULL,
  `online_now` tinyint(1) NOT NULL,
  `tags` int(11) NOT NULL,
  `supporter` tinyint(1) NOT NULL,
  `web_session` varchar(64) NOT NULL,
  `verification_needed` tinyint(1) NOT NULL DEFAULT '0',
  `password_change_required` tinyint(1) NOT NULL,
  `has_old_password` tinyint(1) NOT NULL DEFAULT '0',
  `away_message` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `users_modes_info` (
  `n` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `mode_id` tinyint(4) NOT NULL,
  `count300` int(10) UNSIGNED NOT NULL,
  `count100` int(10) UNSIGNED NOT NULL,
  `count50` int(10) UNSIGNED NOT NULL,
  `countmiss` int(10) UNSIGNED NOT NULL,
  `playcount` int(10) UNSIGNED NOT NULL,
  `total_score` int(10) UNSIGNED NOT NULL,
  `ranked_score` int(11) UNSIGNED NOT NULL,
  `pp_rank` int(11) NOT NULL,
  `pp_raw` int(11) NOT NULL DEFAULT '1',
  `count_rank_ss` int(10) UNSIGNED NOT NULL,
  `count_rank_s` int(10) UNSIGNED NOT NULL,
  `count_rank_a` int(10) UNSIGNED NOT NULL,
  `pp_country_rank` int(11) NOT NULL,
  `playtime` bigint(255) NOT NULL DEFAULT '0',
  `avg_accuracy` float NOT NULL DEFAULT '0',
  `level` int(255) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `web_info` (
  `i` int(11) NOT NULL,
  `HomepageText` varchar(255) NOT NULL DEFAULT 'A default Binato instance!'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `web_prefs` (
  `id` int(11) NOT NULL,
  `keyboard` tinyint(1) NOT NULL DEFAULT '0',
  `mouse` tinyint(1) NOT NULL DEFAULT '0',
  `tablet` tinyint(1) NOT NULL DEFAULT '0',
  `touch` tinyint(1) NOT NULL DEFAULT '0',
  `location` varchar(32) NOT NULL,
  `interests` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `web_titles` (
  `id` int(11) NOT NULL,
  `title` varchar(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


ALTER TABLE `scores`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `users_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

ALTER TABLE `users_modes_info`
  ADD PRIMARY KEY (`n`);

ALTER TABLE `web_info`
  ADD PRIMARY KEY (`i`);

ALTER TABLE `web_prefs`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `web_titles`
  ADD PRIMARY KEY (`id`);


ALTER TABLE `scores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=0;

ALTER TABLE `users_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=100;

ALTER TABLE `users_modes_info`
  MODIFY `n` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=0;

INSERT INTO `web_info` (`i`, `HomepageText`) VALUES ('0', 'A default Binato instance!');